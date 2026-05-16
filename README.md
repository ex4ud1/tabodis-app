# Tabodis — Mini SaaS

Real-estate brokerage SaaS for Costa Blanca. Landing + admin in one Next.js app, deployed on Vercel, backed by Supabase.

**Stack:** Next.js 15 · React 19 · TypeScript · Tailwind · Supabase (Postgres + Auth + Storage) · Resend · Vercel

**Status:** Phase 1 — Foundation. Full landing/admin migration in Phase 2/3.

---

## Local development

Prerequisites: Node.js 20+ and npm.

```bash
# 1. Install dependencies
npm install

# 2. Copy env file
cp .env.example .env.local

# 3. Fill in .env.local — minimum to run dev:
#    NEXT_PUBLIC_SUPABASE_URL
#    NEXT_PUBLIC_SUPABASE_ANON_KEY

# 4. Run dev server
npm run dev
```

App is at <http://localhost:3000>.

## Scripts

| Command           | What it does                          |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Start dev server with HMR             |
| `npm run build`   | Production build                      |
| `npm run start`   | Run built app                         |
| `npm run lint`    | ESLint                                |
| `npm run typecheck` | `tsc --noEmit`                      |
| `npm run format`  | Prettier write                        |

## Project structure

```
src/
├── app/                  # Next.js App Router (routes + layouts)
│   ├── layout.tsx        # Root layout, fonts, metadata
│   ├── page.tsx          # Landing
│   └── globals.css       # CSS variables + Tailwind directives
├── lib/
│   ├── supabase/         # Auto-typed clients (browser, server, middleware, admin)
│   │   └── types.ts      # Generated from DB schema
│   └── utils.ts
└── middleware.ts         # Auth refresh + /admin guard

supabase/
└── migrations/           # SQL migrations applied to Supabase
```

## Supabase

Project: **tabodis** (region eu-west-2)
Dashboard: <https://supabase.com/dashboard/project/jifmdnjdlmlsdzfdnxwz>

### Updating schema

1. Edit/add SQL in `supabase/migrations/000X_description.sql`
2. Apply via Supabase MCP `apply_migration` or `supabase db push`
3. Regenerate types: `supabase gen types typescript --project-id jifmdnjdlmlsdzfdnxwz > src/lib/supabase/types.ts`

### Adding a property (until Phase 3 admin)

Use Supabase Studio → Table Editor → `properties` → Insert row. Make sure `workspace_id = '00000000-0000-0000-0000-000000000001'` and `status = 'live'`.

## Deployment (Vercel)

Auto-deploy on push to `main`. Preview deployments per PR.

Required env vars in Vercel project settings (Production + Preview):

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
RESEND_FROM_EMAIL
LEADS_NOTIFY_EMAIL
NEXT_PUBLIC_SITE_URL
```

Optional (for Phase 2/4):

```
NEXT_PUBLIC_WHATSAPP
NEXT_PUBLIC_CLARITY_ID
NEXT_PUBLIC_SENTRY_DSN
SENTRY_AUTH_TOKEN
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

### Rollback

Vercel dashboard → Deployments → click any past deployment → "Promote to Production". Takes ~30s.

## Roadmap

- ✅ **Phase 1 — Foundation** (current). Project deploys, DB ready, auth scaffolding.
- ⏳ **Phase 2 — Landing migration**: Hero, Properties, Founder, Testimonials, Contact form with real lead delivery, SEO/JSON-LD.
- ⏳ **Phase 3 — Admin + Auth**: login, properties CRUD, image upload, reviews moderation.
- ⏳ **Phase 4 — Hardening**: rate limiting, Sentry, e2e tests, A11y audit.
- ⏳ **Phase 5 — Custom domain**.

## Reference design

The original HTML prototypes live at `../tabodis/project/` — they remain the source of truth for design until Phase 2 fully ports them. Do not edit them after Phase 2.
