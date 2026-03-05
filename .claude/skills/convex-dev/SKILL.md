---
name: convex-dev
description: "Adding or modifying Convex queries, mutations, and schema changes.
              Use when creating new DB functions, updating the schema, or wiring
              Convex data to components in this project."
---

## Convex Development Workflow

### Adding a New Query or Mutation

1. Define the function in the appropriate `convex/*.ts` file using Convex builders
2. `npx convex dev` (terminal 2) regenerates `convex/_generated/` automatically
3. Import: `import { api } from "@/convex/_generated/api"`
4. In components: `useQuery(api.module.fn, args)` or `useMutation(api.module.fn)`

### Schema Changes (Safe)

- **Adding a new field**: use `v.optional(...)` — no migration needed, existing docs are unaffected
- **Adding a new table**: define in `convex/schema.ts`, add queries/mutations, run `npx convex dev`
- After any schema change, wait for Convex dev server to redeploy before testing

### Schema Changes (Destructive — Handle With Care)

- **Removing a field**: first verify no code or existing documents reference it
- **Renaming a field**: requires a migration — propose a plan before proceeding
- Flag destructive changes to the user before executing

### Type Safety

- `Doc<"tableName">` — full document type
- `Id<"tableName">` — document ID type
- Auth context available in mutations: `ctx.auth.getUserIdentity()`
- Use `ctx.db.query("table").withIndex(...)` for indexed lookups

### Credits Ledger

- Any write to `credits_ledger` MUST include an idempotency key
- Use `convex/subscription.ts` mutations — never write to it directly from a component

### After Significant Changes

Update `MEMORY.md` with what changed and the architectural reason if notable.
