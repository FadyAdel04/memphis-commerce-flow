-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: fix_multitenancy_v2
-- Critical multi-tenant security fix for WASLA SaaS
--
-- What this does:
-- 1. Creates store_members table (additive — keeps stores.user_id intact)
-- 2. Backfills owner rows from existing stores.user_id relationships
-- 3. Creates is_store_member() SECURITY DEFINER helper (no RLS recursion)
-- 4. Drops all USING (true) open policies on tenant tables
-- 5. Replaces with membership-based RLS policies via is_store_member()
-- 6. Upgrades all other tables from stores.user_id to is_store_member()
-- 7. Adds performance indexes
--
-- Safety: NO existing data is deleted or randomly reassigned.
-- ══════════════════════════════════════════════════════════════════════════════

-- ── 1. Create store_members table ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.store_members (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id    UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'owner'
                CHECK (role IN ('owner', 'admin', 'manager', 'agent', 'viewer')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (store_id, user_id)
);

ALTER TABLE public.store_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view their own memberships" ON public.store_members;
CREATE POLICY "Members can view their own memberships"
  ON public.store_members FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Authenticated users can create memberships for themselves" ON public.store_members;
CREATE POLICY "Authenticated users can create memberships for themselves"
  ON public.store_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ── 2. Backfill: seed owner rows from existing stores.user_id ────────────────
INSERT INTO public.store_members (store_id, user_id, role)
SELECT id, user_id, 'owner'
FROM public.stores
WHERE user_id IS NOT NULL
ON CONFLICT (store_id, user_id) DO NOTHING;

-- ── 3. Create is_store_member() helper ───────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_store_member(target_store_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.store_members sm
    WHERE sm.store_id = target_store_id
      AND sm.user_id  = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_store_member(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_store_member(UUID) TO authenticated;

-- ── 4. FIX: stores RLS ───────────────────────────────────────────────────────
-- Drop the DANGEROUS open policy added by migration 3
DROP POLICY IF EXISTS "Allow public/webhook to select stores for routing" ON public.stores;

-- Keep existing user_id policies, additionally allow store_members to view
DROP POLICY IF EXISTS "Members can view their stores" ON public.stores;
CREATE POLICY "Members can view their stores"
  ON public.stores FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.is_store_member(id)
  );

-- ── 5. FIX: conversations RLS ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view their own store conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can insert conversations for their own store" ON public.conversations;
DROP POLICY IF EXISTS "Users can update conversations for their own store" ON public.conversations;
DROP POLICY IF EXISTS "Users can delete conversations for their own store" ON public.conversations;
DROP POLICY IF EXISTS "Allow webhook to insert conversations" ON public.conversations;
DROP POLICY IF EXISTS "Allow webhook to select conversations" ON public.conversations;
DROP POLICY IF EXISTS "Allow webhook to update conversations" ON public.conversations;

CREATE POLICY "Store members can view conversations"
  ON public.conversations FOR SELECT
  USING (public.is_store_member(store_id));

CREATE POLICY "Store members can insert conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (public.is_store_member(store_id));

CREATE POLICY "Store members can update conversations"
  ON public.conversations FOR UPDATE
  USING (public.is_store_member(store_id));

CREATE POLICY "Store members can delete conversations"
  ON public.conversations FOR DELETE
  USING (public.is_store_member(store_id));

-- ── 6. FIX: messages RLS ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view their own store messages" ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages for their own store" ON public.messages;
DROP POLICY IF EXISTS "Allow webhook to insert messages" ON public.messages;
DROP POLICY IF EXISTS "Allow webhook to insert messages with ext id" ON public.messages;
DROP POLICY IF EXISTS "Allow webhook to select messages" ON public.messages;

CREATE POLICY "Store members can view messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND public.is_store_member(c.store_id)
    )
  );

CREATE POLICY "Store members can insert messages via conversation"
  ON public.messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND public.is_store_member(c.store_id)
    )
  );

-- ── 7. FIX: instagram_integrations RLS ───────────────────────────────────────
DROP POLICY IF EXISTS "Users can view their store instagram integrations" ON public.instagram_integrations;
DROP POLICY IF EXISTS "Users can insert store instagram integrations" ON public.instagram_integrations;
DROP POLICY IF EXISTS "Users can update store instagram integrations" ON public.instagram_integrations;
DROP POLICY IF EXISTS "Users can delete store instagram integrations" ON public.instagram_integrations;
DROP POLICY IF EXISTS "Allow webhook to select instagram integrations" ON public.instagram_integrations;
DROP POLICY IF EXISTS "Allow webhook to insert instagram integrations" ON public.instagram_integrations;
DROP POLICY IF EXISTS "Allow webhook to update instagram integrations" ON public.instagram_integrations;

CREATE POLICY "Store members can view instagram integrations"
  ON public.instagram_integrations FOR SELECT
  USING (public.is_store_member(store_id));

CREATE POLICY "Store members can insert instagram integrations"
  ON public.instagram_integrations FOR INSERT
  WITH CHECK (public.is_store_member(store_id));

CREATE POLICY "Store members can update instagram integrations"
  ON public.instagram_integrations FOR UPDATE
  USING (public.is_store_member(store_id));

CREATE POLICY "Store members can delete instagram integrations"
  ON public.instagram_integrations FOR DELETE
  USING (public.is_store_member(store_id));

-- ── 8. FIX: meta_integrations RLS ────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view their own store meta integrations" ON public.meta_integrations;
DROP POLICY IF EXISTS "Users can insert meta integrations for their own store" ON public.meta_integrations;
DROP POLICY IF EXISTS "Users can update meta integrations for their own store" ON public.meta_integrations;
DROP POLICY IF EXISTS "Users can delete meta integrations for their own store" ON public.meta_integrations;
DROP POLICY IF EXISTS "Users can view their store meta integrations" ON public.meta_integrations;
DROP POLICY IF EXISTS "Users can upsert their store meta integrations" ON public.meta_integrations;
DROP POLICY IF EXISTS "Allow webhook to read meta integrations" ON public.meta_integrations;

CREATE POLICY "Store members can view meta integrations"
  ON public.meta_integrations FOR SELECT
  USING (public.is_store_member(store_id));

CREATE POLICY "Store members can insert meta integrations"
  ON public.meta_integrations FOR INSERT
  WITH CHECK (public.is_store_member(store_id));

CREATE POLICY "Store members can update meta integrations"
  ON public.meta_integrations FOR UPDATE
  USING (public.is_store_member(store_id));

CREATE POLICY "Store members can delete meta integrations"
  ON public.meta_integrations FOR DELETE
  USING (public.is_store_member(store_id));

-- ── 9. Upgrade other tables from stores.user_id to is_store_member() ─────────

-- products
DROP POLICY IF EXISTS "Users can view their own store products" ON public.products;
DROP POLICY IF EXISTS "Users can insert products for their own store" ON public.products;
DROP POLICY IF EXISTS "Users can update products for their own store" ON public.products;
DROP POLICY IF EXISTS "Users can delete products for their own store" ON public.products;
CREATE POLICY "Store members can view products"    ON public.products FOR SELECT USING (public.is_store_member(store_id));
CREATE POLICY "Store members can insert products"  ON public.products FOR INSERT WITH CHECK (public.is_store_member(store_id));
CREATE POLICY "Store members can update products"  ON public.products FOR UPDATE USING (public.is_store_member(store_id));
CREATE POLICY "Store members can delete products"  ON public.products FOR DELETE USING (public.is_store_member(store_id));

-- orders
DROP POLICY IF EXISTS "Users can view their own store orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert orders for their own store" ON public.orders;
DROP POLICY IF EXISTS "Users can update orders for their own store" ON public.orders;
DROP POLICY IF EXISTS "Users can delete orders for their own store" ON public.orders;
CREATE POLICY "Store members can view orders"    ON public.orders FOR SELECT USING (public.is_store_member(store_id));
CREATE POLICY "Store members can insert orders"  ON public.orders FOR INSERT WITH CHECK (public.is_store_member(store_id));
CREATE POLICY "Store members can update orders"  ON public.orders FOR UPDATE USING (public.is_store_member(store_id));
CREATE POLICY "Store members can delete orders"  ON public.orders FOR DELETE USING (public.is_store_member(store_id));

-- customers
DROP POLICY IF EXISTS "Users can view their own store customers" ON public.customers;
DROP POLICY IF EXISTS "Users can insert customers for their own store" ON public.customers;
DROP POLICY IF EXISTS "Users can update customers for their own store" ON public.customers;
DROP POLICY IF EXISTS "Users can delete customers for their own store" ON public.customers;
CREATE POLICY "Store members can view customers"    ON public.customers FOR SELECT USING (public.is_store_member(store_id));
CREATE POLICY "Store members can insert customers"  ON public.customers FOR INSERT WITH CHECK (public.is_store_member(store_id));
CREATE POLICY "Store members can update customers"  ON public.customers FOR UPDATE USING (public.is_store_member(store_id));
CREATE POLICY "Store members can delete customers"  ON public.customers FOR DELETE USING (public.is_store_member(store_id));

-- inventory_movements
DROP POLICY IF EXISTS "Users can view inventory movements for their own store" ON public.inventory_movements;
DROP POLICY IF EXISTS "Users can insert inventory movements for their own store" ON public.inventory_movements;
CREATE POLICY "Store members can view inventory movements"   ON public.inventory_movements FOR SELECT USING (public.is_store_member(store_id));
CREATE POLICY "Store members can insert inventory movements" ON public.inventory_movements FOR INSERT WITH CHECK (public.is_store_member(store_id));

-- staff
DROP POLICY IF EXISTS "Users can view their own store staff" ON public.staff;
DROP POLICY IF EXISTS "Users can insert staff for their own store" ON public.staff;
DROP POLICY IF EXISTS "Users can update staff for their own store" ON public.staff;
DROP POLICY IF EXISTS "Users can delete staff for their own store" ON public.staff;
CREATE POLICY "Store members can view staff"    ON public.staff FOR SELECT USING (public.is_store_member(store_id));
CREATE POLICY "Store members can insert staff"  ON public.staff FOR INSERT WITH CHECK (public.is_store_member(store_id));
CREATE POLICY "Store members can update staff"  ON public.staff FOR UPDATE USING (public.is_store_member(store_id));
CREATE POLICY "Store members can delete staff"  ON public.staff FOR DELETE USING (public.is_store_member(store_id));

-- store_settings
DROP POLICY IF EXISTS "Users can view their own store settings" ON public.store_settings;
DROP POLICY IF EXISTS "Users can insert settings for their own store" ON public.store_settings;
DROP POLICY IF EXISTS "Users can update settings for their own store" ON public.store_settings;
DROP POLICY IF EXISTS "Users can delete settings for their own store" ON public.store_settings;
CREATE POLICY "Store members can view store settings"    ON public.store_settings FOR SELECT USING (public.is_store_member(store_id));
CREATE POLICY "Store members can insert store settings"  ON public.store_settings FOR INSERT WITH CHECK (public.is_store_member(store_id));
CREATE POLICY "Store members can update store settings"  ON public.store_settings FOR UPDATE USING (public.is_store_member(store_id));
CREATE POLICY "Store members can delete store settings"  ON public.store_settings FOR DELETE USING (public.is_store_member(store_id));

-- order_items
DROP POLICY IF EXISTS "Users can view their own store order items" ON public.order_items;
CREATE POLICY "Store members can view order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND public.is_store_member(o.store_id)
    )
  );
CREATE POLICY "Store members can insert order items"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND public.is_store_member(o.store_id)
    )
  );

-- ── 10. Indexes ───────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_store_members_user_id  ON public.store_members(user_id);
CREATE INDEX IF NOT EXISTS idx_store_members_store_id ON public.store_members(store_id);
CREATE INDEX IF NOT EXISTS idx_store_members_role      ON public.store_members(role);

-- Ensure external_message_id deduplication index exists
CREATE UNIQUE INDEX IF NOT EXISTS idx_messages_external_message_id_unique
  ON public.messages(external_message_id)
  WHERE external_message_id IS NOT NULL;

-- ── 11. Trigger: Auto-link store creators to store_members as owner ───────────
CREATE OR REPLACE FUNCTION public.handle_new_store_owner()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.store_members (store_id, user_id, role)
  VALUES (NEW.id, NEW.user_id, 'owner')
  ON CONFLICT (store_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_store_owner_membership ON public.stores;
CREATE TRIGGER trg_store_owner_membership
AFTER INSERT ON public.stores
FOR EACH ROW
WHEN (NEW.user_id IS NOT NULL)
EXECUTE FUNCTION public.handle_new_store_owner();

