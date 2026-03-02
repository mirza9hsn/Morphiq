# Morphiq — Claude Code Instructions

## Project Overview

Morphiq is an AI-powered design engineering platform. Users upload moodboard images, sketch wireframes on a canvas, and AI generates production-ready Next.js/Tailwind UI code. It's a SaaS product with credit-based billing via Stripe.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16.1.6, React 19, Tailwind CSS v4 |
| UI Components | shadcn/ui, Radix UI, Lucide Icons |
| Animations | Framer Motion |
| State (client) | Redux Toolkit (`@reduxjs/toolkit`) |
| Backend/DB | Convex (serverless + realtime DB) |
| Auth | Convex Auth (`@convex-dev/auth`) |
| Background Jobs | Inngest (with `@inngest/realtime` middleware) |
| Payments | Stripe |
| AI | Vercel AI SDK + `@ai-sdk/anthropic` |
| Forms | React Hook Form + Zod |
| Toasts | Sonner |

## Path Aliases

- `@/*` → `src/*`
- Convex types: import from `convex/_generated/api` and `convex/_generated/dataModel`

## Project Structure

```
src/
  app/                  # Next.js App Router
    (protected)/        # Auth-gated routes
      dashboard/        # Project list
      dashboard/[session]/(workspace)/  # Main workspace
        canvas/         # Drawing canvas
        style-guide/    # Style guide editor
      billing/          # Subscription management
    api/                # API routes
      generate/         # AI generation endpoints
      billing/          # Stripe checkout + webhook
      inngest/          # Inngest webhook
      image-proxy/      # Image proxy
      project/          # Project CRUD
    auth/               # Sign-in / sign-up pages
  components/
    ui/                 # shadcn/ui primitives (don't modify these)
    canvas/             # Canvas/drawing components
    style/              # Style guide components
    buttons/            # Feature-specific buttons
    projects/           # Project list + provider
  redux/
    store.ts            # Redux store
    slice/              # State slices (profile, projects, shapes, viewport, chat)
    api/                # Async API hooks (project, billing, style-guide, generation)
  inngest/
    client.ts           # Inngest client
    functions.ts        # Event handlers (autosave, Stripe events)
  prompts/              # Anthropic system prompts (style guide, generative UI, workflow)
  lib/                  # Utilities (cn(), fonts, etc.)

convex/
  schema.ts             # DB schema (projects, subscriptions, credits_ledger)
  projects.ts           # Project queries/mutations
  subscription.ts       # Subscription queries/mutations
```

## Convex Schema

Key tables:
- **projects** — design project data (styleGuide, sketchesData, generatedDesignData, moodBoardImages, inspirationImages)
- **subscriptions** — Stripe subscription + plan info + credit balance/grants
- **credits_ledger** — credit transaction history (grant/consume/adjust)
- **project_counters** — per-user project auto-increment

## Code Conventions

### Components
- Always `'use client'` for interactive components
- Default exports for page/component files
- Props typed inline: `type Props = { ... }`
- Files use `index.tsx` pattern inside named folders (e.g., `buttons/project/index.tsx`)

### Styling
- Tailwind CSS only — no CSS modules or inline styles
- Use `cn()` from `@/lib/utils` for conditional classes
- shadcn/ui components live in `src/components/ui/` — do not modify them directly; extend or wrap instead
- Tailwind v4 is in use — use the v4 API (CSS variables, no `theme()` function in config)

### State Management
- **Redux** for client canvas state: shapes, viewport, profile, chat
- **Convex** hooks (`useQuery`, `useMutation`) for all backend data
- Never mix: don't store backend data in Redux, don't use Redux for server state
- Custom hooks in `src/redux/api/` wrap API calls with Redux dispatch

### Imports
- Always use `@/` absolute imports — no relative imports across features
- Order: React/Next → third-party libs → local `@/` imports

### TypeScript
- Strict mode is on — no `any` types unless absolutely unavoidable
- Use Convex-generated types from `convex/_generated/dataModel` for DB types

### AI Generation
- AI prompts are in `src/prompts/` — these are carefully engineered; treat them as critical business logic
- The system forces structured JSON output for style guides and enforces WCAG AA contrast rules
- AI endpoints are in `src/app/api/generate/`

## Key Patterns

### Adding a new Convex query or mutation
1. Define in `convex/` using Convex query/mutation builders
2. Run `npx convex dev` — it auto-generates types in `convex/_generated/`
3. Import the generated `api` object: `import { api } from "@/convex/_generated/api"`
4. Use in components via `useQuery(api.module.function, args)` or `useMutation(api.module.function)`

### Adding a new Inngest function
1. Define in `src/inngest/functions.ts`
2. Register it in the Inngest serve handler at `src/app/api/inngest/route.ts`
3. Trigger with `inngest.send({ name: "event/name", data: {...} })`

### Adding a new API route
- Use Next.js App Router route handlers (`route.ts`)
- Stripe webhook is at `api/billing/webhook` — Inngest receives and processes events from there
- Verify Stripe webhook signatures using `STRIPE_WEBHOOK_SECRET`

### Credits system
- Credits are debited via Convex mutations in `convex/subscription.ts`
- Always use idempotency keys when writing to `credits_ledger` to avoid double-charging
- Grants happen automatically via Inngest on Stripe subscription events

## Environment Variables

```env
NEXT_PUBLIC_APP_URL=https://localhost:3000
NEXT_PUBLIC_CONVEX_SITE_URL=
NEXT_PUBLIC_CONVEX_URL=
CONVEX_DEPLOYMENT=
GOOGLE_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
ANTHROPIC_API_KEY=
INNGEST_DEV=0
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_STANDARD_PLAN_PRICE_ID=
STRIPE_WEBHOOK_SECRET=
STRIPE_SECRET_KEY=
```

`INNGEST_DEV=0` disables Inngest Cloud and uses the local dev server instead.

## Important Notes

- **Do not modify `src/components/ui/`** — these are shadcn/ui auto-generated files. Re-run shadcn CLI to update them.
- **Convex schema changes** — be careful when removing fields; existing documents won't be migrated automatically.
- **Stripe webhook events** go to Inngest via the webhook route, not processed inline — do not add heavy logic directly in the webhook handler.
- **Canvas state (sketchesData)** is serialized and stored in Convex as a project field. The autosave Inngest workflow handles debounced persistence.
