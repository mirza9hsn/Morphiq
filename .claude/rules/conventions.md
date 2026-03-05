# Morphiq — Code Conventions

## Components

- Always `'use client'` for interactive components
- Default exports for page/component files
- Props typed inline: `type Props = { ... }`
- Files use `index.tsx` inside named folders (e.g., `buttons/project/index.tsx`)

## Styling

- Tailwind CSS only — no CSS modules or inline styles
- Use `cn()` from `@/lib/utils` for conditional classes
- shadcn/ui in `src/components/ui/` — never modify directly; extend or wrap instead
- Tailwind v4: use CSS variables, **no `theme()` function** in config

## State Management

- **Redux** — client canvas state only: shapes, viewport, profile, chat
- **Convex** (`useQuery`, `useMutation`) — all backend/server data
- Never store backend data in Redux; never use Redux for server state
- Custom hooks in `src/redux/api/` wrap API calls with Redux dispatch

## Imports

- Always `@/` absolute imports — no relative imports across features
- Order: React/Next → third-party libs → local `@/` imports

## TypeScript

- Strict mode on — no `any` unless absolutely unavoidable
- Use Convex-generated types from `convex/_generated/dataModel` for all DB types
- `Doc<"tableName">` for full document type, `Id<"tableName">` for IDs

## AI Prompts

- Prompts in `src/prompts/` are critical business logic — treat with care
- Style guide prompt forces structured JSON output + WCAG AA contrast rules
- AI endpoints live in `src/app/api/generate/`
- Never change the output schema of a prompt without updating all downstream parsers
