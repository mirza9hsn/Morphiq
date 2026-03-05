---
name: prompt-engineering
description: "Editing or improving AI system prompts in src/prompts/. Use when
              tuning style guide generation, generative UI output quality, or
              the workflow orchestration prompt. These are critical business logic."
---

## AI Prompt Engineering for Morphiq

### Prompt Files

- `src/prompts/style-guide.ts` — generates the project style guide (JSON output)
- `src/prompts/generative-ui.ts` — generates production UI code (Next.js + Tailwind)
- `src/prompts/workflow.ts` — orchestrates multi-step AI tasks

### Hard Constraints (Never Violate)

- **Style guide** output must be valid JSON matching the schema expected by `src/redux/slice/`
- **All color pairs** must pass WCAG AA contrast: 4.5:1 for normal text, 3:1 for large text
- **Generative UI** output must be valid Next.js + Tailwind CSS v4 (CSS variables, no `theme()`)
- Never reference components that don't exist in the project
- Changing the output schema breaks downstream parsers — update all consumers if you do

### Process

1. Read the full prompt file before touching anything
2. Identify the specific failure mode or quality target
3. Make minimal, surgical edits — don't rewrite what isn't broken
4. Mentally trace edge cases: what inputs could break the new version?
5. If adding examples to the prompt, use realistic Morphiq design scenarios

### Style Guide JSON Schema

The style guide prompt enforces a structured object. Before editing, check:
- `src/redux/slice/` for the exact shape the frontend expects
- Any downstream code that parses the JSON response in `src/app/api/generate/`

### After Changes

If a prompt change reflects a new stable pattern or constraint, document it in `MEMORY.md`.
