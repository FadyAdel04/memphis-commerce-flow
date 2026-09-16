# WASLA | وِصلة — Project Architecture & Codebase Structure

## 1. Overview
WASLA (وِصلة) is built as a high-performance, multi-tenant social commerce platform tailored for the Egyptian market. This document details the directory structure, architectural conventions, and development practices across the codebase.

---

## 2. Directory Tree

```text
waslaaApp/
├── .agents/
│   └── skills/
│       └── wasla-reference/         # Antigravity operational skill & runbook
│           ├── SKILL.md             # Main skill instructions & workflows
│           └── references/          # In-depth architectural & operational specs
│               ├── PROJECT.md
│               ├── architecture.md
│               ├── database-schema.md
│               ├── meta-integration.md
│               └── order-workflow.md
├── docs/                            # Core project documentation
│   ├── PROJECT.md                   # Product reference & requirements
│   └── PROJECT_STRUCTURE.md         # Directory layout and code patterns (this file)
├── public/                          # Static assets and favicons
├── src/
│   ├── assets/                      # Application brand assets & illustrations
│   ├── components/
│   │   ├── ui/                      # Radix / shadcn/ui components (buttons, dialogs, etc.)
│   │   ├── layout/                  # Navigation, sidebars, headers, app shells
│   │   ├── inbox/                   # Unified inbox components (chat, composer, sidebar)
│   │   ├── orders/                  # Order management & draft order dialogs
│   │   ├── channels/                # Meta connection widgets & status badges
│   │   └── products/                # Catalog, variants, inventory management
│   ├── hooks/                       # Custom React hooks (auth, realtime, stores)
│   ├── lib/                         # Shared utilities, Supabase client, query client, formatting
│   │   ├── supabase.ts              # Initialized Supabase client with auth headers
│   │   ├── utils.ts                 # cn() class merge helper, currency formatters (EGP)
│   │   └── api/                     # Type-safe API helper functions
│   ├── routes/                      # File-based routing via TanStack Router / Start
│   │   ├── __root.tsx               # Root application shell, providers, theme wrapper
│   │   ├── index.tsx                # Landing page / marketing entry
│   │   ├── login.tsx                # Merchant sign-in
│   │   ├── signup.tsx               # Merchant registration
│   │   ├── onboarding/              # Store creation & setup wizard
│   │   └── dashboard/               # Tenant operational dashboard
│   │       ├── index.tsx            # Unified Inbox & real-time conversations overview
│   │       ├── orders.tsx           # Order tracking, status transitions & draft reviews
│   │       ├── products.tsx         # Catalog, variants & inventory movements
│   │       ├── customers.tsx        # Customer directory, address management & history
│   │       ├── channels.tsx         # WhatsApp Cloud API, Instagram, FB connection hub
│   │       ├── analytics.tsx        # Egyptian commerce metrics, revenue, GMV, conversion
│   │       └── settings.tsx         # Store profiles, members, roles & webhook settings
│   ├── client.tsx                   # Client entry point
│   ├── router.tsx                   # TanStack Router instance configuration
│   ├── routeTree.gen.ts             # Automatically generated route tree
│   ├── server.ts                    # SSR / Nitro server handler
│   ├── start.ts                     # TanStack Start application configuration
│   └── styles.css                   # Global styling & Tailwind CSS v4 design tokens
├── supabase/
│   ├── functions/                   # Deno Edge Functions
│   │   └── meta-webhook/            # Webhook endpoint for WhatsApp Cloud & Meta events
│   │       └── index.ts             # Webhook verification & incoming message ingestion
│   └── migrations/                  # Versioned PostgreSQL database migrations
│       ├── 20240904000001_initial_schema.sql       # Multi-tenant tables, profiles, RLS
│       ├── 20240904000002_phase4_inventory.sql     # Inventory movements & SKU tracking
│       └── 20240904000003_meta_integrations.sql    # WABA, phone IDs, channel accounts
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript compiler options
└── vite.config.ts                   # Vite + TanStack Start bundler configuration
```

---

## 3. Technology Stack & Key Libraries

| Area | Technology | Role & Notes |
| :--- | :--- | :--- |
| **Framework** | TanStack Start + Vite | SSR-capable React 19 framework with file-based routing |
| **Styling** | Tailwind CSS v4 + Radix UI | Modern utility-first CSS with accessible primitives |
| **Icons** | Lucide React | Clean, consistent icons across UI |
| **Data Fetching** | TanStack Query v5 | Server-state caching, optimistic updates, invalidation |
| **State** | TanStack Router + React Hook Form | Minimal Zustand; query/route state handles most needs |
| **Backend** | Supabase (Postgres, Auth, Storage) | Complete BaaS with Row Level Security (RLS) |
| **Realtime** | Supabase Realtime Channels | Instant inbox push notifications without polling |
| **Edge Compute** | Supabase Edge Functions (Deno) | Webhook handling, Meta signature verification, AI tasks |
| **Validation** | Zod | Runtime type validation for forms, webhooks, and AI outputs |

---

## 4. Multi-Tenant Architectural Principles

1. **Strict Store Isolation (`store_id`)**:
   - Every operational table (`channels`, `channel_accounts`, `customers`, `conversations`, `messages`, `orders`, `products`, `inventory_movements`, `shipments`) **MUST** include `store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE`.
   - Never query customer or message records without scoping by `store_id` (either explicitly or enforced via RLS).

2. **Row-Level Security (RLS)**:
   - All tenant queries are verified through `store_members`:
   ```sql
   EXISTS (
     SELECT 1 FROM store_members sm
     WHERE sm.store_id = target_table.store_id
       AND sm.user_id = auth.uid()
   )
   ```

3. **Multi-Role Permissions**:
   - Roles: `owner`, `admin`, `manager`, `agent`, `viewer`.
   - `agent` role can reply to messages and create `DRAFT` orders, but cannot change store billing or delete catalogs.
   - `manager` can confirm orders and manage inventory.

---

## 5. Development Guidelines & Rules

- **Lovable Sync Compatibility**: Never rewrite or force-push Git history (rebase/squash) on connected branches. Keep branches compilable and stable.
- **Official Meta APIs Only**: Never implement unofficial WhatsApp scrapers or browser emulators. Always route via WhatsApp Cloud API with valid Meta App and WABA tokens.
- **Egyptian Commerce Localization**:
  - Currency: Display prices with `EGP` (e.g. `250.00 ج.م` or `250 EGP`).
  - Addresses: Support Egyptian governorates (القاهرة, الجيزة, الإسكندرية, الدقهلية, إلخ) and local phone formats (`+201...` or `01...`).
  - Bi-directional UI: Accommodate Arabic (RTL) and English (LTR) text cleanly.
