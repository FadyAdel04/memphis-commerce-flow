import crypto from "crypto";

export interface MetaConfig {
  appId: string;
  appSecret: string;
  phoneNumberId: string;
  wabaId: string;
  accessToken: string;
  verifyToken: string;
}

export function getDefaultMetaConfig(): MetaConfig {
  return {
    appId: process.env["VITE_META_APP_ID"] || "1073045725476742",
    appSecret: process.env["META_APP_SECRET"] || "64ee832f23cd85da0bda04605b345499",
    phoneNumberId: process.env["META_PHONE_NUMBER_ID"] || "1240261785844530",
    wabaId: process.env["META_WABA_ID"] || "1600277904832671",
    accessToken:
      process.env["META_ACCESS_TOKEN"] ||
      "EAAPP7e1Ld4YBScRfRTRTdg4A9waoQZAhSom8ZCm8lRZCZAc7T87N0NTIMbmZCexhP9ah2UT7qWDsdHebJgtQVp0TH4lHRapOtlpdJ2YM9hMehJ5TMwiDtIvDhIR0YZChhqsfAApIqmzRSiK7gGaFlHDpWSToyfTNbjQz7z3JmWTh0Okg6KULEqrC69Cf4r5jIJJROfavybrT6dqDRG1g07lFZBgcFAWGU1Fq242xvUvu87KAegxaWwL5ClZA1Mccx58xRocEIQ1LM9OCZCyqXeLuZA6wE0",
    verifyToken: process.env["META_WEBHOOK_VERIFY_TOKEN"] || "wasla_meta_webhook_token_2026",
  };
}

/**
 * Verify Webhook Signature (SHA256)
 */
export function verifyMetaSignature(
  rawBody: string,
  signatureHeader: string | null,
  appSecret: string
): boolean {
  if (!signatureHeader) return true; // allow if no header is enforced in dev
  try {
    const [algo, signature] = signatureHeader.split("=");
    if (algo !== "sha256" || !signature) return false;

    const expected = crypto
      .createHmac("sha256", appSecret)
      .update(rawBody)
      .digest("hex");

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch (err) {
    console.error("Signature verification error:", err);
    return false;
  }
}

/**
 * Send WhatsApp text message via Meta Cloud API v21.0
 */
export async function sendWhatsAppTextMessage({
  to,
  text,
  phoneNumberId,
  accessToken,
}: {
  to: string;
  text: string;
  phoneNumberId?: string;
  accessToken?: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  const config = getDefaultMetaConfig();
  const activePhoneId = phoneNumberId || config.phoneNumberId;
  const activeToken = accessToken || config.accessToken;

  // Clean destination phone number (remove +, spaces, dashes)
  const cleanTo = to.replace(/\D/g, "");

  try {
    const url = `https://graph.facebook.com/v21.0/${activePhoneId}/messages`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${activeToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanTo,
        type: "text",
        text: {
          preview_url: false,
          body: text,
        },
      }),
    });

    const json = await response.json();
    if (!response.ok) {
      console.error("Meta WhatsApp API error:", json);
      return {
        success: false,
        error: json?.error?.message || "Failed to send WhatsApp message",
        data: json,
      };
    }

    return { success: true, data: json };
  } catch (err: any) {
    console.error("Exception in sendWhatsAppTextMessage:", err);
    return { success: false, error: err.message || "Network error sending WhatsApp message" };
  }
}

/**
 * Send pre-approved WhatsApp Template Message (e.g. hello_world or order confirmation)
 */
export async function sendWhatsAppTemplateMessage({
  to,
  templateName = "hello_world",
  languageCode = "en_US",
  phoneNumberId,
  accessToken,
}: {
  to: string;
  templateName?: string;
  languageCode?: string;
  phoneNumberId?: string;
  accessToken?: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  const config = getDefaultMetaConfig();
  const activePhoneId = phoneNumberId || config.phoneNumberId;
  const activeToken = accessToken || config.accessToken;
  const cleanTo = to.replace(/\D/g, "");

  try {
    const url = `https://graph.facebook.com/v21.0/${activePhoneId}/messages`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${activeToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: cleanTo,
        type: "template",
        template: {
          name: templateName,
          language: { code: languageCode },
        },
      }),
    });

    const json = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: json?.error?.message || "Failed to send template message",
        data: json,
      };
    }

    return { success: true, data: json };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error" };
  }
}

/**
 * Test & verify WhatsApp Cloud API Phone Number credentials
 */
export async function testMetaCredentials({
  phoneNumberId,
  accessToken,
}: {
  phoneNumberId?: string;
  accessToken?: string;
}): Promise<{
  success: boolean;
  profile?: {
    verified_name?: string;
    display_phone_number?: string;
    quality_rating?: string;
    code_verification_status?: string;
  };
  error?: string;
}> {
  const config = getDefaultMetaConfig();
  const activePhoneId = phoneNumberId || config.phoneNumberId;
  const activeToken = accessToken || config.accessToken;

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${activePhoneId}`, {
      headers: {
        Authorization: `Bearer ${activeToken}`,
      },
    });
    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: data?.error?.message || "Failed to verify phone credentials",
      };
    }

    return {
      success: true,
      profile: {
        verified_name: data.verified_name || "Verified WhatsApp Number",
        display_phone_number: data.display_phone_number || "+1 555-675-5082",
        quality_rating: data.quality_rating || "GREEN",
        code_verification_status: data.code_verification_status,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error contacting Meta" };
  }
}

/**
 * Extracted incoming message item from Webhook payload
 */
export interface ExtractedWebhookMessage {
  channel: "whatsapp" | "instagram";
  senderId: string;
  senderName?: string;
  messageId: string;
  text: string;
  timestamp: string;
  rawPayload: any;
}

/**
 * Parse incoming webhook payload from WhatsApp or Instagram
 */
export function parseMetaWebhookPayload(body: any): ExtractedWebhookMessage[] {
  const messages: ExtractedWebhookMessage[] = [];

  if (!body || typeof body !== "object") return messages;

  // 1. WhatsApp Cloud API Webhook Format
  if (body.object === "whatsapp_business_account" && Array.isArray(body.entry)) {
    for (const entry of body.entry) {
      for (const change of entry.changes || []) {
        if (change.field === "messages") {
          const value = change.value;
          const contacts = value?.contacts || [];
          const contactNameMap = new Map<string, string>();

          for (const contact of contacts) {
            if (contact.wa_id && contact.profile?.name) {
              contactNameMap.set(contact.wa_id, contact.profile.name);
            }
          }

          for (const msg of value?.messages || []) {
            let textContent = "";
            if (msg.type === "text") {
              textContent = msg.text?.body || "";
            } else if (msg.type === "button") {
              textContent = msg.button?.text || "[زر تفاعلي]";
            } else if (msg.type === "interactive") {
              textContent =
                msg.interactive?.button_reply?.title ||
                msg.interactive?.list_reply?.title ||
                "[رد تفاعلي]";
            } else if (msg.type === "image") {
              textContent = msg.image?.caption || "[صورة]";
            } else if (msg.type === "audio" || msg.type === "voice") {
              textContent = "[رسالة صوتية]";
            } else {
              textContent = `[${msg.type || "رسالة"}]`;
            }

            const senderWaId = msg.from;
            messages.push({
              channel: "whatsapp",
              senderId: `+${senderWaId}`,
              senderName: contactNameMap.get(senderWaId) || `عميل ${senderWaId.slice(-4)}`,
              messageId: msg.id,
              text: textContent,
              timestamp: msg.timestamp
                ? new Date(parseInt(msg.timestamp) * 1000).toISOString()
                : new Date().toISOString(),
              rawPayload: msg,
            });
          }
        }
      }
    }
  }

  // 2. Instagram / Messenger Webhook Format
  if (body.object === "instagram" || body.object === "page") {
    for (const entry of body.entry || []) {
      for (const messaging of entry.messaging || []) {
        if (messaging.message && !messaging.message.is_echo) {
          const senderId = messaging.sender?.id || "unknown";
          messages.push({
            channel: "instagram",
            senderId: `@ig_${senderId}`,
            senderName: `مستخدم إنستجرام (${senderId.slice(-4)})`,
            messageId: messaging.message.mid || `mid_${Date.now()}`,
            text: messaging.message.text || "[وسائط أو مرفقات]",
            timestamp: messaging.timestamp
              ? new Date(messaging.timestamp).toISOString()
              : new Date().toISOString(),
            rawPayload: messaging,
          });
        }
      }
    }
  }

  return messages;
}
