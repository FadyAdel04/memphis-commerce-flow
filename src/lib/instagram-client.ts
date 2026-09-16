/**
 * instagram-client.ts
 * Pure Instagram Business API (with Instagram Login) functions.
 * Uses App ID 1624922232609458 (Wasla-IG).
 *
 * Permissions required:
 *   instagram_business_basic
 *   instagram_business_manage_messages
 *   instagram_business_manage_comments
 */

export interface IgConfig {
  appId: string;
  appSecret: string;
  verifyToken: string;
  redirectUri: string;
}

/** Read Instagram app credentials from environment */
export function getIgConfig(): IgConfig {
  const envRedirect = process.env["IG_REDIRECT_URI"];
  // Fallback: derive from VITE_SUPABASE_URL origin + local API path for dev
  const supabaseUrl = process.env["VITE_SUPABASE_URL"] || "";
  const fallbackRedirect = supabaseUrl
    ? `${supabaseUrl.replace(".supabase.co", ".supabase.co")}/api/instagram/oauth/callback`
    : "";
  const redirectUri =
    envRedirect && envRedirect.startsWith("https://")
      ? envRedirect
      : fallbackRedirect;

  const appSecret = process.env["IG_APP_SECRET"] || "";
  if (!appSecret) {
    console.warn("[instagram-client] IG_APP_SECRET env var is not set — token exchange will fail");
  }

  return {
    appId: process.env["IG_APP_ID"] || "1624922232609458",
    appSecret,
    verifyToken: process.env["IG_VERIFY_TOKEN"] || "wasla_ig_webhook_token_2026",
    redirectUri,
  };
}

/** Build the Instagram OAuth authorization URL */
export function buildIgAuthUrl(customRedirectUri?: string, state?: string): string {
  const cfg = getIgConfig();
  const redirectUri = customRedirectUri || cfg.redirectUri;
  const params = new URLSearchParams({
    client_id: cfg.appId,
    redirect_uri: redirectUri,
    scope: "instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments",
    response_type: "code",
  });
  if (state) {
    params.set("state", state);
  }
  return `https://api.instagram.com/oauth/authorize?${params.toString()}`;
}

export interface IgShortLivedToken {
  access_token: string;
  user_id: string;
}

/**
 * Exchange authorization code for a short-lived access token,
 * then immediately exchange it for a long-lived token (60-day).
 */
export async function exchangeIgCodeForLongLivedToken(
  code: string,
  customRedirectUri?: string
): Promise<{ success: boolean; accessToken?: string; userId?: string; expiresIn?: number; error?: string }> {
  const cfg = getIgConfig();
  const redirectUri = customRedirectUri || cfg.redirectUri;

  // Step 1: code → short-lived token
  try {
    const shortForm = new URLSearchParams({
      client_id: cfg.appId,
      client_secret: cfg.appSecret,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code,
    });

    const shortRes = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: shortForm.toString(),
    });

    const shortData = await shortRes.json() as any;
    if (!shortRes.ok || !shortData.access_token) {
      return {
        success: false,
        error: shortData?.error_message || shortData?.error?.message || "Failed to get short-lived token",
      };
    }

    const shortToken: string = shortData.access_token;

    // Step 2: short-lived → long-lived token
    const longParams = new URLSearchParams({
      grant_type: "ig_exchange_token",
      client_secret: cfg.appSecret,
      access_token: shortToken,
    });

    const longRes = await fetch(
      `https://graph.instagram.com/access_token?${longParams.toString()}`
    );
    const longData = await longRes.json() as any;

    if (!longRes.ok || !longData.access_token) {
      // Fall back to short-lived token if long-lived exchange fails
      return {
        success: true,
        accessToken: shortToken,
        userId: String(shortData.user_id),
        expiresIn: 3600,
      };
    }

    return {
      success: true,
      accessToken: longData.access_token,
      userId: String(shortData.user_id),
      expiresIn: longData.expires_in || 5183944, // ~60 days in seconds
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error during Instagram OAuth" };
  }
}

/**
 * Refresh a long-lived token before it expires (must refresh within 60 days).
 */
export async function refreshIgLongLivedToken(
  accessToken: string
): Promise<{ success: boolean; accessToken?: string; expiresIn?: number; error?: string }> {
  try {
    const params = new URLSearchParams({
      grant_type: "ig_refresh_token",
      access_token: accessToken,
    });
    const res = await fetch(`https://graph.instagram.com/refresh_access_token?${params.toString()}`);
    const data = await res.json() as any;

    if (!res.ok || !data.access_token) {
      return { success: false, error: data?.error?.message || "Failed to refresh token" };
    }

    return {
      success: true,
      accessToken: data.access_token,
      expiresIn: data.expires_in,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error refreshing IG token" };
  }
}

export interface IgUserProfile {
  id: string;
  username: string;
  name?: string;
  profile_picture_url?: string;
  biography?: string;
  followers_count?: number;
}

/**
 * Fetch the connected Instagram Business account profile.
 */
export async function getIgUserProfile(
  accessToken: string
): Promise<{ success: boolean; profile?: IgUserProfile; error?: string }> {
  try {
    const fields = "id,username,name,profile_picture_url,biography,followers_count";
    const res = await fetch(
      `https://graph.instagram.com/me?fields=${fields}&access_token=${accessToken}`
    );
    const data = await res.json() as any;

    if (!res.ok || !data.id) {
      return { success: false, error: data?.error?.message || "Failed to fetch IG profile" };
    }

    return {
      success: true,
      profile: {
        id: data.id,
        username: data.username,
        name: data.name,
        profile_picture_url: data.profile_picture_url,
        biography: data.biography,
        followers_count: data.followers_count,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error fetching IG profile" };
  }
}

/**
 * Subscribe the connected page/account to Instagram webhook fields.
 * This calls the subscribed_apps edge of the Instagram Business Account.
 */
export async function subscribeIgWebhook(
  igUserId: string,
  accessToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(
      `https://graph.instagram.com/${igUserId}/subscribed_apps`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscribed_fields: ["messages", "messaging_postbacks", "messaging_seen"],
        }),
      }
    );
    const data = await res.json() as any;

    if (!res.ok || data.success !== true) {
      return { success: false, error: data?.error?.message || "Failed to subscribe IG webhook" };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error subscribing IG webhook" };
  }
}

/**
 * Send a private reply / direct message to an Instagram user.
 * Requires instagram_business_manage_messages permission.
 */
export async function sendIgDirectMessage({
  recipientId,
  text,
  accessToken,
  igUserId,
}: {
  recipientId: string;
  text: string;
  accessToken: string;
  igUserId: string;
}): Promise<{ success: boolean; messageId?: string; error?: string; data?: any }> {
  try {
    const res = await fetch(`https://graph.instagram.com/v21.0/${igUserId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text },
      }),
    });

    const data = await res.json() as any;

    if (!res.ok) {
      console.error("Instagram send DM error:", data);
      return {
        success: false,
        error: data?.error?.message || "Failed to send Instagram DM",
        data,
      };
    }

    return {
      success: true,
      messageId: data.message_id,
      data,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error sending Instagram DM" };
  }
}

/**
 * Fetch conversations and messages directly from Instagram Graph API.
 */
export async function fetchIgConversations(accessToken: string, igUserId?: string): Promise<{
  success: boolean;
  conversations?: any[];
  error?: string;
}> {
  try {
    const target = igUserId || "me";
    const url = `https://graph.instagram.com/v21.0/${target}/conversations?fields=id,updated_time,participants{id,username},messages{id,created_time,from,to,message}&limit=25&access_token=${accessToken}`;
    const res = await fetch(url);
    const data = await res.json() as any;

    if (!res.ok) {
      return { success: false, error: data?.error?.message || "Failed to fetch conversations from Instagram" };
    }

    return { success: true, conversations: data?.data || [] };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error fetching Instagram conversations" };
  }
}

/**
 * Extracted message from an Instagram webhook event.
 */
export interface ExtractedIgMessage {
  channel: "instagram";
  senderId: string;       // IG Scoped User ID of the sender (customer)
  recipientId: string;    // IG Business ID of the recipient (the merchant's account)
  messageId: string;      // message.mid
  text: string;
  attachmentType?: string;
  attachmentUrl?: string;
  timestamp: string;      // ISO 8601
  rawPayload: any;
  isEcho: boolean;        // true = sent by the page/account itself
}

/**
 * Parse an incoming Instagram webhook POST body.
 * Handles: text messages, attachments (image, video, audio, story_mention, share).
 */
export function parseIgWebhookPayload(body: any): ExtractedIgMessage[] {
  const results: ExtractedIgMessage[] = [];

  if (!body || body.object !== "instagram") return results;

  for (const entry of body.entry || []) {
    for (const messaging of entry.messaging || []) {
      const senderId: string = messaging.sender?.id || "unknown";
      const recipientId: string = messaging.recipient?.id || "";
      const ts: string = messaging.timestamp
        ? new Date(Number(messaging.timestamp)).toISOString()
        : new Date().toISOString();

      const msg = messaging.message;
      if (!msg) continue;

      const isEcho: boolean = msg.is_echo === true;

      let text = "";
      let attachmentType: string | undefined;
      let attachmentUrl: string | undefined;

      if (msg.text) {
        text = msg.text;
      } else if (Array.isArray(msg.attachments) && msg.attachments.length > 0) {
        const att = msg.attachments[0];
        attachmentType = att.type;
        attachmentUrl = att.payload?.url;

        switch (att.type) {
          case "image":
            text = att.payload?.url ? `[صورة]` : "[صورة]";
            break;
          case "video":
            text = "[فيديو]";
            break;
          case "audio":
            text = "[رسالة صوتية]";
            break;
          case "story_mention":
            text = "[ذكر في ستوري]";
            break;
          case "share":
            text = `[منشور مشترك]${att.payload?.url ? ": " + att.payload.url : ""}`;
            break;
          default:
            text = `[${att.type || "مرفق"}]`;
        }
      } else {
        text = "[رسالة]";
      }

      results.push({
        channel: "instagram",
        senderId,
        recipientId,
        messageId: msg.mid || `ig_mid_${Date.now()}`,
        text,
        timestamp: ts,
        rawPayload: messaging,
        isEcho,
        ...(attachmentType !== undefined && { attachmentType }),
        ...(attachmentUrl !== undefined && { attachmentUrl }),
      });
    }
  }

  return results;
}
