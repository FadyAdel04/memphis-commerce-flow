# WASLA Architecture Reference

## 1. System Topology

```text
               +-----------------------------+
               |        Merchant User        |
               +--------------+--------------+
                              | HTTPS
                              v
               +-----------------------------+
               |     WASLA Web App (Vercel)  |
               |  React 19 + TanStack Start  |
               +-------+---------------+-----+
                       |               ^
     Supabase REST/RLS |               | Supabase Realtime
                       v               | (WebSocket)
               +-----------------------+-----+
               |      Supabase Platform      |
               |  - Auth & Storage           |
               |  - PostgreSQL with RLS      |
               |  - Edge Functions (Deno)    |
               +-------+---------------+-----+
                       ^               |
       Webhooks (POST) |               | WhatsApp Cloud API (REST)
                       |               v
               +-------+---------------+-----+
               |      Meta Social Graph      |
               |  WhatsApp / IG / Facebook   |
               +-----------------------------+
```

## 2. Multi-Tenancy Design
The system uses a single database with row-level tenant isolation:
- `stores` is the top-level tenant.
- Users belong to stores via `store_members`.
- All operational queries and writes verify membership in `store_members`.
- Service-role edge functions explicitly validate tenant ownership before performing operations.

## 3. Frontend Architecture
- **Routing**: `src/routes/` with TanStack Router / TanStack Start.
  - Route tree generated automatically in `src/routeTree.gen.ts`.
  - Nested layouts via `dashboard/` with shared sidebar, header, and store switcher.
- **Component Architecture**:
  - `src/components/ui/`: Low-level headless and styled primitives (Radix UI).
  - `src/components/inbox/`: Conversation thread, chat bubble, quick replies, customer drawer.
  - `src/components/orders/`: Order status stepper, draft order creator, order item table.
  - `src/components/channels/`: Embedded signup modals, connection status badges.
- **State Management**:
  - Server state: TanStack Query with cache keys scoped by `store_id`.
  - Client state: URL parameters (selected conversation, active filters, search query) and minimal Zustand stores for UI drawer states.
