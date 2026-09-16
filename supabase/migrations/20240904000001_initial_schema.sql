-- Create stores table for multi-tenant architecture
create table public.stores (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  category text, -- fashion, beauty, electronics, food, accessories, other
  platforms jsonb default '{}'::jsonb, -- {instagram: boolean, whatsapp: boolean, facebook: boolean, website: boolean}
  product_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) on stores table
alter table public.stores enable row level security;

-- Create policy: Users can only see their own stores
create policy "Users can view their own stores"
on public.stores for select
using (auth.uid() = user_id);

-- Create policy: Users can only insert their own stores
create policy "Users can insert their own stores"
on public.stores for insert
with check (auth.uid() = user_id);

-- Create policy: Users can only update their own stores
create policy "Users can update their own stores"
on public.stores for update
using (auth.uid() = user_id);

-- Create policy: Users can only delete their own stores
create policy "Users can delete their own stores"
on public.stores for delete
using (auth.uid() = user_id);

-- Create updated_at trigger for stores table
create trigger handle_stores_updated_at
before update on public.stores
for each row
execute procedure moddatetime (updated_at);

-- Create indexes for better performance
create index idx_stores_user_id on public.stores(user_id);

-- Create tables for other entities that should be store-scoped
-- Products table
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid references public.stores(id) on delete cascade not null,
  name text not null,
  description text,
  price decimal(10,2),
  sku text unique,
  barcode text,
  category text,
  inventory_quantity integer default 0,
  low_stock_threshold integer default 5,
  is_active boolean default true,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on products table
alter table public.products enable row level security;

-- Create policy: Users can only access products from their own stores
create policy "Users can view their own store products"
on public.products for select
using (
  store_id in (
    select id from public.stores where user_id = auth.uid()
  )
);

create policy "Users can insert products for their own store"
on public.products for insert
with check (
  store_id in (
    select id from public.stores where user_id = auth.uid()
  )
);

create policy "Users can update products for their own store"
on public.products for update
using (
  store_id in (
    select id from public.stores where user_id = auth.uid()
  )
);

create policy "Users can delete products for their own store"
on public.products for delete
using (
  store_id in (
    select id from public.stores where user_id = auth.uid()
  )
);

-- Create updated_at trigger for products table
create trigger handle_products_updated_at
before update on public.products
for each row
execute procedure moddatetime (updated_at);

-- Create indexes for products table
create index idx_products_store_id on public.products(store_id);
create index idx_products_sku on public.products(sku);
create index idx_products_barcode on public.products(barcode);

-- Orders table
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid references public.stores(id) on delete cascade not null,
  customer_name text not null,
  customer_phone text,
  customer_email text,
  total_amount decimal(10,2) not null,
  status text default 'pending', -- pending, processing, shipped, delivered, cancelled
  payment_status text default 'pending', -- pending, paid, failed, refunded
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on orders table
alter table public.orders enable row level security;

-- Create policy: Users can only access orders from their own stores
create policy "Users can view their own store orders"
on public.orders for select
using (
  store_id in (
    select id from public.stores where user_id = auth.uid()
  )
);

create policy "Users can insert orders for their own store"
on public.orders for insert
with check (
  store_id in (
    select id from public.stores where user_id = auth.uid()
  )
);

create policy "Users can update orders for their own store"
on public.orders for update
using (
  store_id in (
    select id from public.stores where user_id = auth.uid()
  )
);

create policy "Users can delete orders for their own store"
on public.orders for delete
using (
  store_id in (
    select id from public.stores where user_id = auth.uid()
  )
);

-- Create updated_at trigger for orders table
create trigger handle_orders_updated_at
before update on public.orders
for each row
execute procedure moddatetime (updated_at);

-- Create indexes for orders table
create index idx_orders_store_id on public.orders(store_id);
create index idx_orders_status on public.orders(status);
create index idx_orders_created_at on public.orders(created_at);

-- Order items table
create table public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_sku text,
  quantity integer not null,
  unit_price decimal(10,2) not null,
  total_price decimal(10,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on order_items table
alter table public.order_items enable row level security;

-- Create policy: Users can only access order items from their own stores
create policy "Users can view their own store order items"
on public.order_items for select
using (
  order_id in (
    select id from public.orders where store_id in (
      select id from public.stores where user_id = auth.uid()
    )
  )
);

-- Conversations table (for WhatsApp/Instagram/Facebook messages)
create table public.conversations (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid references public.stores(id) on delete cascade not null,
  channel text not null, -- whatsapp, instagram, facebook
  external_id text not null, -- platform-specific conversation ID
  platform_data jsonb default '{}'::jsonb, -- raw data from platform
  last_message_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(store_id, channel, external_id)
);

-- Enable RLS on conversations table
alter table public.conversations enable row level security;

-- Create policy: Users can only access conversations from their own stores
create policy "Users can view their own store conversations"
on public.conversations for select
using (
  store_id in (
    select id from public.stores where user_id = auth.uid()
  )
);

create policy "Users can insert conversations for their own store"
on public.conversations for insert
with check (
  store_id in (
    select id from public.stores where user_id = auth.uid()
  )
);

create policy "Users can update conversations for their own store"
on public.conversations for update
using (
  store_id in (
    select id from public.stores where user_id = auth.uid()
  )
);

create policy "Users can delete conversations for their own store"
on public.conversations for delete
using (
  store_id in (
    select id from public.stores where user_id = auth.uid()
  )
);

-- Create updated_at trigger for conversations table
create trigger handle_conversations_updated_at
before update on public.conversations
for each row
execute procedure moddatetime (updated_at);

-- Create indexes for conversations table
create index idx_conversations_store_id on public.conversations(store_id);
create index idx_conversations_channel on public.conversations(channel);
create index idx_conversations_external_id on public.conversations(external_id);

-- Messages table
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  direction text not null, -- inbound, outbound
  content text not null,
  message_type text default 'text', -- text, image, video, document, etc.
  platform_data jsonb default '{}'::jsonb, -- raw data from platform
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on messages table
alter table public.messages enable row level security;

-- Create policy: Users can only access messages from their own stores
create policy "Users can view their own store messages"
on public.messages for select
using (
  conversation_id in (
    select id from public.conversations where store_id in (
      select id from public.stores where user_id = auth.uid()
    )
  )
);

create policy "Users can insert messages for their own store"
on public.messages for insert
with check (
  conversation_id in (
    select id from public.conversations where store_id in (
      select id from public.stores where user_id = auth.uid()
    )
  )
);

-- Create updated_at trigger for messages table (optional, as created_at is usually sufficient)
-- create trigger handle_messages_updated_at
-- before update on public.messages
-- for each row
-- execute procedure moddatetime (updated_at);

-- Create indexes for messages table
create index idx_messages_conversation_id on public.messages(conversation_id);
create index idx_messages_created_at on public.messages(created_at);
create index idx_messages_direction on public.messages(direction);

-- Customers table
create table public.customers (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid references public.stores(id) on delete cascade not null,
  name text not null,
  phone text,
  email text,
  notes text,
  total_spent decimal(10,2) default 0,
  order_count integer default 0,
  last_order_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(store_id, phone) -- assuming phone is unique per store
);

-- Enable RLS on customers table
alter table public.customers enable row level security;

-- Create policy: Users can only access customers from their own stores
create policy "Users can view their own store customers"
on public.customers for select
using (
  store_id in (
    select id from public.stores where user_id = auth.uid()
  )
);

create policy "Users can insert customers for their own store"
on public.customers for insert
with check (
  store_id in (
    select id from public.stores where user_id = auth.uid()
  )
);

create policy "Users can update customers for their own store"
on public.customers for update
using (
  store_id in (
    select id from public.stores where user_id = auth.uid()
  )
);

create policy "Users can delete customers for their own store"
on public.customers for delete
using (
  store_id in (
    select id from public.stores where user_id = auth.uid()
  )
);

-- Create updated_at trigger for customers table
create trigger handle_customers_updated_at
before update on public.customers
for each row
execute procedure moddatetime (updated_at);

-- Create indexes for customers table
create index idx_customers_store_id on public.customers(store_id);
create index idx_customers_phone on public.customers(phone);
create index idx_customers_email on public.customers(email);

-- Employees/Staff table
create table public.staff (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid references public.stores(id) on delete cascade not null,
  name text not null,
  email text unique,
  role text not null, -- admin, manager, staff
  phone text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on staff table
alter table public.staff enable row level security;

-- Create policy: Users can only access staff from their own stores
create policy "Users can view their own store staff"
on public.staff for select
using (
  store_id in (
    select id from public.stores where user_id = auth.uid()
  )
);

create policy "Users can insert staff for their own store"
on public.staff for insert
with check (
  store_id in (
    select id from public.stores where user_id = auth.uid()
  )
);

create policy "Users can update staff for their own store"
on public.staff for update
using (
  store_id in (
    select id from public.stores where user_id = auth.uid()
  )
);

create policy "Users can delete staff for their own store"
on public.staff for delete
using (
  store_id in (
    select id from public.stores where user_id = auth.uid()
  )
);

-- Create updated_at trigger for staff table
create trigger handle_staff_updated_at
before update on public.staff
for each row
execute procedure moddatetime (updated_at);

-- Create indexes for staff table
create index idx_staff_store_id on public.staff(store_id);
create index idx_staff_email on public.staff(email);

-- Settings table for store-specific configurations
create table public.store_settings (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid references public.stores(id) on delete cascade not null,
  key text not null,
  value jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(store_id, key)
);

-- Enable RLS on store_settings table
alter table public.store_settings enable row level security;

-- Create policy: Users can only access settings from their own stores
create policy "Users can view their own store settings"
on public.store_settings for select
using (
  store_id in (
    select id from public.stores where user_id = auth.uid()
  )
);

create policy "Users can insert settings for their own store"
on public.store_settings for insert
with check (
  store_id in (
    select id from public.stores where user_id = auth.uid()
  )
);

create policy "Users can update settings for their own store"
on public.store_settings for update
using (
  store_id in (
    select id from public.stores where user_id = auth.uid()
  )
);

create policy "Users can delete settings for their own store"
on public.store_settings for delete
using (
  store_id in (
    select id from public.stores where user_id = auth.uid()
  )
);

-- Create updated_at trigger for store_settings table
create trigger handle_store_settings_updated_at
before update on public.store_settings
for each row
execute procedure moddatetime (updated_at);

-- Create indexes for store_settings table
create index idx_store_settings_store_id on public.store_settings(store_id);