---
name: sync-docs
description: "Sync all Claude documentation with the current state of the codebase.
              Run after any significant change — feature added, feature removed,
              new dependency, refactor, schema change. Also scans collaborator commits."
---

## Sync Documentation Protocol

Analyze the codebase and update all Claude documentation to reflect its current state.
Handle both additions (new features) and removals (deleted features) equally.

---

### Step 1 — Understand What Changed

Run these in order:

```bash
git log --oneline --since="1 day ago" --all
```
```bash
git diff --stat $(git log --since="1 day ago" --format="%H" | tail -1) HEAD
```
```bash
gh pr list --state merged --base main --limit 20
```
(skip gh command if gh CLI is not available)

If no commits appear in the last day (e.g. running after a weekend or holiday), expand the window:
```bash
git log --oneline --since="7 days ago" --all
```

Look for:
- New features added (new directories, new major files, new npm packages)
- Features removed (deleted directories, removed files)
- Refactors (files moved, renamed, restructured)
- Schema changes (convex/schema.ts touched)
- New dependencies (package.json changed)
- New API routes, new Inngest functions, new Redux slices

---

### Step 2 — Read Current Codebase State

Read these files/dirs to understand what actually exists right now:

1. `convex/schema.ts` — current DB schema
2. `src/app/` — current route structure
3. `src/components/` — current component categories
4. `src/redux/slice/` — current Redux slices
5. `src/inngest/functions.ts` — current Inngest functions
6. `src/prompts/` — current AI prompts
7. `src/app/api/` — current API routes
8. `package.json` — current dependencies (reveals new integrations)

---

### Step 3 — Update Documentation Files

Compare what you found against what's documented. Update accordingly:

#### `CLAUDE.md`
- **Project Structure**: Add new directories, remove deleted ones. Reflect actual folder tree.
- **Convex Schema**: Update table list, add new tables/fields, remove deleted ones.
- **Tech Stack**: Add new libraries if added to package.json (e.g., new auth provider, new AI SDK).
- **Critical Rules**: Add rules for new subsystems that need them.
- Keep under 100 lines — move detail to rules files if it's getting long.

#### `.claude/rules/conventions.md`
- Add new conventions if a new pattern emerged (e.g., new component type, new file naming rule).
- Remove conventions for deleted subsystems.
- Update if the approach changed (e.g., styling system switched).

#### `.claude/rules/patterns.md`
- Add a new pattern section for any new major subsystem.
- Remove pattern sections for deleted subsystems.
- Update steps if the workflow changed.

#### `~/.claude/projects/.../memory/MEMORY.md`
- Add an entry for each significant feature added or removed.
- Add architectural decisions visible from commits (e.g., "switched from X to Y").
- Remove entries that are no longer accurate.

#### Skills and Agents (create new ones if warranted)
- If a new major subsystem was added that will require specialist knowledge repeatedly,
  create a new skill in `.claude/skills/` or agent in `.claude/agents/`.
- Example: new payment provider added → create a billing skill.
- Example: new third-party API integrated → create an agent for it.

---

### Step 4 — Report

After all updates, output a clear summary:

```
## Sync Complete

### Files Updated
- CLAUDE.md: [what changed]
- .claude/rules/conventions.md: [what changed]
- .claude/rules/patterns.md: [what changed]
- MEMORY.md: [what changed]

### Features Added (documented)
- [list]

### Features Removed (cleaned up)
- [list]

### New Skills/Agents Created
- [list, or "none"]

### Unchanged
- [files that needed no update]
```
