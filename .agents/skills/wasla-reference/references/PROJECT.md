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
- React + TypeScript + Vite
- Tailwind CSS
- shadcn/ui
- Lucide
- Framer Motion
- React Router / TanStack Router
- TanStack Query
- Zustand only where local/global state is justified
- React Hook Form + Zod

### Backend / Platform
- Supabase Auth
- Supabase PostgreSQL
- Supabase RLS
- Supabase Realtime
- Supabase Storage
- Supabase Edge Functions

### Integrations
- Meta WhatsApp Cloud API
- Official Instagram/Facebook APIs
- AI provider abstraction
- Shipping providers later

### Deployment
- Vercel for frontend
- Supabase for backend/database/functions

Do not add Node/Express, Redis, queues, or workers unless actual requirements justify them.

## 4. Multi-Tenant Model
Hierarchy:

User -> Store -> Store Members -> Channels -> Customers -> Conversations -> Messages -> Orders -> Products/Inventory -> Shipments

Every tenant-owned record must be associated with `store_id`.

### Roles
- owner
- admin
- manager
- agent
- viewer

### Required tables
- profiles
- stores
- store_members
- channels
- channel_accounts
- categories
- products
- product_variants
- inventory_movements
- customers
- customer_addresses
- conversations
- messages
- orders
- order_items
- order_status_history
- shipments
- shipping_providers
- coupons
- notifications
- subscriptions
- plans
- usage_records
- audit_logs
- ai_events / ai_order_detections

## 5. Order Lifecycle
DRAFT -> PENDING_CONFIRMATION -> CONFIRMED -> PREPARING -> SHIPPED -> DELIVERED

Alternative terminal states:
- CANCELLED
- RETURNED

AI should initially create Draft Orders only. A human confirms the order.

## 6. Meta / WhatsApp Architecture
Each merchant connects their own WhatsApp Business assets.

Important identifiers:
- Meta App ID
- WABA ID
- Phone Number ID
- external account identifiers
- secure access-token reference
- external message ID
- display phone number

Never hardcode one merchant's IDs.

### Connection flow
1. Merchant clicks Connect WhatsApp.
2. WASLA starts official Meta Embedded Signup.
3. Merchant authenticates with Meta.
4. Merchant selects/creates the Business/WABA and phone number.
5. Merchant grants requested permissions.
6. WASLA stores connection metadata securely.
7. Webhook receives future events.
8. Incoming messages are mapped using `phone_number_id`.

Never use WhatsApp Web automation, QR scraping, password scraping, or unofficial APIs.

## 7. Webhook
Recommended production endpoint:

`https://<supabase-project>.supabase.co/functions/v1/meta-webhook`

### GET verification
Meta sends:
- `hub.mode`
- `hub.verify_token`
- `hub.challenge`

If the mode and token are valid, return the exact challenge as plain text with HTTP 200.

### POST flow
1. Receive Meta event.
2. Validate/normalize payload.
3. Identify `phone_number_id`.
4. Find `channel_account`.
5. Resolve `store_id`.
6. Find or create customer.
7. Find or create conversation.
8. Deduplicate using external message ID.
9. Save message.
10. Trigger async processing if required.
11. Return HTTP 200 quickly.

For Supabase Edge Functions called by Meta, deploy the webhook without Supabase JWT verification.

## 8. Inbox
The inbox should support:
- All / WhatsApp / Instagram / Facebook filters
- conversation list
- unread state
- customer information
- message history
- attachments/media
- reply composer
- quick replies
- assignment to agents
- tags
- order creation
- AI suggestions
- customer/order context

Use Supabase Realtime to update active conversations without polling.

## 9. AI Strategy
Do not train or build an LLM from scratch.

Use a hybrid system:
1. deterministic rules first
2. LLM only when language understanding is needed
3. structured JSON output
4. Zod validation
5. product/variant matching against database
6. create Draft Order
7. human confirmation

Example output:

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
