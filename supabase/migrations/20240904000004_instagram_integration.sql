-- Migration: Instagram Business API Integration
-- Adds instagram_integrations table and deduplication columns

-- 1. Add external_message_id to messages (deduplication for all channels)
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS external_message_id TEXT,
  ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE;

-- Index for fast dedup lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_messages_external_message_id
  ON public.messages(external_message_id)
  WHERE external_message_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_messages_store_id
  ON public.messages(store_id);

-- 2. Add sender_id to conversations (IG Scoped User ID / WA ID for reply routing)
ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS sender_id TEXT;

-- 3. Instagram integrations table — one row per connected Instagram Business account per store
CREATE TABLE IF NOT EXISTS public.instagram_integrations (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  store_id          UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  ig_app_id         TEXT NOT NULL DEFAULT '1624922232609458',
  ig_page_id        TEXT,           -- Instagram Business Account ID (used for webhook routing)
  ig_user_id        TEXT,           -- IG User ID
  ig_username       TEXT,           -- @handle
  ig_name           TEXT,           -- Display name
  ig_profile_pic    TEXT,           -- Profile picture URL
  ig_access_token   TEXT,           -- Long-lived token (store encrypted in production)
  token_expires_at  TIMESTAMP WITH TIME ZONE,
  status            TEXT DEFAULT 'connected', -- connected, disconnected, expired, pending
  webhook_subscribed BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  UNIQUE(store_id, ig_page_id)
);

-- Enable RLS
ALTER TABLE public.instagram_integrations ENABLE ROW LEVEL SECURITY;

-- User access policies (scoped to store ownership)
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

-- Webhook service-role access for ingestion (same open-policy pattern as WhatsApp)
DROP POLICY IF EXISTS "Allow webhook to select instagram integrations" ON public.instagram_integrations;
CREATE POLICY "Allow webhook to select instagram integrations"
  ON public.instagram_integrations FOR SELECT
  USING (true);

-- Updated_at trigger
CREATE TRIGGER handle_instagram_integrations_updated_at
  BEFORE UPDATE ON public.instagram_integrations
  FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_instagram_integrations_store_id ON public.instagram_integrations(store_id);
CREATE INDEX IF NOT EXISTS idx_instagram_integrations_ig_page_id ON public.instagram_integrations(ig_page_id);

-- 4. Allow webhook to read/write instagram integrations (service role bypasses RLS already,
--    but in case anon key is used in edge function, add explicit read policy)
DROP POLICY IF EXISTS "Allow webhook to insert messages with ext id" ON public.messages;
CREATE POLICY "Allow webhook to insert messages with ext id"
  ON public.messages FOR INSERT
  WITH CHECK (true);

-- Ensure realtime is enabled for instagram_integrations status updates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'instagram_integrations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.instagram_integrations;
  END IF;
END $$;
