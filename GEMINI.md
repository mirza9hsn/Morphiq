# Morphiq — Claude Code Instructions

## Project Overview

AI-powered design engineering SaaS. Users upload moodboard images, sketch wireframes on a canvas, and AI generates production-ready Next.js/Tailwind UI code. Credit-based billing via Stripe.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16.1.6, React 19, Tailwind CSS v4 |
| UI Components | shadcn/ui, Radix UI, Lucide Icons |
| Animations | Framer Motion |
| State (client) | Redux Toolkit |
| Backend/DB | Convex (serverless + realtime DB) |
| Auth | Convex Auth (`@convex-dev/auth`) |
| Background Jobs | Inngest (with `@inngest/realtime`) |
| Payments | Stripe |
| AI | Vercel AI SDK + `@ai-sdk/anthropic` |
| Forms | React Hook Form + Zod |

## Path Aliases

- `@/*` → `src/*`
- Convex types: `convex/_generated/api` and `convex/_generated/dataModel`

## Project Structure

```
src/app/         # Next.js App Router ((protected)/ for auth-gated routes)
src/components/  # ui/ (shadcn — never modify), canvas/, style/, buttons/, projects/
src/redux/       # store.ts, slice/, api/ — canvas client state only
src/inngest/     # client.ts, functions.ts (autosave, Stripe events)
src/prompts/     # AI system prompts — treat as critical business logic
src/lib/         # Utilities: cn(), fonts
src/app/api/     # generate/, billing/, inngest/, image-proxy/, project/

convex/          # schema.ts, projects.ts, subscription.ts
```

## Convex Schema

- **projects** — styleGuide, sketchesData, generatedDesignData, moodBoardImages, inspirationImages
- **subscriptions** — Stripe plan, credit balance/grants
- **credits_ledger** — grant/consume/adjust (idempotency keys required)
- **project_counters** — per-user auto-increment

## Critical Rules

- **Never modify `src/components/ui/`** — shadcn auto-generated; extend or wrap instead
- **Stripe webhook** → Inngest processes events; no heavy logic in the webhook handler
- **Convex schema removals** — existing docs won't migrate automatically; handle carefully
- **Canvas state** is autosaved via debounced Inngest workflow (sketchesData field)

## Environment Variables

Required: `NEXT_PUBLIC_CONVEX_URL`, `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`,
`STRIPE_WEBHOOK_SECRET`, `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`,
`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`. `INNGEST_DEV=0` = use local dev server.

## Conventions & Patterns

Full details in:
- `.claude/rules/conventions.md` — components, styling, state, imports, TypeScript
- `.claude/rules/patterns.md` — Convex, Inngest, API routes, credits system

## Self-Evolution Protocol

Claude should proactively maintain this project's knowledge base over time:

**Every session start:**
- Run `git log --oneline -15` to catch recent changes by any collaborator
- Run `gh pr list --state merged --limit 5` (if gh CLI available) to catch merged work
- If new patterns emerge from that review, update `MEMORY.md` immediately

**During a session:**
- When a convention is clarified or corrected, update the relevant `.claude/rules/` file
- When a bug fix reveals an architectural insight, note it in `MEMORY.md`

**When a pattern repeats across 2+ sessions:**
- Create a new skill in `.claude/skills/` — give it a SKILL.md with name, description, and steps
- Example triggers: "I keep setting up the same Convex pattern", "I explain this Redux hook every time"

**When a domain needs deep multi-step specialist work:**
- Create a new agent in `.claude/agents/` scoped to that domain
- Example triggers: new third-party integration added, new major subsystem built

**Keep files accurate:**
- If CLAUDE.md, rules, or MEMORY.md contradict the actual codebase, correct immediately
- Remove outdated entries; don't let stale info accumulate
- Keep CLAUDE.md under 100 lines — move detail into `.claude/rules/`
