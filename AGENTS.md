# Agent Workflow

This file defines the default workflow for any agent or contributor working in this repository.

## Required reading

Before editing, read:

1. `README.md`
2. `docs/PROJECT_STATUS.md`
3. `docs/ROADMAP.md`
4. `docs/ARCHITECTURE.md`

Also read the document for the area being changed:

- Frontend: `docs/FRONTEND_PLAN.md`
- Mechanics: `docs/GAME_DESIGN.md`
- Lore, assets, ingestion, retrieval, or AI: `docs/CONTENT_AND_RAG.md`
- Major architectural change: the relevant file under `docs/decisions/`

The PDFs in `docs/` are historical inputs, not current specifications.

## Sources of truth

| Concern | Source of truth |
|---|---|
| Current delivery state | `docs/PROJECT_STATUS.md` |
| Phase order and exit gates | `docs/ROADMAP.md` |
| Component boundaries and API direction | `docs/ARCHITECTURE.md` plus accepted ADRs |
| Game rules and core loop | `docs/GAME_DESIGN.md`, then typed rule data and tests |
| Lore and retrieval behavior | `docs/CONTENT_AND_RAG.md`, then versioned content sources |
| Numeric mechanics and balance | Typed YAML/JSON catalogs, deterministic engine code, and tests |
| Runtime game state | Authoritative backend snapshot and turn event log |

Do not make a PDF, prompt, narrative string, vector chunk, CSS class, or frontend action name authoritative for mechanics.

## Implementation rules

1. Inspect `git status` and the relevant code before editing. Preserve unrelated user changes.
2. Work toward the next unchecked roadmap gate; do not expand scope without recording the decision.
3. Keep one deterministic rules path. The model must never directly set HP, currency, loot, quest state, legal actions, or save data.
4. Treat player text, retrieved content, and model output as untrusted. Render text or sanitized Markdown only.
5. Use stable IDs for entities and assets. Display names are presentation, not keys.
6. Keep explicit actions functional even when free-text interpretation or narration fails.
7. Add or update tests with behavior changes. Record only validations that were actually run.
8. Stop any development server started during the run unless the user asks to keep it alive.

Before committing or asking the user to commit, inspect exactly what is staged:

```bash
git diff --cached --name-status
git diff --cached --check
```

Then run the relevant validation commands. Never use checkout/reset/clean to discard an inherited working tree. Preserve unfinished user work on a dedicated branch, patch, or clearly labelled WIP commit before a migration that could overwrite it.

## Documentation update policy

For every meaningful implementation run:

- Update `docs/PROJECT_STATUS.md` with the current phase, completed work, next actions, blockers, and validation.
- Update the relevant `docs/ROADMAP.md` checkboxes only when their acceptance evidence exists.
- Update the relevant area plan when scope or ordering changes.

For a major decision that changes authority, contracts, storage, framework, provider, retrieval strategy, or content format:

1. Add an ADR under `docs/decisions/`. Accepted ADRs are immutable; replace a decision with a new ADR that explicitly supersedes the old one.
2. Update `docs/ARCHITECTURE.md` and any affected area plan.
3. Add a short note to the active roadmap phase.

Do not maintain a duplicate prose changelog. Git history records implementation history; status documents record current truth.

## Phase completion

A phase is complete only when:

- Its checklist is finished.
- Its stated exit gate is demonstrated.
- Relevant automated checks pass.
- Manual-only verification is clearly identified.
- `docs/PROJECT_STATUS.md` is updated.

Do not mark a phase complete because code exists but is unreachable, untested, or contradicted by the runtime state.

## Current baseline validation

Until the new toolchain lands, the minimum code checks are:

```bash
node --check frontend/js/data.js
node --check frontend/js/game.js
node --check frontend/js/ui.js
```

The current Puppeteer files are exploratory and do not constitute a passing test suite. Replace this section with the canonical install, lint, type-check, unit, integration, and browser commands when Phase 1 establishes them.
