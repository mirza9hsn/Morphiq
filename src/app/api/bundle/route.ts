import { transform } from 'sucrase'
import { createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

const bundleCache = new Map<string, { js: string; componentName: string }>()

/**
 * Strip export keywords from Sucrase output so the code
 * can run inside an inline <script type="module">.
 *
 * `export` is technically valid in inline modules but
 * `export default function X` can shadow the binding in
 * some edge-cases with strict-mode const/let, so we strip
 * it to be safe. We keep ALL imports intact — the ES module
 * system deduplicates them automatically.
 */
function stripExports(code: string): string {
  return code
    .replace(/\bexport\s+default\s+/g, '')
    .replace(/\bexport\s+(?=(?:const|let|var|function|class)\s)/g, '')
    .replace(/^export\s*\{[^}]*\}\s*;?\s*$/gm, '')
}

export async function POST(request: NextRequest) {
  try {
    const { tsx } = await request.json()

    if (!tsx || typeof tsx !== 'string') {
      return NextResponse.json({ error: 'Missing tsx field' }, { status: 400 })
    }

    const hash = createHash('sha256').update(tsx).digest('hex').slice(0, 16)
    const cached = bundleCache.get(hash)
    if (cached) {
      return NextResponse.json({ ...cached, cached: true })
    }

    // Classic runtime: JSX → React.createElement(...)
    // The AI-generated code already imports React, so the
    // identifier is in scope from the user code itself.
    const { code } = transform(tsx, {
      transforms: ['typescript', 'jsx'],
      jsxRuntime: 'classic',
      production: true,
    })

    const componentName =
      tsx.match(/export\s+default\s+function\s+(\w+)/)?.[1] ||
      tsx.match(/export\s+default\s+(\w+)/)?.[1] ||
      'GeneratedComponent'

    const js = stripExports(code)

    const result = { js, componentName }
    bundleCache.set(hash, result)
    return NextResponse.json({ ...result, cached: false })
  } catch (error) {
    return NextResponse.json(
      { error: 'transform_failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
