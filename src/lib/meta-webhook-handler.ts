import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import {
  getDefaultMetaConfig,
  parseMetaWebhookPayload,
  sendWhatsAppTextMessage,
  testMetaCredentials,
} from "./meta-client";
import {
  exchangeIgCodeForLongLivedToken,
  getIgUserProfile,
  subscribeIgWebhook,
  sendIgDirectMessage,
  parseIgWebhookPayload,
  buildIgAuthUrl,
  getIgConfig,
  fetchIgConversations,
  type ExtractedIgMessage,
} from "./instagram-client";

// Server-side admin client using service-role key to bypass RLS for webhooks & OAuth
let _cachedAdminClient: SupabaseClient | null = null;
export function getAdminClient(): SupabaseClient {
  if (_cachedAdminClient) return _cachedAdminClient;
  const serviceKey =
    (typeof process !== "undefined" && process.env?.["SUPABASE_SERVICE_ROLE_KEY"]) ||
    (import.meta.env?.["VITE_SUPABASE_SERVICE_ROLE_KEY"] as string) ||
    (import.meta.env?.["SUPABASE_SERVICE_ROLE_KEY"] as string) ||
    "";
  const url =
    (import.meta.env?.["VITE_SUPABASE_URL"] as string) ||
    (typeof process !== "undefined" && process.env?.["SUPABASE_URL"]) ||
    "https://placeholder.supabase.co";

  if (serviceKey && serviceKey !== "placeholder") {
    _cachedAdminClient = createClient(url, serviceKey, {
      auth: { persistSession: false },
    });
    return _cachedAdminClient;
  }
  return supabase;
}

// In-memory OAuth state mapping with TTL to securely bind Instagram OAuth to stores
const oauthStateMap: Map<string, { storeId: string; createdAt: number }> = new Map();

// In-memory buffer to guarantee zero-loss realtime messaging in all environments (no static mock data)
export interface StoredConversation {
  id: string;
  store_id?: string;
  channel: "whatsapp" | "instagram" | "facebook";
  external_id: string;
  customer_name: string;
  last_message_at: string;
  unread_count?: number;
  messages: StoredMessage[];
}

export interface StoredMessage {
  id: string;
  conversation_id: string;
  direction: "inbound" | "outbound";
  content: string;
  message_type: string;
  created_at: string;
  status?: "sent" | "delivered" | "read";
  platform_data?: any;
}

// Live buffer - contains only genuine incoming and outbound messages
const liveConversationsStore: Map<string, StoredConversation> = new Map();

export async function handleMetaWebhookGet(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  const config = getDefaultMetaConfig();

  // Meta Webhook Verification Challenge
  if (mode === "subscribe" && token === config.verifyToken) {
    console.log("Meta Webhook verified successfully with challenge:", challenge);
    return new Response(challenge || "", {
      status: 200,
      headers: { "content-type": "text/plain" },
    });
  }

  console.warn("Meta Webhook verification failed. Token mismatch or invalid mode.");
  return new Response("Forbidden: Verification token mismatch", { status: 403 });
}

export async function handleMetaWebhookPost(request: Request): Promise<Response> {
  try {
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);

    // ── WhatsApp Cloud API events ──────────────────────────────────────────
    const whatsappMessages = parseMetaWebhookPayload(body);
    for (const item of whatsappMessages) {
      await _persistInboundMessage(item);
    }

    // ── Instagram Business API events ─────────────────────────────────────
    if (body.object === "instagram") {
      const igMessages = parseIgWebhookPayload(body);
      for (const item of igMessages) {
        // Skip echo messages (sent by the merchant's own page)
        if (item.isEcho) continue;
        await _persistInboundIgMessage(item);
      }
    }

    const total = whatsappMessages.length;
    return new Response(JSON.stringify({ status: "success", count: total }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err: any) {
    console.error("Error processing Meta webhook POST:", err);
    // Always return 200 so Meta doesn't retry aggressively
    return new Response(JSON.stringify({ status: "error", error: err.message }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }
}

/** Persist a WhatsApp inbound message (in-memory + Supabase) */
async function _persistInboundMessage(item: ReturnType<typeof parseMetaWebhookPayload>[0]) {
  const convKey = `${item.channel}_${item.senderId}`;
  let conv = liveConversationsStore.get(convKey);

  const newMsg: StoredMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    conversation_id: convKey,
    direction: "inbound",
    content: item.text,
    message_type: "text",
    created_at: item.timestamp,
    status: "delivered",
    platform_data: item.rawPayload,
  };

  if (!conv) {
    conv = {
      id: convKey,
      channel: item.channel,
      external_id: item.senderId,
      customer_name: (item as any).senderName || item.senderId,
      last_message_at: item.timestamp,
      unread_count: 1,
      messages: [newMsg],
    };
  } else {
    conv.last_message_at = item.timestamp;
    conv.unread_count = (conv.unread_count || 0) + 1;
    conv.messages.push(newMsg);
  }
  liveConversationsStore.set(convKey, conv);

  try {
    const admin = getAdminClient();
    let storeId: string | null = null;
    const phoneId = (item as any).phoneNumberId || (item.rawPayload as any)?.metadata?.phone_number_id;
    if (phoneId) {
      const { data: integ } = await admin
        .from("meta_integrations")
        .select("store_id")
        .eq("phone_number_id", phoneId)
        .maybeSingle();
      if (integ?.store_id) storeId = integ.store_id;
    }

    // Security: Do NOT dump webhook messages into a random store if phoneId is unmapped
    if (!storeId) {
      console.warn("Inbound WhatsApp message ignored: no store mapped to phoneId:", phoneId);
      return;
    }

    let { data: dbConv } = await admin
      .from("conversations")
      .select("id")
      .eq("store_id", storeId)
      .eq("channel", item.channel)
      .eq("external_id", item.senderId)
      .maybeSingle();

    if (!dbConv) {
      const { data: inserted } = await admin
        .from("conversations")
        .insert({
          store_id: storeId,
          channel: item.channel,
          external_id: item.senderId,
          customer_name: (item as any).senderName || item.senderId,
          last_message_at: item.timestamp,
          unread_count: 1,
        })
        .select("id")
        .single();
      dbConv = inserted;
    } else {
      await admin
        .from("conversations")
        .update({ last_message_at: item.timestamp, unread_count: supabase.rpc as any })
        .eq("id", dbConv.id);
    }

    if (dbConv?.id) {
      // Dedup by external_message_id
      const { data: existing } = await admin
        .from("messages")
        .select("id")
        .eq("external_message_id", item.messageId)
        .maybeSingle();
      if (!existing) {
        await admin.from("messages").insert({
          conversation_id: dbConv.id,
          store_id: storeId,
          direction: "inbound",
          content: item.text,
          message_type: "text",
          external_message_id: item.messageId,
          platform_data: { message_id: item.messageId, sender_name: (item as any).senderName },
        });
      }
    }
  } catch (dbErr) {
    console.warn("WA DB sync notice (in-memory preserved):", dbErr);
  }
}

/** Persist an Instagram inbound message (in-memory + Supabase) */
async function _persistInboundIgMessage(item: ExtractedIgMessage) {
  const convKey = `instagram_${item.senderId}`;
  let conv = liveConversationsStore.get(convKey);

  const newMsg: StoredMessage = {
    id: `igmsg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    conversation_id: convKey,
    direction: "inbound",
    content: item.text,
    message_type: item.attachmentType || "text",
    created_at: item.timestamp,
    status: "delivered",
    platform_data: item.rawPayload,
  };

  if (!conv) {
    conv = {
      id: convKey,
      channel: "instagram",
      external_id: item.senderId,
      customer_name: `مستخدم إنستجرام (${item.senderId.slice(-4)})`,
      last_message_at: item.timestamp,
      unread_count: 1,
      messages: [newMsg],
    };
  } else {
    conv.last_message_at = item.timestamp;
    conv.unread_count = (conv.unread_count || 0) + 1;
    conv.messages.push(newMsg);
  }
  liveConversationsStore.set(convKey, conv);

  try {
    const admin = getAdminClient();
    // Route to the correct store via instagram_integrations (by ig_page_id = recipient)
    let storeId: string | null = null;
    if (item.recipientId) {
      const { data: igInteg } = await admin
        .from("instagram_integrations")
        .select("store_id, ig_user_id, ig_access_token")
        .eq("ig_page_id", item.recipientId)
        .maybeSingle();
      if (igInteg?.store_id) storeId = igInteg.store_id;
    }

    // Security: Do NOT dump webhook messages into a random store if page is unmapped
    if (!storeId) {
      console.warn("Inbound IG message ignored: no store mapped to recipientId:", item.recipientId);
      return;
    }

    // Dedup check first
    const { data: existingMsg } = await admin
      .from("messages")
      .select("id")
      .eq("external_message_id", item.messageId)
      .maybeSingle();
    if (existingMsg) return; // already processed

    // Find or create conversation
    let { data: dbConv } = await admin
      .from("conversations")
      .select("id, unread_count")
      .eq("store_id", storeId)
      .eq("channel", "instagram")
      .eq("external_id", item.senderId)
      .maybeSingle();

    if (!dbConv) {
      const { data: inserted } = await admin
        .from("conversations")
        .insert({
          store_id: storeId,
          channel: "instagram",
          external_id: item.senderId,
          sender_id: item.senderId,
          customer_name: `مستخدم إنستجرام (${item.senderId.slice(-4)})`,
          last_message_at: item.timestamp,
          unread_count: 1,
          platform_data: { ig_page_id: item.recipientId },
        })
        .select("id, unread_count")
        .single();
      dbConv = inserted;
    } else {
      await admin
        .from("conversations")
        .update({
          last_message_at: item.timestamp,
          unread_count: (dbConv.unread_count || 0) + 1,
        })
        .eq("id", dbConv.id);
    }

    if (dbConv?.id) {
      await admin.from("messages").insert({
        conversation_id: dbConv.id,
        store_id: storeId,
        direction: "inbound",
        content: item.text,
        message_type: item.attachmentType || "text",
        external_message_id: item.messageId,
        platform_data: {
          ig_sender_id: item.senderId,
          ig_recipient_id: item.recipientId,
          attachment_url: item.attachmentUrl,
          raw: item.rawPayload,
        },
      });
    }
  } catch (dbErr) {
    console.warn("IG DB sync notice (in-memory preserved):", dbErr);
  }
}

export async function handleSendMessageApi(request: Request): Promise<Response> {
  try {
    const { conversationId, to, text, channel = "whatsapp" } = await request.json();

    if (!text || (!to && !conversationId)) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required parameters (to/conversationId, text)" }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    let recipient = to;
    let conv = conversationId ? liveConversationsStore.get(conversationId) : undefined;

    if (conv && !recipient) {
      recipient = conv.external_id;
    }

    let metaResult: any = { success: true };

    // If channel is WhatsApp and recipient exists, dispatch to Meta Cloud API
    if (channel === "whatsapp" && recipient) {
      metaResult = await sendWhatsAppTextMessage({
        to: recipient,
        text,
      });

      if (!metaResult.success) {
        return new Response(
          JSON.stringify({
            success: false,
            error: metaResult.error || "Meta WhatsApp Cloud API rejected the message",
            metaResponse: metaResult.data,
          }),
          { status: 502, headers: { "content-type": "application/json" } }
        );
      }
    }

    const newMsg: StoredMessage = {
      id: `out-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      conversation_id: conversationId || recipient,
      direction: "outbound",
      content: text,
      message_type: "text",
      created_at: new Date().toISOString(),
      status: "sent",
      platform_data: metaResult.data,
    };

    if (conv) {
      conv.messages.push(newMsg);
      conv.last_message_at = new Date().toISOString();
      liveConversationsStore.set(conversationId, conv);
    } else if (conversationId) {
      liveConversationsStore.set(conversationId, {
        id: conversationId,
        channel: channel as any,
        external_id: recipient,
        customer_name: recipient,
        last_message_at: new Date().toISOString(),
        messages: [newMsg],
      });
    }

    // Mirror to Supabase if DB conversation exists
    try {
      if (conversationId && !conversationId.startsWith("conv-")) {
        await supabase.from("messages").insert({
          conversation_id: conversationId,
          direction: "outbound",
          content: text,
          message_type: "text",
          platform_data: metaResult.data || {},
        });
        await supabase
          .from("conversations")
          .update({ last_message_at: new Date().toISOString() })
          .eq("id", conversationId);
      }
    } catch (dbErr) {
      console.warn("Database sync notice on outbound:", dbErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: newMsg,
        metaResponse: metaResult.data,
      }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Error sending message:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message || "Failed to send message" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}

export async function handleGetConversationsApi(): Promise<Response> {
  const convs = Array.from(liveConversationsStore.values()).sort(
    (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
  );

  return new Response(JSON.stringify({ success: true, conversations: convs }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

/**
 * GET /api/instagram/auth-url
 * Returns the Instagram OAuth authorization URL for frontend redirect.
 */
export async function handleIgAuthUrlApi(request?: Request): Promise<Response> {
  const cfg = getIgConfig();
  let customRedirect = cfg.redirectUri;
  let storeId = "";

  if (request) {
    const reqUrl = new URL(request.url);
    const paramRedirect = reqUrl.searchParams.get("redirect_uri");
    if (paramRedirect) {
      customRedirect = paramRedirect;
    }
    storeId = reqUrl.searchParams.get("storeId") || "";
    const authHeader = request.headers.get("authorization");
    if (!storeId && authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) {
          const { data: sm } = await supabase
            .from("store_members")
            .select("store_id")
            .eq("user_id", user.id)
            .limit(1)
            .maybeSingle();
          storeId = sm?.store_id || "";
          if (!storeId) {
            const { data: st } = await supabase
              .from("stores")
              .select("id")
              .eq("user_id", user.id)
              .limit(1)
              .maybeSingle();
            storeId = st?.id || "";
          }
        }
      } catch {}
    }
  }

  // Generate secure base64url encoded state containing storeId
  const stateNonce = Math.random().toString(36).substring(2, 10);
  const statePayload = JSON.stringify({ s: storeId, n: stateNonce, t: Date.now() });
  const stateToken = typeof Buffer !== "undefined"
    ? Buffer.from(statePayload).toString("base64url")
    : btoa(statePayload).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  if (storeId) {
    oauthStateMap.set(stateToken, { storeId, createdAt: Date.now() });
  }

  const url = buildIgAuthUrl(customRedirect, stateToken);
  return new Response(
    JSON.stringify({
      success: true,
      url,
      redirectUri: customRedirect || cfg.redirectUri,
      appId: cfg.appId,
      state: stateToken,
    }),
    {
      status: 200,
      headers: { "content-type": "application/json" },
    }
  );
}

/**
 * GET /api/instagram/oauth/callback?code=...
 * Handles the OAuth redirect, exchanges code for long-lived token,
 * fetches IG profile, saves to instagram_integrations, subscribes webhook.
 */
export async function handleIgOAuthCallbackApi(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const errorReason = url.searchParams.get("error_reason");
  const errorDescription = url.searchParams.get("error_description");

  if (error || errorReason || errorDescription) {
    const errorMsg = errorDescription || errorReason || error || "Unknown OAuth error";
    return new Response(
      `<html><body><script>window.opener?.postMessage({type:'ig_oauth_error',error:${JSON.stringify(errorMsg)}},'*');window.close();</script><p>Error: ${errorMsg}. You may close this window.</p></body></html>`,
      { status: 400, headers: { "content-type": "text/html; charset=utf-8" } }
    );
  }

  if (!code) {
    return new Response(JSON.stringify({ success: false, error: "No code provided" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    // 1. Exchange code → long-lived token using callback origin if needed
    const callbackRedirectUri = `${url.origin}${url.pathname}`;
    const tokenResult = await exchangeIgCodeForLongLivedToken(code, callbackRedirectUri);
    if (!tokenResult.success || !tokenResult.accessToken) {
      throw new Error(tokenResult.error || "Token exchange failed");
    }

    const accessToken = tokenResult.accessToken;
    const igUserId = tokenResult.userId || "";

    // 2. Fetch IG profile
    const profileResult = await getIgUserProfile(accessToken);
    if (!profileResult.success || !profileResult.profile) {
      throw new Error(profileResult.error || "Failed to fetch IG profile");
    }

    const profile = profileResult.profile;
    const tokenExpiresAt = tokenResult.expiresIn
      ? new Date(Date.now() + tokenResult.expiresIn * 1000).toISOString()
      : null;

    // 3. Subscribe to Instagram webhooks
    const subResult = await subscribeIgWebhook(profile.id, accessToken);
    if (!subResult.success) {
      console.warn("IG webhook subscription failed (non-fatal):", subResult.error);
    }

    // 4. Resolve store ID strictly from OAuth state or query
    const stateParam = url.searchParams.get("state");
    let storeId: string | null = null;
    if (stateParam) {
      const memoryState = oauthStateMap.get(stateParam);
      if (memoryState?.storeId) {
        storeId = memoryState.storeId;
      } else {
        try {
          const rawJson = typeof Buffer !== "undefined"
            ? Buffer.from(stateParam, "base64url").toString("utf-8")
            : atob(stateParam.replace(/-/g, "+").replace(/_/g, "/"));
          const parsed = JSON.parse(rawJson);
          if (parsed?.s) {
            storeId = parsed.s;
          }
        } catch {}
      }
    }

    if (!storeId) {
      storeId = url.searchParams.get("storeId");
    }

    // Critical Security: Never fallback to stores.limit(1)!
    if (!storeId) {
      throw new Error("تعذر ربط حساب Instagram بمتجر محدد. يرجى بدء عملية الربط مجددًا من لوحة التحكم.");
    }

    const admin = getAdminClient();
    // Upsert into instagram_integrations using admin client
    await admin.from("instagram_integrations").upsert(
      {
        store_id: storeId,
        ig_app_id: getIgConfig().appId,
        ig_page_id: profile.id,
        ig_user_id: igUserId || profile.id,
        ig_username: profile.username,
        ig_name: profile.name || profile.username,
        ig_profile_pic: profile.profile_picture_url,
        ig_access_token: accessToken,
        token_expires_at: tokenExpiresAt,
        status: "connected",
        webhook_subscribed: subResult.success,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "store_id,ig_page_id" }
    );

    // Also mark Instagram as connected in store platforms JSONB
    await admin
      .from("stores")
      .update({ platforms: supabase.rpc as any })
      .eq("id", storeId);

    // 5. Return a success HTML page that closes the popup and notifies the opener
    return new Response(
      `<!DOCTYPE html><html><head><meta charset="utf-8"><title>تم الاتصال بنجاح</title></head><body style="font-family:sans-serif;text-align:center;padding:50px;background:#f8f9fa;">
        <div style="background:white;padding:30px;border-radius:16px;box-shadow:0 4px 12px rgba(0,0,0,0.1);max-width:400px;margin:0 auto;border:2px solid #222;">
          <h2 style="color:#E1306C;margin-bottom:10px;">ðŸŽ‰ ØªÙ… Ø±Ø¨Ø· Instagram Ø¨Ù†Ø¬Ø§Ø­!</h2>
          <p style="font-size:18px;font-weight:bold;">@${profile.username}</p>
          <p style="color:#666;font-size:14px;">ØªÙ… ØªÙØ¹ÙŠÙ„ Ø§Ù„ÙˆØµÙˆÙ„ Ø¥Ù„Ù‰ Ø±Ø³Ø§Ø¦Ù„ Instagram Ø¨Ù†Ø¬Ø§Ø­.</p>
          <p style="color:#888;font-size:12px;">Ø¬Ø§Ø±ÙŠ Ø¥ØºÙ„Ø§Ù‚ Ù‡Ø°Ù‡ Ø§Ù„Ù†Ø§ÙØ°Ø© ÙˆØªØ­Ø¯ÙŠØ« Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ… ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹...</p>
          <button onclick="window.close()" style="margin-top:14px;padding:10px 20px;background:#E1306C;color:#fff;border:none;border-radius:8px;font-weight:bold;cursor:pointer;">Ø¥ØºÙ„Ø§Ù‚ ÙˆØ§Ù„Ø¹ÙˆØ¯Ø© Ù„Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…</button>
        </div>
        <script>
          const payload = {
            type: 'ig_oauth_success',
            username: ${JSON.stringify(profile.username)},
            profilePic: ${JSON.stringify(profile.profile_picture_url || '')},
            igUserId: ${JSON.stringify(profile.id)}
          };

          // 1. Try window.opener postMessage
          try {
            if (window.opener) {
              window.opener.postMessage(payload, '*');
            }
          } catch(e) {}

          // 2. Try BroadcastChannel (for modern browser cross-window sync)
          try {
            const bc = new BroadcastChannel('wasla_oauth');
            bc.postMessage(payload);
          } catch(e) {}

          setTimeout(() => {
            try { window.close(); } catch(e) {}
          }, 2000);
        </script>
      </body></html>`,
      { status: 200, headers: { "content-type": "text/html; charset=utf-8" } }
    );
  } catch (err: any) {
    console.error("IG OAuth callback error:", err);
    return new Response(
      `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:sans-serif;text-align:center;padding:40px;">
        <h3 style="color:#d32f2f;">خطأ في تسجيل الدخول</h3>
        <p>${err.message || "حدث خطأ غير متوقع"}</p>
        <script>
          try {
            window.opener?.postMessage({type:'ig_oauth_error',error:${JSON.stringify(err.message || "Unknown error")}},'*');
          } catch(e) {}
          setTimeout(() => window.close(), 3000);
        </script>
      </body></html>`,
      { status: 400, headers: { "content-type": "text/html; charset=utf-8" } }
    );
  }
}

/**
 * POST /api/instagram/messages/send
 * Send an outbound Instagram DM reply.
 */
export async function handleSendIgMessageApi(request: Request): Promise<Response> {
  try {
    const { conversationId, recipientId, text } = await request.json() as {
      conversationId?: string;
      recipientId?: string;
      text: string;
    };

    if (!text) {
      return new Response(
        JSON.stringify({ success: false, error: "text is required" }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    let targetRecipient = recipientId;

    // Resolve recipient from in-memory store if not provided
    if (!targetRecipient && conversationId) {
      const conv = liveConversationsStore.get(conversationId);
      if (conv) targetRecipient = conv.external_id;
    }

    // Resolve recipient from Supabase conversation if still not found
    if (!targetRecipient && conversationId) {
      const { data: dbConv } = await supabase
        .from("conversations")
        .select("external_id, sender_id")
        .eq("id", conversationId)
        .maybeSingle();
      targetRecipient = dbConv?.sender_id || dbConv?.external_id;
    }

    if (!targetRecipient) {
      return new Response(
        JSON.stringify({ success: false, error: "Could not determine recipient" }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    // Get the store's IG credentials
    const { data: igInteg } = await supabase
      .from("instagram_integrations")
      .select("ig_user_id, ig_access_token, ig_page_id")
      .eq("status", "connected")
      .limit(1)
      .maybeSingle();

    if (!igInteg?.ig_access_token) {
      return new Response(
        JSON.stringify({ success: false, error: "No connected Instagram account found" }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    const sendResult = await sendIgDirectMessage({
      recipientId: targetRecipient,
      text,
      accessToken: igInteg.ig_access_token,
      igUserId: igInteg.ig_user_id || igInteg.ig_page_id,
    });

    if (!sendResult.success) {
      return new Response(
        JSON.stringify({ success: false, error: sendResult.error }),
        { status: 502, headers: { "content-type": "application/json" } }
      );
    }

    // Persist outbound message in Supabase
    try {
      if (conversationId && !conversationId.startsWith("instagram_")) {
        await supabase.from("messages").insert({
          conversation_id: conversationId,
          direction: "outbound",
          content: text,
          message_type: "text",
          external_message_id: sendResult.messageId,
          platform_data: sendResult.data,
        });
        await supabase
          .from("conversations")
          .update({ last_message_at: new Date().toISOString() })
          .eq("id", conversationId);
      }
    } catch (dbErr) {
      console.warn("IG outbound DB sync notice:", dbErr);
    }

    // Mirror in in-memory store
    const convKey = conversationId || `instagram_${targetRecipient}`;
    const conv = liveConversationsStore.get(convKey);
    const outMsg: StoredMessage = {
      id: `ig-out-${Date.now()}`,
      conversation_id: convKey,
      direction: "outbound",
      content: text,
      message_type: "text",
      created_at: new Date().toISOString(),
      status: "sent",
      platform_data: sendResult.data,
    };
    if (conv) {
      conv.messages.push(outMsg);
      conv.last_message_at = new Date().toISOString();
      liveConversationsStore.set(convKey, conv);
    }

    return new Response(
      JSON.stringify({ success: true, messageId: sendResult.messageId }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}

/**
 * GET /api/instagram/status?storeId=...
 * Return the connected Instagram account details for the current store.
 * storeId is required to scope to the correct user's integration.
 */
export async function handleGetIgStatusApi(request?: Request): Promise<Response> {
  try {
    let storeId: string | null = null;
    if (request) {
      const reqUrl = new URL(request.url);
      storeId = reqUrl.searchParams.get("storeId");
      const authHeader = request.headers.get("authorization");
      if (!storeId && authHeader?.startsWith("Bearer ")) {
        try {
          const token = authHeader.replace("Bearer ", "");
          const { data: { user } } = await supabase.auth.getUser(token);
          if (user) {
            const { data: sm } = await supabase
              .from("store_members")
              .select("store_id")
              .eq("user_id", user.id)
              .limit(1)
              .maybeSingle();
            storeId = sm?.store_id || null;
            if (!storeId) {
              const { data: st } = await supabase
                .from("stores")
                .select("id")
                .eq("user_id", user.id)
                .limit(1)
                .maybeSingle();
              storeId = st?.id || null;
            }
          }
        } catch {}
      }
    }

    // Critical Security: If storeId cannot be determined, never return another store's integration!
    if (!storeId) {
      return new Response(
        JSON.stringify({ success: true, integration: null }),
        { status: 200, headers: { "content-type": "application/json" } }
      );
    }

    const admin = getAdminClient();
    const { data: igInteg } = await admin
      .from("instagram_integrations")
      .select("ig_username, ig_name, ig_profile_pic, ig_page_id, status, webhook_subscribed, token_expires_at")
      .eq("store_id", storeId)
      .eq("status", "connected")
      .limit(1)
      .maybeSingle();

    return new Response(
      JSON.stringify({ success: true, integration: igInteg || null }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}

export async function handleTestConnectionApi(request?: Request): Promise<Response> {
  try {
    let customPhoneId: string | undefined = undefined;
    let customToken: string | undefined = undefined;

    if (request) {
      if (request.method === "POST") {
        try {
          const body = await request.json();
          customPhoneId = body.phoneNumberId;
          customToken = body.accessToken;
        } catch {}
      } else if (request.method === "GET") {
        const url = new URL(request.url);
        customPhoneId = url.searchParams.get("phoneNumberId") || undefined;
        customToken = url.searchParams.get("accessToken") || undefined;
      }
    }

    const config = getDefaultMetaConfig();
    const targetPhoneId = customPhoneId?.trim() || config.phoneNumberId;
    const targetToken = customToken?.trim() || config.accessToken;

    const result = await testMetaCredentials({
      phoneNumberId: targetPhoneId,
      accessToken: targetToken,
    });

    return new Response(
      JSON.stringify({
        ...result,
        testedPhoneNumberId: targetPhoneId,
        config: {
          appId: config.appId,
          phoneNumberId: targetPhoneId,
          wabaId: config.wabaId,
          verifyToken: config.verifyToken,
          webhookUrl: "/api/webhooks/meta",
        },
      }),
      {
        status: result.success ? 200 : 400,
        headers: { "content-type": "application/json" },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

/**
 * GET /api/instagram/sync?storeId=...
 * Sync live Instagram conversations & messages from Instagram Graph API into Supabase.
 */
export async function handleSyncIgConversationsApi(request?: Request): Promise<Response> {
  try {
    let storeId: string | null = null;
    if (request) {
      const reqUrl = new URL(request.url);
      storeId = reqUrl.searchParams.get("storeId");
    }

    let query = supabase
      .from("instagram_integrations")
      .select("*")
      .eq("status", "connected")
      .order("updated_at", { ascending: false })
      .limit(1);

    if (storeId) {
      query = query.eq("store_id", storeId);
    }

    const { data: igInteg } = await query.maybeSingle();

    if (!igInteg || !igInteg.ig_access_token) {
      return new Response(
        JSON.stringify({ success: false, error: "لا يوجد حساب إنستجرام متصل حالياً في النظام." }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    const igUserId = igInteg.ig_user_id || igInteg.ig_page_id || "me";
    const token = igInteg.ig_access_token;
    storeId = storeId || igInteg.store_id;

    const result = await fetchIgConversations(token, igUserId);
    if (!result.success || !result.conversations) {
      return new Response(
        JSON.stringify({ success: false, error: result.error || "Failed to fetch conversations" }),
        { status: 500, headers: { "content-type": "application/json" } }
      );
    }

    let syncedMessages = 0;
    for (const conv of result.conversations) {
      const participants = conv.participants?.data || [];
      const otherParticipant = participants.find((p: any) => p.id !== igUserId) || participants[0];
      const customerName = otherParticipant?.username ? `@${otherParticipant.username}` : `مستخدم إنستجرام (${conv.id.slice(-4)})`;
      const externalId = otherParticipant?.id || conv.id;

      // Upsert conversation in Supabase
      let { data: dbConv } = await supabase
        .from("conversations")
        .select("id")
        .eq("store_id", storeId)
        .eq("channel", "instagram")
        .eq("external_id", externalId)
        .maybeSingle();

      if (!dbConv) {
        const { data: newConv } = await supabase
          .from("conversations")
          .insert({
            store_id: storeId,
            channel: "instagram",
            external_id: externalId,
            sender_id: externalId,
            customer_name: customerName,
            last_message_at: conv.updated_time || new Date().toISOString(),
            unread_count: 0,
            platform_data: { ig_conversation_id: conv.id },
          })
          .select("id")
          .single();
        dbConv = newConv;
      }

      if (dbConv?.id && Array.isArray(conv.messages?.data)) {
        for (const msg of conv.messages.data) {
          const isOutbound = msg.from?.id === igUserId;
          const { data: existingMsg } = await supabase
            .from("messages")
            .select("id")
            .eq("external_message_id", msg.id)
            .maybeSingle();

          if (!existingMsg) {
            await supabase.from("messages").insert({
              conversation_id: dbConv.id,
              store_id: storeId,
              direction: isOutbound ? "outbound" : "inbound",
              content: msg.message || "[رسالة إنستجرام]",
              message_type: "text",
              external_message_id: msg.id,
              created_at: msg.created_time || new Date().toISOString(),
              platform_data: { raw: msg },
            });
            syncedMessages++;
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        conversationsCount: result.conversations.length,
        messagesSynced: syncedMessages,
        account: {
          username: igInteg.ig_username,
          pageId: igInteg.ig_page_id,
        },
      }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}

/**
 * POST /api/instagram/conversations/create
 * Start a new Instagram DM conversation with a customer.
 * Body: { customerName, externalId?, initialMessage, storeId? }
 */
export async function handleCreateIgConversationApi(request: Request): Promise<Response> {
  try {
    const body = await request.json() as {
      customerName: string;
      externalId?: string;
      initialMessage: string;
      storeId?: string;
    };

    if (!body.customerName || !body.initialMessage) {
      return new Response(
        JSON.stringify({ success: false, error: "اسم العميل والرسالة مطلوبان" }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    // Use storeId from body if provided or resolve from auth header
    let storeId: string | undefined = body.storeId;
    if (!storeId) {
      const authHeader = request.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        try {
          const token = authHeader.replace("Bearer ", "");
          const { data: { user } } = await supabase.auth.getUser(token);
          if (user) {
            const { data: sm } = await supabase
              .from("store_members")
              .select("store_id")
              .eq("user_id", user.id)
              .limit(1)
              .maybeSingle();
            storeId = sm?.store_id || undefined;
            if (!storeId) {
              const { data: st } = await supabase
                .from("stores")
                .select("id")
                .eq("user_id", user.id)
                .limit(1)
                .maybeSingle();
              storeId = st?.id || undefined;
            }
          }
        } catch {}
      }
    }
    if (!storeId) {
      return new Response(
        JSON.stringify({ success: false, error: "لم يتم العثور على المتجر" }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    const externalId = body.externalId?.trim() || `ig_${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();

    const { data: conv, error: convErr } = await supabase
      .from("conversations")
      .insert({
        store_id: storeId,
        channel: "instagram",
        external_id: externalId,
        sender_id: externalId,
        customer_name: body.customerName.startsWith("@") ? body.customerName : `@${body.customerName}`,
        last_message_at: now,
        unread_count: 0,
      })
      .select("id")
      .single();

    if (convErr || !conv?.id) {
      throw new Error(convErr?.message || "فشل إنشاء المحادثة");
    }

    const { error: msgErr } = await supabase.from("messages").insert({
      conversation_id: conv.id,
      store_id: storeId,
      direction: "outbound",
      content: body.initialMessage,
      message_type: "text",
      created_at: now,
    });

    if (msgErr) throw msgErr;

    // If externalId is a numeric Meta Scoped ID, attempt outbound DM via Graph API
    if (/^\d{10,}$/.test(externalId)) {
      const { data: igInteg } = await supabase
        .from("instagram_integrations")
        .select("ig_access_token, ig_user_id, ig_page_id")
        .eq("status", "connected")
        .limit(1)
        .maybeSingle();

      if (igInteg?.ig_access_token) {
        await sendIgDirectMessage({
          recipientId: externalId,
          text: body.initialMessage,
          accessToken: igInteg.ig_access_token,
          igUserId: igInteg.ig_user_id || igInteg.ig_page_id,
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, conversationId: conv.id }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}

/**
 * POST /api/instagram/test-inbound
 * Test / simulate an inbound Instagram DM from a customer.
 * Body: { customerName?, text?, storeId? }
 */
export async function handleSimulateInboundIgMessageApi(request: Request): Promise<Response> {
  try {
    const body = await request.json() as {
      customerName?: string;
      text?: string;
      storeId?: string;
    };

    const customerHandle = body.customerName?.trim() || "@customer_cairo";
    const text = body.text?.trim() || "مرحباً! لو سمحت عايز اسأل عن توفر المنتج وتفاصيل التوصيل؟ 🛍️";

    // Use storeId from body if provided or resolve from auth header
    let storeId: string | undefined = body.storeId;
    if (!storeId) {
      const authHeader = request.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        try {
          const token = authHeader.replace("Bearer ", "");
          const { data: { user } } = await supabase.auth.getUser(token);
          if (user) {
            const { data: sm } = await supabase
              .from("store_members")
              .select("store_id")
              .eq("user_id", user.id)
              .limit(1)
              .maybeSingle();
            storeId = sm?.store_id || undefined;
            if (!storeId) {
              const { data: st } = await supabase
                .from("stores")
                .select("id")
                .eq("user_id", user.id)
                .limit(1)
                .maybeSingle();
              storeId = st?.id || undefined;
            }
          }
        } catch {}
      }
    }
    if (!storeId) {
      return new Response(
        JSON.stringify({ success: false, error: "لم يتم العثور على المتجر" }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    const externalId = `ig_user_${Date.now().toString().slice(-5)}`;
    const now = new Date().toISOString();

    const { data: conv, error: convErr } = await supabase
      .from("conversations")
      .insert({
        store_id: storeId,
        channel: "instagram",
        external_id: externalId,
        sender_id: externalId,
        customer_name: customerHandle.startsWith("@") ? customerHandle : `@${customerHandle}`,
        last_message_at: now,
        unread_count: 1,
      })
      .select("id")
      .single();

    if (convErr || !conv?.id) {
      throw new Error(convErr?.message || "فشل تسجيل المحادثة");
    }

    await supabase.from("messages").insert({
      conversation_id: conv.id,
      store_id: storeId,
      direction: "inbound",
      content: text,
      message_type: "text",
      created_at: now,
    });

    return new Response(
      JSON.stringify({ success: true, conversationId: conv.id, customer: customerHandle }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}

