'use client'
import { useEffect, useState } from 'react'
import { buildSrcdoc } from '@/lib/tsx-renderer'

interface StyleGuide {
  colorSections: Array<{
    swatches: Array<{ name: string; hexColor: string }>
  }>
  typographySections: Array<{
    styles: Array<{ name: string; fontFamily: string }>
  }>
}

interface Props {
  tsx: string
  componentName: string
  styleGuide: StyleGuide | null
  shapeId: string
}

export function IframeRenderer({ tsx, componentName, styleGuide, shapeId }: Props) {
  const [srcdoc, setSrcdoc] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setError(null)
    setSrcdoc(null)

    async function bundle() {
      try {
        const res = await fetch('/api/bundle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tsx }),
        })

        const data = await res.json()

        if (!res.ok) {
          const contentType = res.headers.get('content-type')
          if (contentType && contentType.includes('text/html')) {
            if (!cancelled) setError('Bundle API returned HTML instead of JSON. This might be a server error.')
          } else {
            if (!cancelled) setError(data.details ?? data.error ?? 'Bundle failed')
          }
          return
        }

        if (!cancelled) {
          setSrcdoc(buildSrcdoc(data.js, styleGuide, data.componentName ?? componentName))
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unknown error')
      }
    }

    bundle()
    return () => { cancelled = true }
  }, [tsx, styleGuide])

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-950/20 p-4">
        <p className="text-red-400 text-xs font-mono whitespace-pre-wrap">{error}</p>
      </div>
    )
  }

  if (!srcdoc) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/10">
        <div className="animate-pulse text-muted-foreground text-sm">Rendering...</div>
      </div>
    )
  }

  return (
    <iframe
      key={shapeId}
      srcDoc={srcdoc}
      sandbox="allow-scripts"
      style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'auto' }}
    />
  )
}
