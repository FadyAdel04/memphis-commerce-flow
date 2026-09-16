---
name: wasla-reference
description: >-
  Comprehensive reference and operational runbook for WASLA (وِصلة) multi-tenant social-commerce SaaS.
  Use this skill whenever developing, extending, architecting, or querying features for WASLA—including
  multi-tenancy, unified social inbox (WhatsApp/Instagram/Facebook), Supabase database & RLS, Meta Webhooks,
  AI order detection, inventory, order lifecycle, and Egyptian commerce workflows.
---

# WASLA | وِصلة — Operational Runbook & Project Reference

WASLA is a multi-tenant operations layer for Egyptian social-commerce businesses that unifies customer conversations from WhatsApp, Instagram, and Facebook into a single inbox connected to orders, inventory, and AI purchase-intent detection.

---

## Quick Reference Index

| Topic | Reference Document | Key Focus |
| :--- | :--- | :--- |
| **Product Specification** | [PROJECT.md](./references/PROJECT.md) | Vision, user flows, MVP constraints, multi-tenant hierarchy |
| **System Architecture** | [architecture.md](./references/architecture.md) | TanStack Start, Tailwind v4, Supabase backend, directory layout |
| **Database & Security** | [database-schema.md](./references/database-schema.md) | 23+ tables, foreign keys, RLS policies, store isolation |
| **Meta / WhatsApp Cloud API** | [meta-integration.md](./references/meta-integration.md) | Embedded signup, webhooks, HMAC verification, message payload |
| **Order & Inventory Lifecycle**| [order-workflow.md](./references/order-workflow.md) | DRAFT to DELIVERED states, stock movements, AI order detection |

---

## Core Development Workflows

### 1. Multi-Tenant Querying & Mutation Pattern
When adding any new table, feature, or route:
1. **Always enforce `store_id`**: Every business entity (orders, products, conversations, messages, customers, shipments) must belong to a `store_id`.
2. **Never query without store context**: Ensure RLS policies verify store membership via `store_members (store_id, user_id)`:
   ```sql
   CREATE POLICY "store_access_policy" ON table_name
     FOR ALL TO authenticated
     USING (EXISTS (
       SELECT 1 FROM store_members sm
       WHERE sm.store_id = table_name.store_id AND sm.user_id = auth.uid()
     ));
   ```
3. **Frontend Context**: Retrieve the active store from the store context / URL query parameter, and pass it to TanStack Query keys (e.g. `['orders', currentStoreId]`).

### 2. Implementing Realtime Inbox Features
When working on the Unified Inbox (`src/routes/dashboard/index.tsx` and `src/components/inbox/`):
1. **Listen via Supabase Realtime**:
   Subscribe to `messages` and `conversations` filtered by `store_id`:
   ```typescript
   const channel = supabase
     .channel(`store-messages-${storeId}`)
     .on('postgres_changes', {
       event: 'INSERT',
       schema: 'public',
       table: 'messages',
       filter: `store_id=eq.${storeId}`
     }, handleNewMessage)
     .subscribe();
   ```
2. **Deduplication**: Always check `external_message_id` before appending to prevent duplicate renders from concurrent webhook events.
3. **Channel Badge Rendering**: Distinguish messages clearly by channel: `whatsapp` (green/phone), `instagram` (gradient/camera), and `facebook` (blue/messenger).

### 3. Handling Meta Webhooks & WhatsApp Cloud API
When maintaining or adding webhook capabilities in `supabase/functions/meta-webhook/`:
1. **GET Verification**: Handshake handler must verify `hub.mode === 'subscribe'` and `hub.verify_token === META_VERIFY_TOKEN`, returning `hub.challenge` as plain text with status 200.
2. **POST Handler Flow**:
   - Parse event body.
   - Extract `entry[0].changes[0].value`.
   - Identify `metadata.phone_number_id`.
   - Match against `channel_accounts` table to retrieve `store_id`.
   - Resolve or insert customer in `customers` table.
   - Find or create thread in `conversations` table.
   - Insert message into `messages` table with `external_message_id`.
   - Immediately return HTTP 200 within 3 seconds.
3. **Strict Compliance**: Never use unofficial WhatsApp libraries, QR scraping, or web automation.

### 4. AI-Assisted Order Detection Workflow
When processing customer conversations with AI:
1. **Deterministic Filter First**: Inspect messages for intent triggers (e.g., "عايز اطلب", "بكام", "عاوز مقاس", "فين العنوان", "احجزلي").
2. **Structured Output Only**: Call AI with a strict JSON schema and validate with Zod.
3. **Draft Order Creation**:
   - Match extracted items against `product_variants` by SKU or name in the merchant's catalog.
   - Always create the order in status `DRAFT`.
   - Provide an actionable banner in the agent's chat interface: *"AI detected a purchase request: 1x T-Shirt (Black / L). Review and confirm order."*
   - Never automatically charge or mark as `CONFIRMED` without human merchant review.

### 5. Order State Transitions & Inventory Synchronization
1. `DRAFT`: Order proposed; stock is not reserved.
2. `PENDING_CONFIRMATION`: Merchant awaiting customer confirmation.
3. `CONFIRMED`: Merchant confirms; automatically generate `inventory_movements` record (`movement_type = 'reserved'` or `'out'`).
4. `PREPARING`: Packing and waybill printing.
5. `SHIPPED`: Courier assigned, waybill/tracking code attached.
6. `DELIVERED`: Final state, updates revenue analytics.
7. `CANCELLED` / `RETURNED`: Reverses inventory movement (`movement_type = 'in'`).

---

## Egyptian Market Conventions
- **Currency**: Egyptian Pound (`EGP` / `ج.م`). Format using `ar-EG` or standard locale helpers.
- **Governorates (المحافظات)**: Standardize shipping destination options (Cairo, Giza, Alexandria, Qalyubia, Sharqia, Dakahlia, Gharbia, Menofia, etc.).
- **Phone Numbers**: Support both local (`010...`, `011...`, `012...`, `015...`) and international (`+201...`) formats.
- **Tone & Language**: The UI and customer messaging should accommodate Egyptian Arabic and Franco-Arabic queries seamlessly.

---

## Lovable Sync Rules
> [!IMPORTANT]
> The repository is connected to Lovable. Never execute commands that alter historical commits (e.g. `git rebase`, `git commit --amend` on pushed commits, or `git push --force`). Keep all additions clean and testable.
