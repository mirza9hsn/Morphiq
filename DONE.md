REMAINING TO IMPLEMENT:

- Phase 2A: New system prompt (prompts.reactUi) in src/prompts/index.ts
- Phase 2B: Import validator (src/lib/validate-imports.ts)
- Phase 2C: /api/bundle route (Sucrase + hash cache + import validation)
- Phase 2D: srcdoc builder (src/lib/tsx-renderer.ts)
- Phase 2E: Update all 4 generation routes to stream TSX (not HTML)
- Phase 2F/G: Redux shape type update + canvas hook (stream → Code Tab → iframe)
- Phase 3: IframeRenderer component + skeleton + shape update
- Phase 4: Toolbar (breakpoints, rename) + Code Tab (live streaming + download)
- Phase 5: Text prompt overlay + /api/generate/text-prompt route
- Phase 2A: New system prompt (prompts.reactUi) in src/prompts/index.ts
- Phase 2B: Import validator (src/lib/validate-imports.ts)
- Phase 2C: /api/bundle route (Sucrase + hash cache + import validation)
- Phase 2D: srcdoc builder (src/lib/tsx-renderer.ts)
- Phase 2E: Update all 4 generation routes to stream TSX (not HTML)
- Phase 2F/G: Redux shape type update + canvas hook (stream → Code Tab → iframe)
- Phase 3: IframeRenderer component + skeleton + shape update
- Phase 4: Toolbar (breakpoints, rename) + Code Tab (live streaming + download)
- Phase 5: Text prompt overlay + /api/generate/text-prompt route


DONE:

## Phase 1 — Component Library ✅

### 1A. 10 MVP Section Components (src/lib/morphiq-ui/)
- Navbar, HeroSplit, HeroCentered, HeroMinimal
- Features3Col, FeaturesAlternating
- TestimonialCards, StatsSection
- PricingTiers, CTACentered, FooterSimple
- All use CSS variables for colors (var(--primary), var(--background), etc.)
- All use framer-motion animations + lucide-react icons

### 1B. Pre-compile Script
- scripts/build-morphiq-ui.ts — esbuild compiles each component to ES module
- @/ alias plugin resolves src/ paths at build time
- package.json: build:ui + postbuild scripts added
- sucrase (runtime dep), esbuild + tsx (devDeps) installed

### 1C. Atoms Bundle
- src/lib/morphiq-ui/atoms.tsx — re-exports shadcn primitives
- Compiled to public/morphiq-ui/atoms.js (self-contained, no @/ at runtime)
- All 12 files live in public/morphiq-ui/ ✓

## Phase 0 — Immediate Wins ✅

### 0A. Prompt Caching
- Added `experimental_providerMetadata: { anthropic: { cacheControl: { type: 'ephemeral' } } }` to system prompts in all 5 routes:
  - src/app/api/generate/route.ts
  - src/app/api/generate/redesign/route.ts
  - src/app/api/generate/workflow/route.ts
  - src/app/api/generate/workflow-redesign/route.ts
  - src/app/api/generate/style/route.ts
- System prompt moved from `system:` param to first message in `messages[]` array with cache control

### 0B. Fix Credits Bug
- src/app/api/generate/workflow-redesign/route.ts: `amount: 4` → `amount: 1`
