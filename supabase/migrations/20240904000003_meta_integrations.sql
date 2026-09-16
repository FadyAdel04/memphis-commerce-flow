-- Phase 8: Meta Integration (WhatsApp Cloud API & Instagram) Schema & Policies

-- 1. Add columns to store_settings / conversations for enhanced Meta tracking
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_avatar TEXT,
ADD COLUMN IF NOT EXISTS unread_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS draft_order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL;

-- 2. Add Meta Integration configurations table
CREATE TABLE IF NOT EXISTS public.meta_integrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  app_id TEXT NOT NULL,
  waba_id TEXT,
  phone_number_id TEXT,
  display_phone_number TEXT,
  verified_name TEXT,
  quality_rating TEXT DEFAULT 'GREEN',
  access_token TEXT,
  webhook_verify_token TEXT,
  status TEXT DEFAULT 'connected', -- connected, disconnected, expired, pending_review
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(store_id, phone_number_id)
);

-- Enable RLS
ALTER TABLE public.meta_integrations ENABLE ROW LEVEL SECURITY;

-- User Policies for meta_integrations
DROP POLICY IF EXISTS "Users can view their own store meta integrations" ON public.meta_integrations;
CREATE POLICY "Users can view their own store meta integrations"
ON public.meta_integrations FOR SELECT
USING (
  store_id IN (
    SELECT id FROM public.stores WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can insert meta integrations for their own store" ON public.meta_integrations;
CREATE POLICY "Users can insert meta integrations for their own store"
ON public.meta_integrations FOR INSERT
WITH CHECK (
  store_id IN (
    SELECT id FROM public.stores WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update meta integrations for their own store" ON public.meta_integrations;
CREATE POLICY "Users can update meta integrations for their own store"
ON public.meta_integrations FOR UPDATE
USING (
  store_id IN (
    SELECT id FROM public.stores WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete meta integrations for their own store" ON public.meta_integrations;
CREATE POLICY "Users can delete meta integrations for their own store"
ON public.meta_integrations FOR DELETE
USING (
  store_id IN (
    SELECT id FROM public.stores WHERE user_id = auth.uid()
  )
);

-- 3. Webhook Access Policies (Allows server webhook handler to ingest incoming customer messages)
DROP POLICY IF EXISTS "Allow public/webhook to select stores for routing" ON public.stores;
CREATE POLICY "Allow public/webhook to select stores for routing"
ON public.stores FOR SELECT
USING (true);

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

DROP POLICY IF EXISTS "Allow webhook to insert messages" ON public.messages;
CREATE POLICY "Allow webhook to insert messages"
ON public.messages FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow webhook to select messages" ON public.messages;
CREATE POLICY "Allow webhook to select messages"
ON public.messages FOR SELECT
USING (true);

-- 4. Enable Realtime on conversations and messages (safely checks if already in publication)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'conversations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END $$;

