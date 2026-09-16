// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── Configuration ────────────────────────────────────────────────────────────
const WA_VERIFY_TOKEN =
  Deno.env.get("META_WEBHOOK_VERIFY_TOKEN") || "wasla_meta_webhook_token_2026";
const IG_VERIFY_TOKEN =
  Deno.env.get("IG_VERIFY_TOKEN") || "wasla_ig_webhook_token_2026";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ── Helper: deduplicate messages ─────────────────────────────────────────────
async function messageExists(externalMessageId: string): Promise<boolean> {
  const { data } = await supabase
    .from("messages")
    .select("id")
    .eq("external_message_id", externalMessageId)
    .maybeSingle();
  return data !== null;
}

// ── WhatsApp message persistence ─────────────────────────────────────────────
async function handleWhatsAppEntry(entry: any) {
  for (const change of entry.changes || []) {
    if (change.field !== "messages") continue;

    const value = change.value;
    const phoneNumberId: string = value?.metadata?.phone_number_id;
    const contacts: any[] = value?.contacts || [];
    const contactName: string = contacts[0]?.profile?.name || "عميل واتساب";

    // Resolve store by phone_number_id
    let storeId: string | null = null;
    if (phoneNumberId) {
      const { data: integ } = await supabase
        .from("meta_integrations")
        .select("store_id")
        .eq("phone_number_id", phoneNumberId)
        .maybeSingle();
      if (integ?.store_id) storeId = integ.store_id;
    }
    if (!storeId) {
      console.warn("No store found for phone_number_id:", phoneNumberId);
      continue;
    }

    for (const msg of value?.messages || []) {
      const senderWaId = `+${msg.from}`;
      let textBody = "";
      if (msg.type === "text") textBody = msg.text?.body || "";
      else if (msg.type === "button") textBody = msg.button?.text || "[زر تفاعلي]";
      else if (msg.type === "interactive")
        textBody =
          msg.interactive?.button_reply?.title ||
          msg.interactive?.list_reply?.title ||
          "[رد تفاعلي]";
      else if (msg.type === "image") textBody = msg.image?.caption || "[صورة]";
      else if (msg.type === "audio" || msg.type === "voice") textBody = "[رسالة صوتية]";
      else textBody = `[${msg.type || "رسالة"}]`;

      // Dedup
      if (msg.id && (await messageExists(msg.id))) continue;

      // Find or create conversation
      let { data: conv } = await supabase
        .from("conversations")
        .select("id, unread_count")
        .eq("store_id", storeId)
        .eq("channel", "whatsapp")
        .eq("external_id", senderWaId)
        .maybeSingle();

      if (!conv) {
        const { data: newConv } = await supabase
          .from("conversations")
          .insert({
            store_id: storeId,
            channel: "whatsapp",
            external_id: senderWaId,
            customer_name: contactName,
            last_message_at: new Date().toISOString(),
            unread_count: 1,
          })
          .select("id, unread_count")
          .single();
        conv = newConv;
      } else {
        await supabase
          .from("conversations")
          .update({
            last_message_at: new Date().toISOString(),
            customer_name: contactName,
            unread_count: (conv.unread_count || 0) + 1,
          })
          .eq("id", conv.id);
      }

      if (conv?.id) {
        await supabase.from("messages").insert({
          conversation_id: conv.id,
          store_id: storeId,
          direction: "inbound",
          content: textBody,
          message_type: msg.type || "text",
          external_message_id: msg.id,
          platform_data: msg,
        });
      }
    }
  }
}

// ── Instagram DM persistence ──────────────────────────────────────────────────
async function handleInstagramEntry(entry: any) {
  for (const messaging of entry.messaging || []) {
    const msg = messaging.message;
    if (!msg) continue;
    if (msg.is_echo) continue; // skip echoes from the merchant's own page

    const senderId: string = messaging.sender?.id || "unknown";
    const recipientId: string = messaging.recipient?.id || "";
    const messageId: string = msg.mid || `ig_${Date.now()}`;
    const ts: string = messaging.timestamp
      ? new Date(Number(messaging.timestamp)).toISOString()
      : new Date().toISOString();

    // Dedup
    if (await messageExists(messageId)) continue;

    // Determine message content
    let textBody = "";
    let msgType = "text";
    if (msg.text) {
      textBody = msg.text;
    } else if (Array.isArray(msg.attachments) && msg.attachments.length > 0) {
      const att = msg.attachments[0];
      msgType = att.type || "image";
      switch (att.type) {
        case "image": textBody = "[صورة]"; break;
        case "video": textBody = "[فيديو]"; break;
        case "audio": textBody = "[رسالة صوتية]"; break;
        case "story_mention": textBody = "[ذكر في ستوري]"; break;
        case "share": textBody = "[منشور مشترك]"; break;
        default: textBody = `[${att.type}]`;
      }
    } else {
      textBody = "[رسالة]";
    }

    // Route to store via instagram_integrations
    let storeId: string | null = null;
    if (recipientId) {
      const { data: igInteg } = await supabase
        .from("instagram_integrations")
        .select("store_id")
        .eq("ig_page_id", recipientId)
        .maybeSingle();
      if (igInteg?.store_id) storeId = igInteg.store_id;
    }
    if (!storeId) {
      console.warn("No store found for IG recipient:", recipientId);
      continue;
    }

    const customerLabel = `مستخدم إنستجرام (${senderId.slice(-4)})`;

    // Find or create conversation
    let { data: conv } = await supabase
      .from("conversations")
      .select("id, unread_count")
      .eq("store_id", storeId)
      .eq("channel", "instagram")
      .eq("external_id", senderId)
      .maybeSingle();

    if (!conv) {
      const { data: newConv } = await supabase
        .from("conversations")
        .insert({
          store_id: storeId,
          channel: "instagram",
          external_id: senderId,
          sender_id: senderId,
          customer_name: customerLabel,
          last_message_at: ts,
          unread_count: 1,
          platform_data: { ig_page_id: recipientId },
        })
        .select("id, unread_count")
        .single();
      conv = newConv;
    } else {
      await supabase
        .from("conversations")
        .update({
          last_message_at: ts,
          unread_count: (conv.unread_count || 0) + 1,
        })
        .eq("id", conv.id);
    }

    if (conv?.id) {
      await supabase.from("messages").insert({
        conversation_id: conv.id,
        store_id: storeId,
        direction: "inbound",
        content: textBody,
        message_type: msgType,
        external_message_id: messageId,
        platform_data: {
          ig_sender_id: senderId,
          ig_recipient_id: recipientId,
          raw: messaging,
        },
      });
    }
  }
}

// ── Main Handler ─────────────────────────────────────────────────────────────
serve(async (req: Request) => {
  const url = new URL(req.url);

  // GET: Handles both Webhook handshake AND Instagram OAuth callback
  if (req.method === "GET") {
    if (url.searchParams.get("action") === "clean_static_demo") {
      await supabase.from("messages").delete().eq("conversation_id", "290c80aa-b706-4d87-8714-d9593c295c49");
      await supabase.from("conversations").delete().eq("id", "290c80aa-b706-4d87-8714-d9593c295c49");
      return new Response(JSON.stringify({ cleaned: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    // ── Check if this is an Instagram OAuth callback (redirect from Meta) ─────
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");
    const errorReason = url.searchParams.get("error_reason");
    const errorDescription = url.searchParams.get("error_description");

    if (error || errorReason || errorDescription) {
      const errMsg = errorDescription || errorReason || error || "OAuth Error";
      return new Response(
        `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>
          <script>
            window.opener?.postMessage({type:'ig_oauth_error',error:${JSON.stringify(errMsg)}},'*');
            setTimeout(() => window.close(), 2500);
          </script>
          <div style="font-family:sans-serif;text-align:center;padding:40px;">
            <h3 style="color:#d32f2f;">خطأ في تسجيل الدخول</h3>
            <p>${errMsg}</p>
          </div>
        </body></html>`,
        { status: 400, headers: { "content-type": "text/html; charset=utf-8" } }
      );
    }

    if (code) {
      try {
        const IG_APP_ID = Deno.env.get("IG_APP_ID") || "1624922232609458";
        const IG_APP_SECRET = Deno.env.get("IG_APP_SECRET");
        if (!IG_APP_SECRET) {
          throw new Error("IG_APP_SECRET is not defined in Edge Function environment variables");
        }
        const redirectUri =
          Deno.env.get("IG_REDIRECT_URI") ||
          "https://pslhhimiweiqzersnlvc.supabase.co/functions/v1/meta-webhook";

        // 1. Exchange code -> short-lived token
        const cleanCode = code.replace(/#_$/, "");
        const tokenForm = new URLSearchParams({
          client_id: IG_APP_ID,
          client_secret: IG_APP_SECRET,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
          code: cleanCode,
        });

        const shortRes = await fetch("https://api.instagram.com/oauth/access_token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: tokenForm.toString(),
        });
        const shortData = await shortRes.json();

        if (!shortRes.ok || !shortData.access_token) {
          throw new Error(shortData?.error_message || shortData?.error?.message || "Failed to obtain Instagram access token");
        }

        const shortToken = shortData.access_token;
        const igUserId = String(shortData.user_id);
        let finalToken = shortToken;
        let expiresIn = 3600;

        // 2. Exchange short-lived -> long-lived (60 days) token
        try {
          const longParams = new URLSearchParams({
            grant_type: "ig_exchange_token",
            client_secret: IG_APP_SECRET,
            access_token: shortToken,
          });
          const longRes = await fetch(`https://graph.instagram.com/access_token?${longParams.toString()}`);
          const longData = await longRes.json();
          if (longRes.ok && longData.access_token) {
            finalToken = longData.access_token;
            expiresIn = longData.expires_in || 5183944;
          }
        } catch (e) {
          console.warn("Long-lived token exchange fallback:", e);
        }

        // 3. Fetch Instagram profile
        let username = "instagram_user";
        let profilePic = "";
        try {
          const profileRes = await fetch(`https://graph.instagram.com/me?fields=id,username,name,profile_picture_url&access_token=${finalToken}`);
          const profileData = await profileRes.json();
          if (profileData.username) username = profileData.username;
          if (profileData.profile_picture_url) profilePic = profileData.profile_picture_url;
        } catch (e) {
          console.warn("Profile fetch error:", e);
        }

        // 4. Subscribe the Instagram account to webhooks so incoming DMs arrive
        let webhookSubscribed = false;
        try {
          const subRes = await fetch(
            `https://graph.instagram.com/v21.0/${igUserId}/subscribed_apps`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${finalToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                subscribed_fields: ["messages", "messaging_postbacks", "messaging_seen"],
              }),
            }
          );
          const subData = await subRes.json();
          if (subRes.ok && (subData.success === true || subData.data)) {
            webhookSubscribed = true;
          }
          console.log("IG Subscribed apps response:", subData);
        } catch (subErr) {
          console.warn("Failed to auto-subscribe IG webhook:", subErr);
        }

        // 5. Save to public.instagram_integrations in Supabase
        const stateParam = url.searchParams.get("state");
        let targetStoreId: string | null = null;
        if (stateParam) {
          try {
            const decoded = atob(stateParam.replace(/-/g, "+").replace(/_/g, "/"));
            const parsed = JSON.parse(decoded);
            if (parsed?.s) targetStoreId = parsed.s;
          } catch {
            if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(stateParam)) {
              targetStoreId = stateParam;
            }
          }
        }

        const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

        if (targetStoreId) {
          // Check if an integration already exists for this store
          const { data: existing } = await supabase
            .from("instagram_integrations")
            .select("id")
            .eq("store_id", targetStoreId)
            .maybeSingle();

          if (existing?.id) {
            const { error: updErr } = await supabase
              .from("instagram_integrations")
              .update({
                ig_page_id: igUserId,
                ig_user_id: igUserId,
                ig_username: username,
                ig_name: username,
                ig_profile_pic: profilePic,
                ig_access_token: finalToken,
                token_expires_at: expiresAt,
                status: "connected",
                webhook_subscribed: true,
                updated_at: new Date().toISOString(),
              })
              .eq("id", existing.id);

            if (updErr) console.error("IG integration update error:", updErr);
          } else {
            const { error: insErr } = await supabase
              .from("instagram_integrations")
              .insert({
                store_id: targetStoreId,
                ig_page_id: igUserId,
                ig_user_id: igUserId,
                ig_username: username,
                ig_name: username,
                ig_profile_pic: profilePic,
                ig_access_token: finalToken,
                token_expires_at: expiresAt,
                status: "connected",
                webhook_subscribed: true,
              });

            if (insErr) console.error("IG integration insert error:", insErr);
          }

          // Also activate instagram in store's platforms jsonb
          try {
            const { data: storeRow } = await supabase
              .from("stores")
              .select("platforms")
              .eq("id", targetStoreId)
              .maybeSingle();

            const currentPlatforms = (storeRow?.platforms as Record<string, boolean>) || {};
            await supabase
              .from("stores")
              .update({
                platforms: { ...currentPlatforms, instagram: true },
                updated_at: new Date().toISOString(),
              })
              .eq("id", targetStoreId);
          } catch (platErr) {
            console.warn("Could not update store platforms flag:", platErr);
          }
        }

        // 6. Return success HTML that communicates with parent window via multiple channels
        return new Response(
          `<!DOCTYPE html>
<html lang="ar">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <title>Instagram Connected</title>
  <style>
    body { font-family: sans-serif; text-align: center; padding: 50px; background: #f8f9fa; margin: 0; }
    .card { background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 400px; margin: 0 auto; border: 2px solid #222; }
    .icon { font-size: 48px; margin-bottom: 12px; }
    h2 { color: #E1306C; margin: 0 0 8px; font-size: 20px; }
    .username { font-size: 18px; font-weight: bold; margin: 8px 0; }
    .sub { color: #666; font-size: 13px; margin: 4px 0; }
    .hint { color: #999; font-size: 11px; margin-top: 8px; }
    button { margin-top: 16px; padding: 10px 24px; background: #E1306C; color: #fff; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 14px; }
    button:hover { background: #c1185a; }
    .bar { width: 0; height: 3px; background: #E1306C; border-radius: 2px; animation: fill 1.5s linear forwards; margin-top: 16px; }
    @keyframes fill { to { width: 100%; } }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">&#x1F389;</div>
    <h2>Instagram Connected!</h2>
    <p class="username">@${username}</p>
    <p class="sub">Messages access activated successfully.</p>
    <p class="hint">Closing window &amp; updating dashboard...</p>
    <div class="bar"></div>
    <button onclick="window.close()">Close &amp; Return to Dashboard</button>
  </div>
  <script>
    const payload = {
      type: 'ig_oauth_success',
      username: ${JSON.stringify(username)},
      profilePic: ${JSON.stringify(profilePic)},
      igUserId: ${JSON.stringify(igUserId)}
    };

    // 1. Try window.opener postMessage (works if no cross-origin redirect)
    try { if (window.opener) { window.opener.postMessage(payload, '*'); } } catch(e) {}

    // 2. BroadcastChannel (same-origin only)
    try { const bc = new BroadcastChannel('wasla_oauth'); bc.postMessage(payload); } catch(e) {}

    // 3. localStorage signal (cross-origin fallback — app storage listener picks this up)
    try {
      localStorage.setItem('wasla_ig_oauth_result', JSON.stringify({ ...payload, ts: Date.now() }));
    } catch(e) {}

    // Auto-close after 1.5s
    setTimeout(() => { try { window.close(); } catch(e) {} }, 1500);
  </script>
</body>
</html>`,
          { status: 200, headers: { "content-type": "text/html; charset=utf-8" } }
        );
      } catch (err: any) {
        console.error("IG OAuth exchange error:", err);

        // If the code was already used (e.g. parallel redirect or refresh), check if integration exists and return success
        const stateParam = url.searchParams.get("state");
        let fallbackStoreId: string | null = null;
        if (stateParam) {
          try {
            const decoded = atob(stateParam.replace(/-/g, "+").replace(/_/g, "/"));
            const parsed = JSON.parse(decoded);
            if (parsed?.s) fallbackStoreId = parsed.s;
          } catch {
            if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(stateParam)) {
              fallbackStoreId = stateParam;
            }
          }
        }

        if (fallbackStoreId && err.message?.includes("authorization code has been used")) {
          const { data: existingInteg } = await supabase
            .from("instagram_integrations")
            .select("ig_username, ig_name, ig_profile_pic, ig_user_id, status")
            .eq("store_id", fallbackStoreId)
            .eq("status", "connected")
            .maybeSingle();

          if (existingInteg) {
            return new Response(
              `<!DOCTYPE html><html><head><meta charset="utf-8"><title>تم الربط بنجاح</title></head><body style="font-family:sans-serif;text-align:center;padding:50px;background:#f8f9fa;">
                <div style="background:white;padding:30px;border-radius:16px;box-shadow:0 4px 12px rgba(0,0,0,0.1);max-width:400px;margin:0 auto;border:2px solid #222;">
                  <h2 style="color:#E1306C;margin-bottom:10px;">🎉 تم ربط Instagram بنجاح!</h2>
                  <p style="font-size:18px;font-weight:bold;">@${existingInteg.ig_username}</p>
                  <p style="color:#666;font-size:14px;">تم تفعيل الوصول إلى رسائل Instagram بنجاح.</p>
                  <p style="color:#888;font-size:12px;">جاري إغلاق هذه النافذة وتحديث لوحة التحكم تلقائياً...</p>
                  <button onclick="window.close()" style="margin-top:14px;padding:10px 20px;background:#E1306C;color:#fff;border:none;border-radius:8px;font-weight:bold;cursor:pointer;">إغلاق والعودة للوحة التحكم</button>
                </div>
                <script>
                  const payload = {
                    type: 'ig_oauth_success',
                    username: ${JSON.stringify(existingInteg.ig_username)},
                    profilePic: ${JSON.stringify(existingInteg.ig_profile_pic || "")},
                    igUserId: ${JSON.stringify(existingInteg.ig_user_id || "")}
                  };
                  try { window.opener?.postMessage(payload, '*'); } catch(e) {}
                  try { const bc = new BroadcastChannel('wasla_oauth'); bc.postMessage(payload); } catch(e) {}
                  setTimeout(() => { try { window.close(); } catch(e) {} }, 2000);
                </script>
              </body></html>`,
              { status: 200, headers: { "content-type": "text/html; charset=utf-8" } }
            );
          }
        }

        return new Response(
          `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:sans-serif;text-align:center;padding:40px;">
            <h3 style="color:#d32f2f;">فشل إكمال ربط حساب Instagram</h3>
            <p>${err.message || "حدث خطأ غير متوقع"}</p>
            <script>
              try {
                window.opener?.postMessage({type:'ig_oauth_error',error:JSON.stringify(err.message || "Unknown error")}, '*');
              } catch(e) {}
              setTimeout(() => window.close(), 3000);
            </script>
          </body></html>`,
          { status: 400, headers: { "content-type": "text/html; charset=utf-8" } }
        );
      }
    }

    // ── Webhook verification handshake (supports both WA and IG verify tokens) ─
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    if (mode === "subscribe" && (token === WA_VERIFY_TOKEN || token === IG_VERIFY_TOKEN)) {
      console.log("Meta Webhook verified:", token);
      return new Response(challenge || "", {
        status: 200,
        headers: { "content-type": "text/plain" },
      });
    }

    return new Response("Forbidden: token mismatch", { status: 403 });
  }

  // POST: Incoming Meta event
  if (req.method === "POST") {
    try {
      const payload = await req.json();

      // WhatsApp Business Account events
      if (payload.object === "whatsapp_business_account" && Array.isArray(payload.entry)) {
        for (const entry of payload.entry) {
          await handleWhatsAppEntry(entry);
        }
      }

      // Instagram Business API events
      if (payload.object === "instagram" && Array.isArray(payload.entry)) {
        for (const entry of payload.entry) {
          await handleInstagramEntry(entry);
        }
      }

      return new Response(JSON.stringify({ status: "ok" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    } catch (err: any) {
      console.error("Webhook processing error:", err);
      // Always 200 — prevent Meta retry storms
      return new Response(JSON.stringify({ status: "error", error: err.message }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }
  }

  return new Response("Method not allowed", { status: 405 });
});
