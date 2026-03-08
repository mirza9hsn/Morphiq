import * as esbuild from 'esbuild'
import { glob } from 'glob'
import path from 'path'
import { existsSync } from 'fs'

const root = path.resolve(__dirname, '..')

// Plugin to resolve @/ path alias → src/ (with extension fallback)
const aliasPlugin: esbuild.Plugin = {
  name: 'alias',
  setup(build) {
    build.onResolve({ filter: /^@\// }, (args) => {
      const base = path.resolve(root, 'src', args.path.slice(2))
      for (const ext of ['.tsx', '.ts', '.js', '']) {
        if (existsSync(base + ext)) return { path: base + ext }
      }
      return { path: base }
    })
  },
}

async function main() {
  // 1. Build each section component as an individual ES module
  const components = await glob('src/lib/morphiq-ui/*.tsx', { cwd: root })
  const sectionFiles = components.filter((f) => !f.endsWith('atoms.tsx'))

  console.log(`Building ${sectionFiles.length} section components...`)

  for (const file of sectionFiles) {
    const name = path.basename(file, '.tsx')
    await esbuild.build({
      entryPoints: [path.resolve(root, file)],
      bundle: true,
      format: 'esm',
      outfile: path.resolve(root, `public/morphiq-ui/${name}.js`),
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'framer-motion',
        'lucide-react',
        '@morphiq/ui/atoms',
      ],
      plugins: [aliasPlugin],
      jsx: 'automatic',
      target: 'es2022',
    })
    console.log(`  ✓ ${name}.js`)
  }

  // 2. Build atoms bundle (shadcn primitives — React external, everything else bundled)
  console.log('Building atoms bundle...')
  await esbuild.build({
    entryPoints: [path.resolve(root, 'src/lib/morphiq-ui/atoms.tsx')],
    bundle: true,
    format: 'esm',
    outfile: path.resolve(root, 'public/morphiq-ui/atoms.js'),
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    plugins: [aliasPlugin],
    jsx: 'automatic',
    target: 'es2022',
  })
  console.log('  ✓ atoms.js')

  console.log(`\nDone → public/morphiq-ui/ (${sectionFiles.length + 1} files)`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
