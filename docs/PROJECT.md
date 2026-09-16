# WASLA | وِصلة — Project Reference

## 1. Product
WASLA is a multi-tenant SaaS for Egyptian social-commerce businesses. It centralizes customer conversations from WhatsApp, Instagram, and Facebook into one operational inbox, then connects conversations to customers, products, inventory, orders, shipping, analytics, and AI-assisted order detection.

**Core positioning:** Every conversation. One place.  
**Arabic:** كل رسائلك. مكان واحد.

The merchant keeps using their normal social channels. WASLA becomes the merchant's operations layer.

## 2. Primary User Flow
1. Sign up / log in.
2. Create a store/organization.
3. Complete onboarding.
4. Connect WhatsApp through Meta Embedded Signup.
5. Optionally connect Instagram/Facebook.
6. Receive customer messages through official webhooks.
7. Resolve channel -> store -> customer -> conversation.
8. Save messages in Supabase.
9. Push updates to the inbox with Supabase Realtime.
10. Merchant replies from WASLA.
11. AI detects purchase intent when useful.
12. AI returns structured order data.
13. Create a Draft Order.
14. Merchant reviews and confirms.
15. Inventory is updated.
16. Shipment is created.
17. Dashboard tracks performance.

## 3. MVP Architecture
### Frontend
- React + TypeScript + Vite (TanStack Start / TanStack Router)
- Tailwind CSS (v4)
- shadcn/ui (Radix primitives)
- Lucide React
- Framer Motion / tw-animate-css
- TanStack Query
- Zustand (only where local/global state is justified)
- React Hook Form + Zod

### Backend / Platform
- Supabase Auth
- Supabase PostgreSQL
- Supabase RLS (Row-Level Security)
- Supabase Realtime
- Supabase Storage
- Supabase Edge Functions (Deno / TypeScript)

### Integrations
- Meta WhatsApp Cloud API
- Official Instagram/Facebook APIs
- AI provider abstraction (OpenAI / Claude / Gemini structured output)
- Shipping providers (Bosta, Mylerz, etc. later)

### Deployment
- Vercel for frontend
- Supabase for backend/database/functions

> [!IMPORTANT]
> Do not add Node/Express, Redis, queues, or workers unless actual requirements justify them. Keep architecture lean on Supabase.

## 4. Multi-Tenant Model
Hierarchy:

`User` -> `Store` -> `Store Members` -> `Channels` -> `Customers` -> `Conversations` -> `Messages` -> `Orders` -> `Products/Inventory` -> `Shipments`

Every tenant-owned record must be associated with `store_id`.

### Roles
- `owner`: Full store ownership and billing control.
- `admin`: Full configuration, channel connection, store management.
- `manager`: Inventory, orders, customer operations, analytics.
- `agent`: Inbox replies, customer notes, draft orders.
- `viewer`: Read-only access to reports and data.

### Required Tables
- `profiles`: User profile data (auth.users extension).
- `stores`: Tenants / organizations.
- `store_members`: User membership in stores with roles.
- `channels`: Supported channel types (whatsapp, instagram, facebook).
- `channel_accounts`: Connected merchant social accounts (WABA, Page, IG).
- `categories`: Product categories per store.
- `products`: Base catalog items.
- `product_variants`: SKU, size, color, barcode, price, cost.
- `inventory_movements`: Stock audit trail (in, out, reserved, adjusted).
- `customers`: Customer directory tied to store.
- `customer_addresses`: Egyptian governorate, city, street, postal code.
- `conversations`: Threads linking customers and channels.
- `messages`: Individual messages (inbound/outbound) with external IDs.
- `orders`: Core order records with lifecycle status.
- `order_items`: Line items linked to product variants.
- `order_status_history`: Timestamped audit trail of status transitions.
- `shipments`: Courier assignments, tracking numbers, waybills.
- `shipping_providers`: Integrated courier services.
- `coupons`: Discounts and promotional codes.
- `notifications`: In-app and system alerts.
- `subscriptions`: Merchant SaaS tier and billing status.
- `plans`: SaaS pricing tiers.
- `usage_records`: Quota tracking (messages sent, AI detections, stores).
- `audit_logs`: Security and operational audit trail.
- `ai_events` / `ai_order_detections`: AI intent classifications and extracted payloads.

## 5. Order Lifecycle
```text
[DRAFT] ──> [PENDING_CONFIRMATION] ──> [CONFIRMED] ──> [PREPARING] ──> [SHIPPED] ──> [DELIVERED]
   │                 │                     │
   └─── [CANCELLED] <─┴─────────────────────┘
   │
   └─── [RETURNED] (after delivery)
```

**Key Principle:** AI initially creates **Draft Orders only**. A human merchant confirms the order before stock commitment and fulfillment.

## 6. Meta / WhatsApp Architecture
Each merchant connects their own WhatsApp Business assets.

Important identifiers:
- Meta App ID
- WABA ID (WhatsApp Business Account ID)
- Phone Number ID
- External account identifiers
- Secure access-token reference
- External message ID (for deduplication)
- Display phone number

Never hardcode one merchant's IDs.

### Connection Flow
1. Merchant clicks Connect WhatsApp.
2. WASLA starts official Meta Embedded Signup.
3. Merchant authenticates with Meta.
4. Merchant selects/creates the Business/WABA and phone number.
5. Merchant grants requested permissions (`whatsapp_business_management`, `whatsapp_business_messaging`).
6. WASLA stores connection metadata securely.
7. Webhook receives future events.
8. Incoming messages are mapped using `phone_number_id`.

> [!WARNING]
> Never use WhatsApp Web automation, QR scraping, password scraping, or unofficial APIs. Use only official Cloud API.

## 7. Webhook
Recommended production endpoint:  
`https://<supabase-project>.supabase.co/functions/v1/meta-webhook`

### GET Verification (Hub Handshake)
Meta sends:
- `hub.mode`
- `hub.verify_token`
- `hub.challenge`

If mode and verify_token match environment secrets, return `hub.challenge` as plain text with HTTP 200.

### POST Flow
1. Receive Meta event.
2. Validate and normalize payload.
3. Identify `phone_number_id`.
4. Find `channel_account` in database.
5. Resolve `store_id`.
6. Find or create customer (using phone number / profile name).
7. Find or create conversation.
8. Deduplicate using external message ID (`wamid.*`).
9. Save message.
10. Trigger async processing / AI detection if appropriate.
11. Return HTTP 200 quickly (< 3 seconds) to satisfy Meta SLA.

> [!NOTE]
> Deploy edge functions receiving Meta webhooks with `verify_jwt: false` (or `--no-verify-jwt`) since Meta signatures are verified via HMAC-SHA256 headers or verify tokens, not Supabase user JWTs.

## 8. Inbox
The unified operational inbox supports:
- Filter by All / WhatsApp / Instagram / Facebook.
- Realtime conversation list with unread badges.
- Customer context sidebar (name, phone, governorate, order count, total spend).
- Message history thread (text, images, voice notes, documents, location).
- Interactive reply composer with quick replies & canned snippets.
- Agent assignment and status filtering (Open, Pending, Resolved).
- Conversation tags (e.g. VIP, Inquiry, Complaint, Wholesale).
- One-click Draft Order creation directly from the chat context.
- AI suggestions card showing detected purchase intent.

Use Supabase Realtime subscriptions to update messages and conversations instantly without polling.

## 9. AI Strategy
Do not train or build an LLM from scratch.

Use a hybrid approach:
1. Deterministic rules & regex first (quick greeting, order number lookup, FAQ).
2. LLM only when natural language understanding or messy Arabic/Franco-Arabic extraction is needed.
3. Structured JSON output with strict schema.
4. Zod validation on backend/edge function.
5. Product & variant matching against the store's database catalog.
6. Create a Draft Order.
7. Human confirmation by merchant agent.

### Example Structured Output
```json
{
  "intent": "purchase",
  "product_query": "تيشيرت",
  "color": "black",
  "size": "L",
  "quantity": 1,
  "confidence": 0.94
}
```
