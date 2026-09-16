# WASLA Meta & WhatsApp Cloud API + Instagram Business API Integration Guide

## Apps
| App | ID | Purpose |
|:----|:---|:--------|
| **Wasla (WhatsApp)** | `1073045725476742` | WhatsApp Cloud API (WABA, Phone Numbers, Webhooks) |
| **Wasla-IG (Instagram)** | `1624922232609458` | Instagram Business API (DMs, Comments, Webhooks) |


## 1. Meta Embedded Signup Architecture
1. Merchant triggers WhatsApp Connection inside the Channels dashboard (`src/routes/dashboard/channels.tsx`).
2. The Meta JavaScript SDK / Embedded Signup popup opens with:
   - `appId`: Configured Meta App ID.
   - `config_id`: Embedded signup configuration ID.
   - `response_type`: `code`.
3. Merchant completes flow on Meta, selecting their Meta Business Account (MBA) and Phone Number.
4. Embedded Signup sends callback message with `code`.
5. Frontend exchanges `code` via Supabase Edge Function to retrieve System User Access Token, WABA ID, and Phone Number ID.
6. Record is saved into `channel_accounts` table tied to current `store_id`.

## 2. Webhook Setup & Security

### Verification (GET)
Meta verifies your webhook URL during setup:
```typescript
Deno.serve(async (req) => {
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token === Deno.env.get('META_VERIFY_TOKEN')) {
      return new Response(challenge, { status: 200, headers: { 'Content-Type': 'text/plain' } });
    }
    return new Response('Forbidden', { status: 403 });
  }
  // POST handling...
});
```

### Ingestion (POST)
When a customer sends a message to any merchant's WhatsApp number:
1. Meta calls `POST /functions/v1/meta-webhook`.
2. Extract `phoneNumberId = entry[0].changes[0].value.metadata.phone_number_id`.
3. Query `channel_accounts` where `phone_number_id = phoneNumberId`.
4. If not found, log warning and return 200 OK (to prevent Meta retries).
5. Extract sender phone, display name, message timestamp, and message body.
6. Perform idempotency check using `external_message_id = message.id`. If already processed, exit early.
7. Find or create customer record in `customers` table with `store_id`.
8. Find or create thread in `conversations` table.
9. Insert row into `messages` table.
10. Supabase Realtime notifies active frontend client.
11. Return HTTP 200 immediately.

## 3. Sending Outbound Messages
Outbound messages are sent via official Graph API:
```bash
POST https://graph.facebook.com/v20.0/<PHONE_NUMBER_ID>/messages
Authorization: Bearer <SECURE_ACCESS_TOKEN>
Content-Type: application/json

{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "<CUSTOMER_PHONE>",
  "type": "text",
  "text": {
    "body": "أهلاً بحضرتك، تم تأكيد طلبك ورقم الطلب هو #1042"
  }
}
```
