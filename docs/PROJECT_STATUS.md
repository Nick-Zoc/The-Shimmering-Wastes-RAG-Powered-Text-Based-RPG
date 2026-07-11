# Project Status

Last updated: 2026-07-11
Current phase: Phase 0 - Recovery, audit, and direction
Overall health: visually strong static prototype; backend/RAG not implemented; uncommitted frontend batch is not release-ready

## Done

- [x] Repository, documents, code, assets, tests, Git history, and working tree audited.
- [x] Both historical PDFs fully read and visually checked.
- [x] Current onboarding, Bastion, and merchant flow playtested locally.
- [x] Target architecture, game direction, RAG/content plan, frontend plan, roadmap, ADR, and agent workflow created.
- [x] `docs/` made trackable and baseline generated-file ignores added.

## Current truth

- `main` and local `origin/main` point to the same commit (`996adb3`).
- Five frontend files contain about 1,000 added and 152 removed lines beyond that commit.
- Those changes add abilities, derived stats, equipment/paper doll, rarity/affixes, build descriptions, and VFX work.
- The same batch introduces blocking combat, load, save-feedback, stat, equipment, reward, region, economy, responsive, accessibility, and injection problems.
- Backend Python files and requirements are commented placeholders only.
- There is no API, database, content ingestion, vector index, model call, or real automated test suite.

## Safe documentation commit

- Nothing is currently staged.
- Stage only `.gitignore`, `README.md`, `AGENTS.md`, and the new Markdown files under `docs/`.
- Exclude the five modified frontend files, the empty asset tree, and all exploratory test files until repaired.
- Suggested message: `Docs,Chore: add canonical architecture and phased plans,fix repository ignore rules`.
- After Frontend F0 passes, suggested feature message: `Feat,Fix,Refact: add combat abilities and affixed equipment,fix state save and travel regressions,refactor stats and inventory UI`.

## Next actions

1. Preserve the inherited frontend batch on a branch/patch/WIP commit.
2. Remove the accidental tracked `.env` from the Git index and add `.env.example` only when variables exist. Its current contents were verified to contain no credential, but ignoring it alone does not protect an already tracked file.
3. Repair only the Frontend F0 reference slice: one combat path, pure stats, safe rendering, correct economy/travel/rewards, real save feedback, and meaningful tests.
4. Establish the typed frontend foundation and mock game-service contract.
5. Begin the deterministic Python engine for the Last Bastion/Ash Plains vertical slice.

## Open decisions and blockers

- Product direction is set: interactive turn-based narrative RPG, not idle, unless explicitly reversed.
- Commit/push blocker: the unfinished frontend batch must be repaired or isolated as clearly labelled WIP before merging to `main`.

## Last validation

- PDF extraction and seven-page visual inspection: passed.
- Desktop playthrough through character creation, Bastion, Silas, and a purchase: passed for the tested path.
- JavaScript syntax (`data.js`, `game.js`, `ui.js`): passed.
- Mobile 375px layout: failed; main content is unusably narrow.
- Existing root Puppeteer script: failed because the dependency is not available at root.
- `test-puppeteer` package test: failed because its script intentionally exits with an error.

See [Roadmap](ROADMAP.md) for phase gates and [Frontend Plan](FRONTEND_PLAN.md) for the repair list.
