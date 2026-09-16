-- Migration: Fix multi-tenancy RLS for conversations, messages, and instagram_integrations
-- Ensures each user only sees data from their own store

-- ── 1. Conversations: enforce store ownership via auth.uid() ──────────────────
DROP POLICY IF EXISTS "Users can view their own store conversations" ON public.conversations;
CREATE POLICY "Users can view their own store conversations"
  ON public.conversations FOR SELECT
  USING (
    store_id IN (
      SELECT id FROM public.stores WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert conversations for their own store" ON public.conversations;
CREATE POLICY "Users can insert conversations for their own store"
  ON public.conversations FOR INSERT
  WITH CHECK (
    store_id IN (
      SELECT id FROM public.stores WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update conversations for their own store" ON public.conversations;
CREATE POLICY "Users can update conversations for their own store"
  ON public.conversations FOR UPDATE
  USING (
    store_id IN (
      SELECT id FROM public.stores WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Allow webhook to insert conversations" ON public.conversations;
CREATE POLICY "Allow webhook to insert conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow webhook to select conversations" ON public.conversations;
CREATE POLICY "Allow webhook to select conversations"
  ON public.conversations FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow webhook to update conversations" ON public.conversations;
CREATE POLICY "Allow webhook to update conversations"
  ON public.conversations FOR UPDATE
  USING (true);

-- ── 2. Messages: enforce store ownership ─────────────────────────────────────
DROP POLICY IF EXISTS "Users can view their own store messages" ON public.messages;
CREATE POLICY "Users can view their own store messages"
  ON public.messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations WHERE store_id IN (
        SELECT id FROM public.stores WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Allow webhook to insert messages with ext id" ON public.messages;
CREATE POLICY "Allow webhook to insert messages with ext id"
  ON public.messages FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow webhook to select messages" ON public.messages;
CREATE POLICY "Allow webhook to select messages"
  ON public.messages FOR SELECT
  USING (true);

-- ── 3. Instagram integrations: ensure unique per (store_id, ig_page_id) ──────
DROP POLICY IF EXISTS "Users can view their store instagram integrations" ON public.instagram_integrations;
CREATE POLICY "Users can view their store instagram integrations"
  ON public.instagram_integrations FOR SELECT
  USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert store instagram integrations" ON public.instagram_integrations;
CREATE POLICY "Users can insert store instagram integrations"
  ON public.instagram_integrations FOR INSERT
  WITH CHECK (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update store instagram integrations" ON public.instagram_integrations;
CREATE POLICY "Users can update store instagram integrations"
  ON public.instagram_integrations FOR UPDATE
  USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete store instagram integrations" ON public.instagram_integrations;
CREATE POLICY "Users can delete store instagram integrations"
  ON public.instagram_integrations FOR DELETE
  USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Allow webhook to select instagram integrations" ON public.instagram_integrations;
CREATE POLICY "Allow webhook to select instagram integrations"
  ON public.instagram_integrations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow webhook to insert instagram integrations" ON public.instagram_integrations;
CREATE POLICY "Allow webhook to insert instagram integrations"
  ON public.instagram_integrations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow webhook to update instagram integrations" ON public.instagram_integrations;
CREATE POLICY "Allow webhook to update instagram integrations"
  ON public.instagram_integrations FOR UPDATE USING (true);

-- ── 4. meta_integrations: ensure user scoping ────────────────────────────────
ALTER TABLE IF EXISTS public.meta_integrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their store meta integrations" ON public.meta_integrations;
CREATE POLICY "Users can view their store meta integrations"
  ON public.meta_integrations FOR SELECT
  USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can upsert their store meta integrations" ON public.meta_integrations;
CREATE POLICY "Users can upsert their store meta integrations"
  ON public.meta_integrations FOR ALL
  USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()))
  WITH CHECK (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Allow webhook to read meta integrations" ON public.meta_integrations;
CREATE POLICY "Allow webhook to read meta integrations"
  ON public.meta_integrations FOR SELECT USING (true);
