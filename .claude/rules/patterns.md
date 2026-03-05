# Morphiq — Key Patterns

## Adding a Convex Query or Mutation

1. Define in `convex/` using Convex query/mutation builders
2. Run `npx convex dev` — auto-generates types in `convex/_generated/`
3. Import: `import { api } from "@/convex/_generated/api"`
4. Use: `useQuery(api.module.fn, args)` or `useMutation(api.module.fn)`

## Adding an Inngest Function

1. Define in `src/inngest/functions.ts`
2. Register in serve handler at `src/app/api/inngest/route.ts`
3. Trigger: `inngest.send({ name: "event/name", data: {...} })`

## Adding an API Route

- Use Next.js App Router route handlers (`route.ts`)
- Stripe webhook at `api/billing/webhook` — Inngest processes, never inline
- Verify Stripe signatures using `STRIPE_WEBHOOK_SECRET`

## Credits System

- Debit via Convex mutations in `convex/subscription.ts`
- **Always use idempotency keys** when writing to `credits_ledger` — prevents double-charges
- Grants fire automatically via Inngest on Stripe subscription events

## Adding a Redux Slice

1. Create slice in `src/redux/slice/`
2. Register in `src/redux/store.ts`
3. Wrap API calls with dispatch in `src/redux/api/`
4. Only canvas/client state — never server/backend data
