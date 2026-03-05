---
name: dev
description: "Show the full local development setup for Morphiq. Use at the start
              of a debugging session or when setting up the environment."
---

## Morphiq Local Dev — 4 Terminals Required

| # | Command | Purpose |
|---|---|---|
| 1 | `npm run dev` | Next.js on https://localhost:3000 |
| 2 | `npx convex dev` | Convex backend + auto type generation |
| 3 | `npx inngest-cli@latest dev` | Inngest local event server |
| 4 | `stripe listen --forward-to localhost:3000/api/billing/webhook` | Stripe webhook forwarding |

## Environment Notes

- App uses **HTTPS** — self-signed certs in `certificates/`
- `INNGEST_DEV=0` in `.env.local` routes to local Inngest (not cloud)
- Terminal 2 regenerates `convex/_generated/` after schema changes — wait for it
- Stripe CLI prints a webhook signing secret on start — use it as `STRIPE_WEBHOOK_SECRET` locally

## Common Issues

- **Convex type errors after schema change**: make sure terminal 2 has finished redeploying
- **Inngest functions not firing**: confirm terminal 3 is running and `INNGEST_DEV=0` is set
- **Stripe webhook 400**: confirm terminal 4 is running and the signing secret matches `.env.local`
