# Supabase Setup for WASLA

This directory contains the Supabase configuration and migrations for the WASLA multi-tenant application.

## Database Schema

The schema is designed for multi-tenancy where each store is completely isolated from others using Row Level Security (RLS).

## Migrations

To apply the database schema:

1. Copy the SQL from `20240904000001_initial_schema.sql`
2. Go to your Supabase project dashboard
3. Navigate to SQL Editor
4. Paste and run the SQL

## Row Level Security (RLS)

RLS policies are implemented to ensure data isolation:
- Users can only access data from their own store
- Each store's data is completely isolated from other stores
- Policies are applied to all tables: stores, products, orders, conversations, messages, customers, staff, store_settings

## Tables Created

1. **stores** - Store information linked to auth.users
2. **products** - Store inventory
3. **orders** - Customer orders
4. **order_items** - Items within orders
5. **conversations** - WhatsApp/Instagram/Facebook conversations
6. **messages** - Messages within conversations
7. **customers** - Customer information
8. **staff** - Store employees
9. **store_settings** - Store-specific configurations

## Indexes

Performance indexes have been created on frequently queried columns.

## Triggers

Automatic `updated_at` timestamps are handled by database triggers.

## Security Notes

- RLS is enabled on all tables
- All policies use `auth.uid()` to verify the current user
- Store isolation is enforced at the database level
- Even if API keys are compromised, attackers can only access data from stores they own