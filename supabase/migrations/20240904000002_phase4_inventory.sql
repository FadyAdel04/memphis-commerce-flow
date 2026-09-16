-- Phase 4: Extended Products, Variants, Inventory Movements Ledger, Plans & Store Settings

-- 1. Upgrade stores table with plan, trial, contact, and localization fields
alter table public.stores 
  add column if not exists plan text default 'growth',
  add column if not exists trial_ends_at timestamp with time zone default (now() + interval '14 days'),
  add column if not exists subscription_status text default 'trial', -- trial, active, expired, cancelled
  add column if not exists phone text,
  add column if not exists address text,
  add column if not exists currency text default 'EGP',
  add column if not exists timezone text default 'Africa/Cairo',
  add column if not exists logo_url text;

-- 2. Upgrade products table with compare_price, multiple images, status, and variants
alter table public.products
  add column if not exists compare_price decimal(10,2),
  add column if not exists images text[] default '{}',
  add column if not exists status text default 'active', -- active, draft, archived
  add column if not exists variants jsonb default '[]'::jsonb;

-- 3. Create inventory_movements table for tracking every stock adjustment
create table if not exists public.inventory_movements (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid references public.stores(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  variant_sku text,
  quantity_change integer not null, -- e.g. +10, -2
  previous_quantity integer not null,
  new_quantity integer not null,
  reason text not null, -- 'order', 'return', 'manual_adjustment', 'restock'
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on inventory_movements
alter table public.inventory_movements enable row level security;

-- Policies for inventory_movements
create policy "Users can view inventory movements for their own store"
on public.inventory_movements for select
using (
  store_id in (
    select id from public.stores where user_id = auth.uid()
  )
);

create policy "Users can insert inventory movements for their own store"
on public.inventory_movements for insert
with check (
  store_id in (
    select id from public.stores where user_id = auth.uid()
  )
);

-- Indexes for performance
create index if not exists idx_inventory_movements_store_id on public.inventory_movements(store_id);
create index if not exists idx_inventory_movements_product_id on public.inventory_movements(product_id);
create index if not exists idx_inventory_movements_created_at on public.inventory_movements(created_at desc);
