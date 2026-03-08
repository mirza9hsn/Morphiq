REMAINING TO IMPLEMENT:

- Phase 4: Toolbar (breakpoints, rename) + Code Tab (live streaming + download)
- Phase 5: Text prompt overlay + /api/generate/text-prompt route


DONE:

## 2026-03-08: White Screen & Error Handling Fix ✅

### Robust Iframe Rendering
- **Success!** Fixed the white screen by resolving strict React version conflicts in the iframe.
- **Separate Error Catcher**: Added a non-module `<script>` to catch import failures (which module scripts normally hide).
- **ESM Version Pinning**: Added `?external=react,react-dom` to all `esm.sh` imports.
- **Duplicate Binding Fix**: Removed the template's redundant `import React` to allow the AI's import to take precedence.

### Clean Sweep / Cleanup
- Removed `esbuild` dependency and `scripts/build-morphiq-ui.ts`.
- Switched to raw TSX → Runtime Sucrase → Browser ESM imports architecture.
- Cleaned up all leftover atoms/esbuild logic from previous iterations.

---

## Phase 3 — IframeRenderer Wiring ✅

### 3A. IframeRenderer (src/components/canvas/shapes/generatedui/iframe-renderer.tsx)
- Removed onHeightChange — fixed-frame model (no auto-resize), content scrolls inside iframe
- Resets srcdoc to null on new bundle so "Rendering..." shows between updates
- sandbox="allow-scripts", pointerEvents: none (canvas drag mode)

### 3B. GeneratedUI Shape (src/components/canvas/shapes/generatedui/index.tsx)
- Replaced dangerouslySetInnerHTML → <IframeRenderer tsx componentName styleGuide shapeId />
- Removed useUpdateContainer (no longer needed)
- Container fixed at shape.w × shape.h (MagicPath-style fixed frame)
- Style guide fetched via useQuery(api.projects.getProjectStyleGuide) from URL project ID
- Clean overflow-hidden rounded frame, buttons toolbar preserved

---

## Phase 2 — React Generation Pipeline ✅

### 2A. New System Prompt (src/prompts/index.ts)
- prompts.reactUi.system — tells Claude to assemble pages from @morphiq/ui components
- prompts.reactUi.user(colors, typography) — image-based generation user prompt
- prompts.workflowTsx.user(...) — workflow page generation (TSX-aware)
- prompts.workflowRedesignTsx.user(...) — workflow redesign (TSX-aware)
- prompts.redesignTsx.user(...) — main redesign (TSX-aware)
- All existing prompts (generativeUi, workflow, workflowRedesign, redesign) left untouched

### 2B. Import Validator (src/lib/validate-imports.ts)
- Regex check of @morphiq/ui/* imports against KNOWN_COMPONENTS set
- Returns { ok: true } or { ok: false, unknownImports, suggestion }

### 2C. /api/bundle Route (src/app/api/bundle/route.ts)
- POST /api/bundle — accepts { tsx: string }
- Validates imports (422 on failure with import_validation_failed)
- SHA-256 content-hash in-memory cache (cached: true on hit)
- Sucrase transform: TSX → ES module JS (pure JS, no WASM, serverless-safe)
- Returns { js, cached: boolean }

### 2D. srcdoc Builder (src/lib/tsx-renderer.ts)
- buildSrcdoc(js, styleGuide, componentName, origin)
- Pinned import map: React 18.3.1, framer-motion 11.15.0, lucide-react 0.469.0
- @morphiq/ui/* mapped to /morphiq-ui/*.js (served from public/)
- CSS vars built from style guide colorSections
- ResizeObserver posts morphiq-height to parent for canvas auto-resize

### 2E. Updated Generation Routes (all 4)
- All routes use prompts.reactUi.system (was prompts.generativeUi.system)
- All routes stream TSX text (not HTML). Content-Type: text/plain
- src/app/api/generate/route.ts — streamText with reactUi prompt + wireframe image
- src/app/api/generate/redesign/route.ts — accepts currentTsx (was currentHTML)
- src/app/api/generate/workflow/route.ts — uses prompts.workflowTsx.user
- src/app/api/generate/workflow-redesign/route.ts — uses prompts.workflowRedesignTsx.user

### 2F. Redux Shape Type Update (src/redux/slice/shapes/index.ts)
- GeneratedUIShape gains: streamingTsx?: string | null, componentName?: string
- makeGeneratedUI accepts/passes through new fields

### 2G. Canvas Hook (src/hooks/use-canvas.ts)
- extractComponentName(tsx) helper added
- All 3 stream loops updated:
  - Intermediate chunks → dispatch streamingTsx (for future Code Tab)
  - Stream done → dispatch { uiSpecData: tsx, componentName, streamingTsx: null }
- useChatWindow: currentHTML → currentTsx in request body
- IframeRenderer component created at src/components/canvas/shapes/generatedui/iframe-renderer.tsx
  (wiring into GeneratedUI shape is Phase 3)

---

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
- providerOptions: { anthropic: { cacheControl: { type: 'ephemeral' } } } on system prompts in all 5 routes

### 0B. Fix Credits Bug
- src/app/api/generate/workflow-redesign/route.ts: amount: 4 → amount: 1
