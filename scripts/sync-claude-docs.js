#!/usr/bin/env node
/**
 * sync-claude-docs.js
 * Calls Claude Haiku to analyze recent git changes and update Claude documentation.
 * Used by GitHub Actions and `npm run sync-docs` locally.
 */

const { execSync } = require('child_process');
const fs = require('fs');

function run(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  } catch {
    return '';
  }
}

function readFile(filePath) {
  try { return fs.readFileSync(filePath, 'utf8'); } catch { return ''; }
}

function listDir(dir) {
  try {
    return fs.readdirSync(dir).join(', ');
  } catch { return ''; }
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY is not set');
    process.exit(1);
  }

  // --- 1. Gather context ---
  const isCI = process.env.CI === 'true';
  const sinceFlag = isCI ? '--since="1 day ago"' : '--since="7 days ago"';

  const gitLog     = run(`git log --oneline ${sinceFlag} --all`);
  const diffStat   = run('git diff HEAD~1 --stat');
  const schemaDiff = run('git diff HEAD~1 -- convex/schema.ts');
  const pkgDiff    = run('git diff HEAD~1 -- package.json');
  const appDiff    = run('git diff HEAD~1 --name-only -- src/app/ src/components/ src/redux/ src/inngest/ src/prompts/');

  const claudeMd    = readFile('CLAUDE.md');
  const conventions = readFile('.claude/rules/conventions.md');
  const patterns    = readFile('.claude/rules/patterns.md');
  const schema      = readFile('convex/schema.ts');
  const pkg         = readFile('package.json');

  const appDirs        = listDir('src/app');
  const componentDirs  = listDir('src/components');
  const reduxSlices    = listDir('src/redux/slice');

  if (!gitLog.trim()) {
    console.log('No recent commits found. Nothing to sync.');
    return;
  }

  // --- 2. Build prompt ---
  const prompt = `You are syncing Claude AI documentation for the Morphiq project after recent commits.

## Recent Commits
${gitLog}

## Changed Files Summary
${diffStat}

## Key File Diffs

### convex/schema.ts diff
${schemaDiff.slice(0, 3000) || '(no changes)'}

### package.json diff
${pkgDiff.slice(0, 1500) || '(no changes)'}

### Other changed src/ files
${appDiff || '(no changes)'}

## Current Documentation

### CLAUDE.md (current)
${claudeMd}

### .claude/rules/conventions.md (current)
${conventions}

### .claude/rules/patterns.md (current)
${patterns}

## Current Codebase Structure

### convex/schema.ts (full)
${schema.slice(0, 3000)}

### src/app/ contents: ${appDirs}
### src/components/ contents: ${componentDirs}
### src/redux/slice/ contents: ${reduxSlices}

### package.json dependencies
${pkg.slice(0, 2000)}

## Your Task
Update the three documentation files to accurately reflect what changed.

Rules:
- Make MINIMUM necessary changes. If a section is already accurate, return null for that file.
- Keep CLAUDE.md under 100 lines. Move detail to rules files if needed.
- Only document what you can confirm exists in the code — never invent.
- Update Convex Schema section if schema changed.
- Update Tech Stack if new packages added.
- Update Project Structure if new directories appeared.
- Add/remove patterns in patterns.md if workflows changed.
- Add/remove conventions in conventions.md if coding patterns changed.

Return ONLY a valid JSON object, no explanation outside the JSON:
{
  "CLAUDE.md": "full updated file content, or null if no changes needed",
  ".claude/rules/conventions.md": "full updated file content, or null if no changes needed",
  ".claude/rules/patterns.md": "full updated file content, or null if no changes needed",
  "summary": "one sentence: what changed and what was updated"
}`;

  // --- 3. Call Haiku ---
  console.log('Calling Claude Haiku to analyze changes...');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    console.error('Anthropic API error:', response.status, await response.text());
    process.exit(1);
  }

  const data = await response.json();
  const text = data.content[0].text;

  // --- 4. Parse response ---
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.log('Haiku returned no changes needed.');
    return;
  }

  let updates;
  try {
    updates = JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error('Failed to parse Haiku response as JSON:', e.message);
    process.exit(1);
  }

  // --- 5. Write updated files ---
  let anyChanged = false;

  const filesToUpdate = {
    'CLAUDE.md': updates['CLAUDE.md'],
    '.claude/rules/conventions.md': updates['.claude/rules/conventions.md'],
    '.claude/rules/patterns.md': updates['.claude/rules/patterns.md'],
  };

  for (const [filePath, content] of Object.entries(filesToUpdate)) {
    if (content && content !== readFile(filePath)) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
      anyChanged = true;
    }
  }

  // GEMINI.md always mirrors CLAUDE.md — keep them in sync
  const updatedClaude = updates['CLAUDE.md'] || readFile('CLAUDE.md');
  if (updatedClaude !== readFile('GEMINI.md')) {
    fs.writeFileSync('GEMINI.md', updatedClaude, 'utf8');
    console.log('Updated: GEMINI.md (mirrored from CLAUDE.md)');
    anyChanged = true;
  }

  if (!anyChanged) {
    console.log('All docs are already up to date.');
  } else {
    console.log(`\nSummary: ${updates.summary}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
