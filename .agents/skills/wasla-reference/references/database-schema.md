# WASLA Database Schema & Data Models

## 1. Entity Relationship Overview

```text
stores
├── store_members (links auth.users -> stores)
├── channel_accounts (links WABA / Meta pages -> stores)
├── categories
│   └── products
│       └── product_variants
│           ├── inventory_movements
│           └── order_items
├── customers
│   ├── customer_addresses
│   ├── conversations
│   │   └── messages
│   └── orders
│       ├── order_items
│       ├── order_status_history
│       └── shipments
└── coupons
```

## 2. Table Definitions & Roles

### Multi-Tenancy & Access
- `stores`: `id`, `name`, `slug`, `logo_url`, `currency` (default 'EGP'), `created_at`.
- `store_members`: `id`, `store_id`, `user_id`, `role` (`owner`, `admin`, `manager`, `agent`, `viewer`), `created_at`.

### Channels & Accounts
- `channels`: Supported channel types (`whatsapp`, `instagram`, `facebook`).
- `channel_accounts`: `id`, `store_id`, `channel_type`, `account_id`, `phone_number_id`, `waba_id`, `display_phone_number`, `status`, `access_token_encrypted`.

### Social Inbox
- `customers`: `id`, `store_id`, `name`, `phone`, `email`, `notes`, `created_at`.
- `customer_addresses`: `id`, `customer_id`, `governorate`, `city`, `street`, `building`, `floor`, `apartment`, `is_default`.
- `conversations`: `id`, `store_id`, `customer_id`, `channel_account_id`, `status` (`open`, `pending`, `resolved`), `assigned_to`, `last_message_at`, `unread_count`.
- `messages`: `id`, `conversation_id`, `store_id`, `sender_type` (`customer`, `agent`, `system`), `external_message_id`, `content`, `media_url`, `message_type`, `created_at`.

### Catalog & Inventory
- `categories`: `id`, `store_id`, `name`, `slug`.
- `products`: `id`, `store_id`, `category_id`, `name`, `description`, `images`, `is_active`.
- `product_variants`: `id`, `product_id`, `sku`, `title`, `price`, `cost_price`, `stock_quantity`, `options` (JSONB for size, color).
- `inventory_movements`: `id`, `variant_id`, `store_id`, `movement_type` (`in`, `out`, `reserved`, `adjustment`), `quantity`, `reason`, `order_id`, `created_at`.

### Orders & Fulfillment
- `orders`: `id`, `store_id`, `customer_id`, `conversation_id`, `order_number`, `status` (`DRAFT`, `PENDING_CONFIRMATION`, `CONFIRMED`, `PREPARING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `RETURNED`), `subtotal`, `shipping_fee`, `discount`, `total`, `shipping_address` (JSONB), `payment_method` (`cod`, `instapay`, `card`), `created_at`.
- `order_items`: `id`, `order_id`, `variant_id`, `quantity`, `unit_price`, `total_price`.
- `order_status_history`: `id`, `order_id`, `previous_status`, `new_status`, `changed_by`, `notes`, `created_at`.
- `shipments`: `id`, `order_id`, `store_id`, `provider_id`, `tracking_number`, `waybill_url`, `status`.

## 3. Row-Level Security (RLS) Template
```sql
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access store orders" ON public.orders
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.store_members sm
    WHERE sm.store_id = orders.store_id
      AND sm.user_id = auth.uid()
  )
);
```
