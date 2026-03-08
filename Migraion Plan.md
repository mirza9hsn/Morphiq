# Morphiq — Ultimate React Generation Plan
## MagicPath Parity + Cost Reduction

---

## Context

**Problem:** Morphiq streams raw HTML into a `dangerouslySetInnerHTML` div. No JS, no scroll, no hover effects. Claude generates every `<div>`, every CSS class from scratch — ~5000 output tokens per page. Expensive, slow, no interactivity.

**Goal:** Match MagicPath's architecture:
- React TSX output (not HTML)
- Skeleton → complete render (no broken partial JSX)
- Pre-built section components that Claude assembles and customizes
- Interactive iframe preview (real scroll, hover, animations)
- 60-70% fewer output tokens through component reuse

**What MagicPath actually does:**
- React + TypeScript + Tailwind + shadcn/ui
- Design systems library (pre-made themes)
- Non-streaming: shows loading state → complete component
- Component library that Claude references by name/props
- Canvas is design-first — not a code IDE (no Sandpack)

---

## Architecture

```
User Prompt / Wireframe
        ↓
Claude receives: prompt + style guide + component catalog
Claude outputs: complete .tsx file using @morphiq/ui sections + shadcn atoms
        ↓
/api/bundle — Sucrase transforms JSX→ES module JS (server-side, no WASM)
        ↓
Client builds srcdoc: importmap + component JS + style guide CSS vars
        ↓
<iframe srcdoc> renders the full interactive React page
Canvas shape: skeleton while loading → iframe when ready
```

---

## Cost Reduction Strategy

| Lever | How | Savings | Effort |
|---|---|---|---|
| **Prompt caching** | `cacheControl: { type: 'ephemeral' }` on system prompts | ~90% on cache hits | 3 lines per route |
| **Component imports** | Claude outputs `<HeroSplit />` instead of writing hero from scratch | ~60-70% output tokens | Needs library built first |
| **Stream to Code Tab** | `streamText` streams TSX into Code Tab live; iframe renders only on `onFinish` | No UX regression vs current streaming | Slightly more complex hook |
| **Fix credits bug** | `workflow-redesign` charges 4 credits → should be 1 | Cost to users | Trivial fix |

**Token comparison:**
- Current HTML generation: ~4000-6000 output tokens
- New React assembly: ~600-1200 output tokens (imports + customized props/content)

---

## New Dependencies

```bash
npm install sucrase           # Server-side JSX→JS transform (pure JS, no WASM, serverless-safe)
npm install -D esbuild        # Build-time component pre-compilation (devDependency)
npm install jszip             # Code export ZIP (Phase 4)
```

---

## Phase 0 — Immediate Wins (Day 1)

### 0A. Prompt Caching
Add to ALL generation routes (`/api/generate/route.ts`, `redesign`, `workflow`, `workflow-redesign`, `style`):

```typescript
// In streamText / generateText call, wrap system prompt message:
messages: [
  {
    role: 'system',
    content: [
      {
        type: 'text',
        text: prompts.generativeUi.system,
        experimental_providerMetadata: {
          anthropic: { cacheControl: { type: 'ephemeral' } }
        }
      }
    ]
  },
  { role: 'user', content: [...] }
]
```

Files: `src/app/api/generate/route.ts`, `redesign/route.ts`, `workflow/route.ts`, `workflow-redesign/route.ts`, `style/route.ts`

### 0B. Fix Credits Bug
`src/app/api/generate/workflow-redesign/route.ts` line ~84:
```typescript
amount: 4  →  amount: 1
```

---

## Phase 1 — Component Library (Weeks 1–2)

### 1A. Custom Section Components
**New directory:** `src/lib/morphiq-ui/`

**Start with 10 high-quality components. Ship the pipeline. Validate it works. Then expand.**
Do not build 30-40 components before the iframe rendering is proven — if the pipeline is broken, you've built a library for nothing.

**MVP set (10):**

**Navigation:** `Navbar.tsx` — responsive navbar with logo, links, CTA button
**Hero:** `HeroSplit.tsx`, `HeroCentered.tsx`, `HeroMinimal.tsx`
**Features:** `Features3Col.tsx`, `FeaturesAlternating.tsx`
**Social Proof:** `TestimonialCards.tsx`, `StatsSection.tsx`
**Pricing:** `PricingTiers.tsx`
**CTA:** `CTACentered.tsx`
**Footer:** `FooterSimple.tsx`

**Phase 1A expansion (after pipeline validated):**
Add: `Sidebar`, `HeroWithApp`, `FeaturesWithIcons`, `FeaturesTimeline`, `LogoCloud`, `PricingTable`, `CTAGradient`, `CTASplit`, `Footer4Col`, `AuthSignIn`, `AuthSignUp`, `ContactForm`, `NewsletterForm`, `MetricCards`, `DataTable`, `ActivityFeed`, `ProductGrid`, `ProductCard`, `CartSidebar`, `FAQ`, `BlogGrid`, `PortfolioGrid`, `VideoSection`

**Each component must:**
```typescript
// Pattern every component follows
import { motion } from 'framer-motion'
import { SomeIcon } from 'lucide-react'
import { Button } from '@morphiq/ui/atoms'  // shadcn atoms — bundled for iframe (NOT @/ alias)

interface HeroSplitProps {
  title: string
  subtitle?: string
  ctaText?: string
  ctaHref?: string
  imageSrc?: string
  // Style guide injection via CSS vars — no hardcoded colors
}

export function HeroSplit({ title, subtitle, ctaText = 'Get Started', ... }: HeroSplitProps) {
  return (
    <section style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Component markup using Tailwind + CSS vars */}
      </motion.div>
    </section>
  )
}

export default HeroSplit
```

**CSS variable convention** (maps to style guide):
```
--background, --foreground, --primary, --primary-foreground,
--secondary, --secondary-foreground, --muted, --muted-foreground,
--accent, --accent-foreground, --card, --card-foreground, --border
```

### 1B. Pre-compile Script
**New file:** `scripts/build-morphiq-ui.ts`

```typescript
import * as esbuild from 'esbuild'
import { glob } from 'glob'
import path from 'path'

const components = await glob('src/lib/morphiq-ui/*.tsx')

for (const file of components) {
  const name = path.basename(file, '.tsx')
  await esbuild.build({
    entryPoints: [file],
    bundle: true,
    format: 'esm',
    outfile: `public/morphiq-ui/${name}.js`,
    external: ['react', 'react-dom', 'react/jsx-runtime', 'framer-motion', 'lucide-react'],
    // shadcn components are BUNDLED IN (not external) — each component file is self-contained
    jsx: 'automatic',
    target: 'es2022',
  })
}

console.log(`Built ${components.length} components → public/morphiq-ui/`)
```

**Package.json script:**
```json
"build:ui": "tsx scripts/build-morphiq-ui.ts",
"postbuild": "npm run build:ui"
```

Output: `public/morphiq-ui/HeroSplit.js`, `public/morphiq-ui/Features3Col.js`, etc. (ES modules, React/framer/lucide external)

**Also compile atoms bundle** — add to the build script:
```typescript
// At the end of scripts/build-morphiq-ui.ts, after the component loop:
await esbuild.build({
  entryPoints: ['src/lib/morphiq-ui/atoms.tsx'],
  bundle: true,
  format: 'esm',
  outfile: 'public/morphiq-ui/atoms.js',
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  // shadcn @/ aliases are resolved by esbuild at build time — no alias in browser
  jsx: 'automatic',
  target: 'es2022',
})
```

### 1C. Atoms Source File
**New file:** `src/lib/morphiq-ui/atoms.tsx`

Re-exports shadcn primitives as a single bundle for iframe use. The `@/` alias is resolved by esbuild at build time — it never reaches the browser.

```typescript
// src/lib/morphiq-ui/atoms.tsx
export { Button } from '@/components/ui/button'
export { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
export { Input } from '@/components/ui/input'
export { Badge } from '@/components/ui/badge'
export { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
export { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
export { Separator } from '@/components/ui/separator'
export { Label } from '@/components/ui/label'
export { Textarea } from '@/components/ui/textarea'
export { Switch } from '@/components/ui/switch'
```

Output: `public/morphiq-ui/atoms.js` — self-contained ES module, no runtime `@/` paths.

---

## Phase 2 — React Generation Pipeline (Weeks 2–3)

### 2A. New System Prompt
**File:** `src/prompts/index.ts` — add alongside existing prompts (NEVER modify existing)

```typescript
prompts.reactUi = {
  system: `
You are a React UI engineer for Morphiq. You assemble pages from pre-built section components.

## Available Components (@morphiq/ui)
Import path: import { ComponentName } from '@morphiq/ui/ComponentName'

Navigation: Navbar
Hero: HeroSplit, HeroCentered, HeroMinimal
Features: Features3Col, FeaturesAlternating
Social Proof: TestimonialCards, StatsSection
Pricing: PricingTiers
CTA: CTACentered
Footer: FooterSimple

## Component Prop Interfaces
Use EXACTLY these prop names — do not invent others.

Navbar: { logo?: string; links: { label: string; href: string }[]; ctaText?: string; ctaHref?: string }
HeroSplit: { title: string; subtitle?: string; ctaText?: string; ctaHref?: string; imageSrc?: string }
HeroCentered: { title: string; subtitle?: string; ctaPrimary?: string; ctaSecondary?: string }
HeroMinimal: { title: string; subtitle?: string }
Features3Col: { heading?: string; features: { icon: string; title: string; description: string }[] }
FeaturesAlternating: { heading?: string; items: { title: string; description: string; imageSrc?: string }[] }
TestimonialCards: { testimonials: { quote: string; author: string; role?: string }[] }
StatsSection: { heading?: string; stats: { value: string; label: string }[] }
PricingTiers: { tiers: { name: string; price: string; description?: string; features: string[]; ctaText?: string; featured?: boolean }[] }
CTACentered: { heading: string; subheading?: string; ctaText?: string; ctaHref?: string }
FooterSimple: { logo?: string; links: { label: string; href: string }[]; copyright?: string }

## shadcn/ui Atoms
import { Button, Card, CardContent, Input, Badge, Tabs, Avatar, Separator, Label } from '@morphiq/ui/atoms'
// Do NOT use @/components/ui/* — that alias does not exist in the iframe.

## Rules
1. ASSEMBLE pages from available sections. Never recreate a section from scratch.
2. Customize TEXT CONTENT (titles, copy, CTAs) to be specific and brand-relevant. No Lorem Ipsum.
3. Apply style guide via CSS variables on the root wrapper:
   style={{ '--primary': '#HEX', '--background': '#HEX', ... } as React.CSSProperties}
4. Component name: PascalCase from the user's prompt (SaaSLandingPage, EcommerceHome)
5. Output: complete .tsx file. Export default the main component.
6. Use lucide-react icons. Use framer-motion for animations.
7. Generate REAL data: actual product names, prices, feature descriptions.

## Output Format
Return ONLY the .tsx file content. No explanation. No markdown code fences.
  `,
  user: (prompt: string, colors: any[], typography: any[], componentName: string) => `...`
}
```

### 2B. Import Validator
**New file:** `src/lib/validate-imports.ts`

Parse the TSX source (simple regex is enough — no full AST needed) and check every `@morphiq/ui/*` import against the known registry. Return a structured error before hitting Sucrase.

```typescript
const KNOWN_COMPONENTS = new Set([
  'Navbar', 'HeroSplit', 'HeroCentered', 'HeroMinimal',
  'Features3Col', 'FeaturesAlternating', 'TestimonialCards', 'StatsSection',
  'PricingTiers', 'CTACentered', 'FooterSimple',
  // expand as library grows
])

export type ValidationResult =
  | { ok: true }
  | { ok: false; unknownImports: string[]; suggestion: string }

export function validateImports(tsx: string): ValidationResult {
  // Match: import { X } from '@morphiq/ui/X' or import X from '@morphiq/ui/X'
  const morphiqImports = [...tsx.matchAll(/from ['"]@morphiq\/ui\/(\w+)['"]/g)]
    .map(m => m[1])

  const unknown = morphiqImports.filter(name => !KNOWN_COMPONENTS.has(name))
  if (unknown.length === 0) return { ok: true }

  // Best-effort correction: find closest known name
  return {
    ok: false,
    unknownImports: unknown,
    suggestion: `Unknown component(s): ${unknown.join(', ')}. Available: ${[...KNOWN_COMPONENTS].join(', ')}`,
  }
}
```

**Usage in bundle route** — validate before transform, return 422 on failure so the canvas can show a recoverable error state rather than a silent broken iframe.

### 2C. Bundle API Route with Validation + Cache
**New file:** `src/app/api/bundle/route.ts`

```typescript
import { transform } from 'sucrase'
import { createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { validateImports } from '@/lib/validate-imports'

// In-memory cache — survives across requests in the same serverless instance.
// Good enough for v1; swap for Redis if serverless cold-start invalidation matters.
const bundleCache = new Map<string, string>()

export async function POST(request: NextRequest) {
  const { tsx } = await request.json()

  // 1. Validate imports against known registry
  const validation = validateImports(tsx)
  if (!validation.ok) {
    return NextResponse.json(
      { error: 'import_validation_failed', details: validation.suggestion, unknownImports: validation.unknownImports },
      { status: 422 }
    )
  }

  // 2. Check cache (keyed on content hash — same TSX always produces same JS)
  const hash = createHash('sha256').update(tsx).digest('hex').slice(0, 16)
  if (bundleCache.has(hash)) {
    return NextResponse.json({ js: bundleCache.get(hash)!, cached: true })
  }

  // 3. Transform
  const { code } = transform(tsx, {
    transforms: ['typescript', 'jsx'],
    jsxRuntime: 'automatic',
    production: true,
  })

  bundleCache.set(hash, code)
  return NextResponse.json({ js: code, cached: false })
}
```

**Cache note:** The in-memory cache is per-serverless-instance. On Vercel, the same instance handles repeated requests for the same project efficiently. Add a TTL eviction or move to Redis/KV only if memory pressure becomes measurable.

### 2D. srcdoc Builder
**New file:** `src/lib/tsx-renderer.ts`

```typescript
export function buildSrcdoc(
  js: string,
  styleGuide: StyleGuide,
  componentName: string,
  origin: string
): string {
  // Build import map — all 30-40 component URLs + React/framer CDN
  const importMap = buildImportMap(origin)

  // CSS variables from style guide
  const cssVars = buildCssVars(styleGuide)

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Tailwind CDN injects v3 runtime. Project uses v4, but this is a known iframe limitation.
       Brand colors are applied via CSS vars (--primary, --background, etc.), not Tailwind utilities,
       so layout classes work fine and color fidelity is preserved. -->
  <style>:root { ${cssVars} } body { margin: 0; }</style>
  <script type="importmap">${JSON.stringify(importMap)}</script>
</head>
<body>
  <div id="root"></div>
  <script type="module">
    ${js}

    import { createRoot } from 'react-dom/client'
    createRoot(document.getElementById('root')).render(
      React.createElement(${componentName})
    )

    // Height reporter for canvas shape auto-resize
    new ResizeObserver(() => {
      parent.postMessage({ type: 'morphiq-height', height: document.body.scrollHeight }, '*')
    }).observe(document.body)
  </script>
</body>
</html>`
}

function buildImportMap(origin: string) {
  const components = [
    'Navbar', 'Sidebar', 'HeroSplit', 'HeroCentered', 'HeroMinimal', 'HeroWithApp',
    'Features3Col', 'FeaturesAlternating', 'FeaturesWithIcons', 'FeaturesTimeline',
    'TestimonialCards', 'LogoCloud', 'StatsSection', 'PricingTiers', 'PricingTable',
    'CTACentered', 'CTAGradient', 'CTASplit', 'FooterSimple', 'Footer4Col',
    'AuthSignIn', 'AuthSignUp', 'ContactForm', 'NewsletterForm',
    'MetricCards', 'DataTable', 'ActivityFeed',
    'ProductGrid', 'ProductCard', 'CartSidebar',
    'FAQ', 'BlogGrid', 'PortfolioGrid', 'VideoSection',
  ]

  const componentEntries = Object.fromEntries(
    components.map(c => [`@morphiq/ui/${c}`, `${origin}/morphiq-ui/${c}.js`])
  )

  return {
    imports: {
      // Pin ALL versions. @latest is unstable and will break on CDN cache misses.
      // framer-motion is large (~200KB) — first iframe load is a cold CDN hit.
      // Future: self-host these in public/vendor/ to eliminate CDN dependency.
      'react': 'https://esm.sh/react@18.3.1',
      'react/jsx-runtime': 'https://esm.sh/react@18.3.1/jsx-runtime',
      'react-dom/client': 'https://esm.sh/react-dom@18.3.1/client',
      'framer-motion': 'https://esm.sh/framer-motion@11.15.0',
      'lucide-react': 'https://esm.sh/lucide-react@0.469.0',
      '@morphiq/ui/atoms': `${origin}/morphiq-ui/atoms.js`,
      ...componentEntries,
    }
  }
}
```

### 2E. Updated Generation Routes

**`src/app/api/generate/route.ts`** — stream TSX (not HTML):
```typescript
// OLD: streamText → raw HTML chunks
// NEW: streamText → raw TSX chunks (client accumulates, renders iframe on finish)

const result = await streamText({
  model: anthropic('claude-sonnet-4-6'),
  system: [{ type: 'text', text: prompts.reactUi.system, experimental_providerMetadata: { anthropic: { cacheControl: { type: 'ephemeral' } } } }],
  messages: [{ role: 'user', content: [...] }],
  temperature: 0.7,
  onFinish: async ({ text }) => {
    // Debit credits only on successful completion
    await consumeCredits({ amount: 1 })
  },
})

// Stream the TSX text directly — client handles the rest
return result.toTextStreamResponse()
```

**`src/app/api/generate/redesign/route.ts`** — same pattern:
- Accept `currentTsx` instead of `currentHTML`
- Stream TSX response

**`src/app/api/generate/workflow/route.ts`** — same pattern, stream TSX

**`src/app/api/generate/workflow-redesign/route.ts`** — same pattern + credits fix:
- Stream TSX response
- Fix: `amount: 1` in `onFinish` (was 4)

### 2F. Redux Shape Update
**`src/redux/slice/shapes/index.ts`:**
```typescript
export interface GeneratedUIShape extends BaseShape {
  type: "generatedui"
  x: number
  y: number
  w: number
  h: number
  uiSpecData: string | null    // now stores .tsx string (was HTML)
  componentName?: string       // NEW: "SaaSLandingPage"
  sourceFrameId: string
  isWorkflowPage?: boolean
}
```

### 2G. Canvas Hook: Stream TSX → Code Tab → iframe on Finish
**`src/hooks/use-canvas.ts`** — `handleGenerateDesign`:

```typescript
// Keep ReadableStream reader loop — but now accumulating TSX (not HTML)
// Stream goes to Code Tab in real time; iframe renders only when stream completes.

dispatch(addGeneratedUI({ ..., uiSpecData: null, streamingTsx: '' }))  // Show skeleton

const response = await fetch('/api/generate', { method: 'POST', body: formData })
const reader = response.body!.getReader()
const decoder = new TextDecoder()
let accumulated = ''

while (true) {
  const { done, value } = await reader.read()
  if (done) break
  accumulated += decoder.decode(value, { stream: true })
  // Live-update Code Tab with streaming text (uiSpecData stays null until complete)
  dispatch(updateShape({ id: generatedUIId, patch: { streamingTsx: accumulated } }))
}

// Stream done — extract component name, trigger bundle + iframe render
const componentName = extractComponentName(accumulated)
dispatch(updateShape({
  id: generatedUIId,
  patch: { uiSpecData: accumulated, componentName, streamingTsx: null }
}))
// Shape component now calls /api/bundle and renders iframe (uiSpecData is set)
```

**Redux shape** — add `streamingTsx?: string | null` to `GeneratedUIShape`.

**Code Tab** — shows `streamingTsx ?? uiSpecData` so text appears live during generation.

Same pattern in `useChatWindow` (redesign flow) and workflow generation.

---

## Phase 3 — Canvas Shape: Skeleton + iframe (Week 3)

### 3A. IframeRenderer Component
**New file:** `src/components/canvas/shapes/generatedui/iframe-renderer.tsx`

```typescript
'use client'
import { useEffect, useRef } from 'react'

interface Props {
  srcdoc: string
  shapeId: string
  onHeightChange: (h: number) => void
  previewMode: boolean
}

export function IframeRenderer({ srcdoc, shapeId, onHeightChange, previewMode }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'morphiq-height') onHeightChange(e.data.height)
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  return (
    <iframe
      key={shapeId}                 // Never remount on content changes
      ref={iframeRef}
      srcDoc={srcdoc}
      sandbox="allow-scripts"
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
        pointerEvents: previewMode ? 'all' : 'none',  // canvas mode = draggable
      }}
    />
  )
}
```

### 3B. GeneratedUI Shape Update
**`src/components/canvas/shapes/generatedui/index.tsx`:**

```typescript
// Replace dangerouslySetInnerHTML div:

{!shape.uiSpecData ? (
  // SKELETON — shown during generation
  <div className="w-full h-full bg-muted animate-pulse rounded-lg flex items-center justify-center">
    <div className="text-muted-foreground text-sm">Generating design...</div>
  </div>
) : (
  // IFRAME — shown when TSX is ready
  <IframeRenderer
    srcdoc={buildSrcdoc(
      bundledJs,           // From /api/bundle (cached per tsx)
      styleGuide,
      shape.componentName || 'GeneratedComponent',
      window.location.origin
    )}
    shapeId={shape.id}
    onHeightChange={(h) => dispatch(updateShape({ id: shape.id, patch: { h } }))}
    previewMode={isPreviewMode}
  />
)}
```

**State:** Add local `bundledJs` state — fetches from `/api/bundle` when `uiSpecData` changes, caches result.

**Double-click → preview mode, Escape → canvas mode** (pointer events toggle).

---

## Phase 4 — Toolbar + Code Tab (Week 3–4)

### 4A. Toolbar Upgrade
**`src/components/canvas/shapes/generatedui/index.tsx`:**

Add to toolbar:
- **Breakpoint selector:** 3 icon buttons (Mobile 375px / Tablet 768px / Desktop 1280px) → `dispatch(updateShape({ w: selectedWidth }))`
- **Component name label** — from `shape.componentName`, inline rename on double-click
- **3-dot menu** — moves existing Export, Generate Workflow, Design Chat inside

**Redux:** Add `name?: string` and `breakpoint?: 'mobile' | 'tablet' | 'desktop'` to `GeneratedUIShape`

### 4B. Chat Panel — Code Tab
**`src/components/canvas/shapes/generatedui/chat.tsx`:**

Add tab bar: **Chat** | **Code**

Code tab:
```tsx
<pre className="text-xs overflow-auto p-4 bg-zinc-950 text-zinc-100 rounded-lg">
  {shape.uiSpecData}
</pre>
<Button onClick={() => downloadFile(shape.uiSpecData, `${shape.componentName}.tsx`)}>
  Download .tsx
</Button>
```

---

## Phase 5 — Text Prompt Overlay (Week 4)

### 5A. Prompt Overlay Component
**New file:** `src/components/canvas/prompt-overlay/index.tsx`
- Centered `fixed` overlay with glass styling (matching ChatWindow)
- Textarea + suggestion chips
- Shows automatically when `shapes.length === 0`
- `/` key opens it when no input focused

Suggestion chips: `SaaS Landing Page`, `E-commerce Store`, `Analytics Dashboard`, `Portfolio Site`, `Mobile App Landing`, `Auth / Sign In`, `Pricing Page`, `Blog Layout`

### 5B. Text Prompt API Route
**New file:** `src/app/api/generate/text-prompt/route.ts`
- Accepts `{ prompt, projectId }` JSON (no image)
- Same flow as main generate: fetch style guide + inspiration images
- Uses `prompts.reactUi.system` + prompt as user message
- Streams TSX text response
- 1 credit

### 5C. Hook + Canvas Integration
**New file:** `src/hooks/use-text-prompt.ts`

**Modified:** `src/components/canvas/index.tsx` — mount `<PromptOverlay>`
**Modified:** `src/hooks/use-canvas.ts` — `/` key shortcut

---

## Build Order

```
Day 1:    Phase 0 (caching + credits fix) — immediate ROI, zero risk

Week 1:   Phase 1A — Build 10 MVP components (not 30-40)
          Phase 1B — Pre-compile script, verify /morphiq-ui/ serving

Week 2:   Phase 2A — New system prompt (catalog = 10 MVP components only)
          Phase 2B — Import validator (src/lib/validate-imports.ts)
          Phase 2C — /api/bundle route (Sucrase + hash cache + validation)
          Phase 2D — tsx-renderer.ts (srcdoc builder, pinned CDN versions)
          Phase 2E — Update all 4 generation routes to stream TSX text
          Phase 2F/G — Redux shape type + canvas hook (stream to Code Tab)

Week 2:   Phase 3 — IframeRenderer + skeleton + shape update
          *** STOP HERE. Validate the pipeline fully before expanding library. ***

Week 3:   Phase 1A expansion — add remaining components now that iframe works
          Phase 4 — Toolbar + Code tab

Week 4:   Phase 5 — Text prompt overlay + /api/generate/text-prompt
```

---

## Key Files — Complete Reference

| File | Change |
|---|---|
| `src/app/api/generate/route.ts` | Update to stream TSX text, new prompt |
| `src/app/api/generate/redesign/route.ts` | Stream TSX, accept `currentTsx` |
| `src/app/api/generate/workflow/route.ts` | Stream TSX |
| `src/app/api/generate/workflow-redesign/route.ts` | Stream TSX, fix `amount: 1` |
| `src/lib/validate-imports.ts` | **NEW** — import registry check before Sucrase |
| `src/app/api/bundle/route.ts` | **NEW** — Sucrase JSX→JS + hash cache + validation |
| `src/lib/tsx-renderer.ts` | **NEW** — srcdoc builder with pinned importmap |
| `src/lib/morphiq-ui/*.tsx` | **NEW** — 10 MVP components (expand after pipeline validated) |
| `scripts/build-morphiq-ui.ts` | **NEW** — esbuild pre-compile script |
| `public/morphiq-ui/*.js` | **NEW** — compiled component ES modules |
| `src/prompts/index.ts` | Add `prompts.reactUi` — never touch existing |
| `src/redux/slice/shapes/index.ts` | Add `componentName`, `name`, `breakpoint` |
| `src/components/canvas/shapes/generatedui/index.tsx` | Replace div→IframeRenderer, add toolbar |
| `src/components/canvas/shapes/generatedui/iframe-renderer.tsx` | **NEW** |
| `src/components/canvas/shapes/generatedui/chat.tsx` | Add Code tab |
| `src/hooks/use-canvas.ts` | Stream TSX to Code Tab, render iframe on completion |
| `src/components/canvas/prompt-overlay/index.tsx` | **NEW** |
| `src/hooks/use-text-prompt.ts` | **NEW** |
| `src/app/api/generate/text-prompt/route.ts` | **NEW** |

---

## How MagicPath Does It (Confirmed)

- React + TypeScript + Tailwind + **shadcn/ui** components
- Pre-made design system library (not built-from-scratch per generation)
- Non-streaming (skeleton → complete) — not a code IDE
- Component library with named sections Claude references
- Canvas-first design tool — no Sandpack/full IDE
- Server-side compilation (not Babel in browser)

**Our approach matches this exactly.**

---

## Verification Checklist

- [ ] All 5 routes return prompt cache hit metrics (check Anthropic usage dashboard)
- [ ] `workflow-redesign` charges 1 credit (not 4) after fix
- [ ] `/morphiq-ui/HeroSplit.js` serves valid ES module (`curl /morphiq-ui/HeroSplit.js`)
- [ ] `/api/bundle` returns 422 with `import_validation_failed` for unknown `@morphiq/ui/*` import
- [ ] `/api/bundle` returns `cached: true` on second identical request (hash cache hit)
- [ ] `/api/bundle` transforms valid TSX with JSX → returns valid ES module JS
- [ ] Canvas shape shows skeleton during generation (uiSpecData = null)
- [ ] iframe renders complete React component after generation
- [ ] All CDN versions in importmap are pinned (no `@latest`)
- [ ] Double-click enters preview mode (scroll/hover work), Escape exits
- [ ] Breakpoint selector changes iframe width
- [ ] Code tab shows live-streaming `.tsx` source, then download button
- [ ] Text prompt overlay opens on empty canvas and `/` key
