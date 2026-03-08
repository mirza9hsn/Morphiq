interface StyleGuide {
  colorSections: Array<{
    swatches: Array<{ name: string; hexColor: string }>
  }>
  typographySections: Array<{
    styles: Array<{ name: string; fontFamily: string }>
  }>
}

const IMPORT_MAP = {
  imports: {
    react: 'https://esm.sh/react@18.3.1',
    'react/jsx-runtime': 'https://esm.sh/react@18.3.1/jsx-runtime',
    'react/jsx-dev-runtime': 'https://esm.sh/react@18.3.1/jsx-dev-runtime',
    'react-dom': 'https://esm.sh/react-dom@18.3.1?external=react',
    'react-dom/client': 'https://esm.sh/react-dom@18.3.1/client?external=react',
    'framer-motion': 'https://esm.sh/framer-motion@11.15.0?external=react,react-dom',
    'lucide-react': 'https://esm.sh/lucide-react@0.469.0?external=react',
    'clsx': 'https://esm.sh/clsx@2.1.1',
    'tailwind-merge': 'https://esm.sh/tailwind-merge@2.3.0',
  },
}

function buildCssVars(styleGuide: StyleGuide | null): string {
  if (!styleGuide?.colorSections?.length) {
    return '--background: #ffffff; --foreground: #111111; --primary: #6366f1; --primary-foreground: #ffffff;'
  }

  const varMap: Record<string, string> = {}
  for (const section of styleGuide.colorSections) {
    for (const swatch of section.swatches) {
      varMap[swatch.name.toLowerCase().replace(/\s+/g, '-')] = swatch.hexColor
    }
  }

  const tokens = [
    'background', 'foreground', 'primary', 'primary-foreground',
    'secondary', 'secondary-foreground', 'muted', 'muted-foreground',
    'accent', 'accent-foreground', 'card', 'card-foreground', 'border',
  ]

  return tokens.filter((t) => varMap[t]).map((t) => `--${t}: ${varMap[t]}`).join('; ')
}

export function buildSrcdoc(
  js: string,
  styleGuide: StyleGuide | null,
  componentName: string,
): string {
  const cssVars = buildCssVars(styleGuide)

  // The generated JS already includes:
  //   import React, { useState, ... } from 'react'
  //   import { motion } from 'framer-motion'
  //   import { Icon } from 'lucide-react'
  //   function ComponentName() { ... }
  //
  // We add React + createRoot imports as safety-net fallbacks.
  // ES modules deduplicate, so duplicate imports are harmless.
  //
  // IMPORTANT: Error handling MUST go in a SEPARATE, preceding
  // <script> tag (non-module), because if the module script has
  // an import that fails, the entire module is aborted and no
  // code in it ever runs — including any error handlers.

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://cdn.tailwindcss.com"><\/script>
  <style>
    :root { ${cssVars} }
    body { margin: 0; font-family: Inter, system-ui, sans-serif; }
    #__err { display:none; position:fixed; inset:0; z-index:99999;
             background:#1a0000; color:#ff6b6b; padding:24px;
             font:13px/1.6 monospace; white-space:pre-wrap; overflow:auto; }
  </style>
  <script type="importmap">${JSON.stringify(IMPORT_MAP)}<\/script>
</head>
<body>
  <div id="root"></div>
  <div id="__err"></div>

  <!-- Error catcher — runs BEFORE the module so it catches import failures -->
  <script>
    window.__showErr = function(e) {
      var d = document.getElementById('__err');
      d.style.display = 'block';
      d.textContent = 'Render Error:\\n' + (e && e.stack ? e.stack : String(e));
    };
    window.addEventListener('error', function(ev) { window.__showErr(ev.error || ev.message); });
    window.addEventListener('unhandledrejection', function(ev) { window.__showErr(ev.reason); });
  <\/script>

  <script type="module">
import React from 'react'
import { createRoot } from 'react-dom/client'

${js}

try {
  createRoot(document.getElementById('root')).render(React.createElement(${componentName}))
} catch(e) {
  window.__showErr(e);
}

new ResizeObserver(() => {
  parent.postMessage({ type: 'morphiq-height', height: document.body.scrollHeight }, '*')
}).observe(document.body)
  <\/script>
</body>
</html>`
}
