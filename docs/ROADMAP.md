# Project Roadmap

Last updated: 2026-07-12

This is the canonical phase checklist. Detailed implementation belongs in the linked area plans. A phase is complete only when its exit gate is demonstrated and `PROJECT_STATUS.md` records the validation.

## Phase 0 - Recovery, audit, and direction

Goal: recover the real project state and replace stale planning with maintained sources.

- [x] Inventory tracked, untracked, and ignored files.
- [x] Read and visually inspect both historical PDFs.
- [x] Audit the full frontend, backend placeholders, tests, and Git history.
- [x] Play through the current onboarding, Bastion, and merchant flow.
- [x] Compare the working tree with `HEAD` and identify commit blockers.
- [x] Establish deterministic backend authority and RAG boundaries.
- [x] Create the canonical architecture, game, content/RAG, frontend, roadmap, status, ADR, and agent-workflow documents.
- [x] Stop ignoring new files under `docs/` and add baseline generated-file exclusions.
- [x] Verify the accidental tracked `.env` contains no credential or secret requiring history remediation.
- [ ] Remove the accidental `.env` from the Git index and add `.env.example` only when real variables exist.
- [ ] Preserve the unfinished frontend batch on a dedicated branch, patch, or clearly labelled WIP commit.
- [x] Supersede the React migration with a vanilla HTML/CSS/JS frontend and learning-first backend scope in ADR 0003.

Exit gate: current truth, target boundaries, immediate risks, and next phase are explicit. New documentation appears in Git status.

Notes:

- The original PDFs remain historical seeds, not specifications.
- `main` currently matches local `origin/main`; all newer frontend work is uncommitted.

## Phase 1 - Frontend baseline and typed foundation

Goal: finish a distinctive, correct, responsive, and testable vanilla frontend before backend work.

See [Frontend Plan](FRONTEND_PLAN.md), F0-F1.

- [x] Resolve or remove the dual-combat, ability, VFX, load, autosave, derived-stat, affix, reward, travel, economy, and injection regressions.
- [ ] Replace duplicate exploratory browser scripts with assertions.
- [ ] Capture reference flows and responsive screenshots.
- [x] Implement the Bastion Field Rig design system across all core components.
- [ ] Refactor the existing HTML/CSS/vanilla JS only where responsibilities become clearer and testable.
- [ ] Complete settings, map, save management, responsive layouts, accessibility, and player-identity polish.
- [ ] Add canonical lint, type-check, unit, and browser commands.
- [ ] Run the frontend checks in CI.

Exit gate: the complete local prototype loop is visually coherent, responsive, accessible, mechanically truthful, and covered by meaningful automated/manual checks. The frontend is frozen before Phase 2 begins.

Notes:

- The first correctness/design/QOL implementation is present in the working tree and the deterministic engine assertions pass.
- Live Chrome passes now cover onboarding, the core game shell, all primary ledgers, merchant purchase, travel, combat/rewards/loot, save/restore, and 390px/768px responsive layouts; the observed inventory and combat-deck defects were repaired.
- Static frontend contract assertions now complement the engine test, but they are not accepted as browser or accessibility evidence.
- Phase 1 remains open until responsive visual checks, keyboard/touch playtesting, legacy CSS cleanup, and canonical browser assertions provide the acceptance evidence.

## Phase 2 - Deterministic game engine

Goal: implement the playable slice without AI or browser authority.

- [ ] Add `pyproject.toml`, lockfile, backend package structure, Pydantic, and canonical lint/type/test configuration.
- [ ] Define Pydantic domain models, commands, events, state, and authoritative mechanics catalog schemas.
- [ ] Convert the required builds, items, abilities, enemies, locations, and rules into typed authoritative sources.
- [ ] Implement pure `resolve(state, command, catalog, rng)` behavior.
- [ ] Enforce HP/MP, currency, inventory, equipment, action, travel, combat, time, and progression invariants.
- [ ] Record and replay PRNG seed/algorithm plus engine and rules/catalog versions.
- [ ] Add unit/property tests, golden turns, and balance simulations for every build.
- [ ] Complete the Bastion -> Ash Plains -> victory/death loop without AI.
- [ ] Run deterministic engine checks in CI.

Exit gate: the same initial state, command sequence, catalog, and seeds always produce the same events and final state.

## Phase 3 - Persistence and turn API

Goal: make the backend the durable state authority.

- [ ] Add FastAPI routes, request/response configuration, and health endpoints to the Phase 2 package.
- [ ] Add PostgreSQL/pgvector development environment and migrations.
- [ ] Store versioned game aggregates, immutable turn resolutions/fallbacks, and append-only generated presentations.
- [ ] Implement game create/get/delete, turn submit/list/detail, and idempotent retry behavior.
- [ ] Add guest ownership, idempotent request IDs, and optimistic state versions.
- [ ] Add structured errors, logging, configuration, and secret handling.
- [ ] Add explicit state-schema migrations and tests for restart, duplicate, conflict, invalid command, and old-save behavior.
- [ ] Run migration/API integration checks in CI.

Exit gate: saves survive restart; a duplicate turn never applies twice; stale clients recover safely.

## Phase 4 - Versioned content pipeline

Goal: replace PDFs and mixed JS data with maintainable canonical sources.

See [Content and RAG Plan](CONTENT_AND_RAG.md).

- [ ] Add lore/dialogue/asset schemas, world manifest, stable IDs, and asset manifest around the Phase 2 mechanics catalogs.
- [ ] Convert the required PDF/frontend lore for Last Bastion, Silas, Elara, Ash Plains, Ash Hound, and Rust Beetle.
- [ ] Keep Phase 2 numeric rules/entities separate from retrievable prose.
- [ ] Remove embedded system-instruction text from content.
- [ ] Compare embedding candidates against quality, latency, dimensions, and cost; record the selection in an ADR.
- [ ] Implement the selected versioned `Embedder` adapter.
- [ ] Implement validation, cross-reference checks, immutable manifest versions, checksums, semantic chunking, staging builds, and idempotent ingestion.
- [ ] Record asset source/license metadata.

Exit gate: one command validates and rebuilds an identical versioned corpus/index without duplicate or stale chunks.

## Phase 5 - Retrieval and evaluation

Goal: prove that RAG retrieves the right knowledge without leaking hidden facts.

- [ ] Implement hybrid keyword/vector retrieval with metadata filters.
- [ ] Compose queries from controlled game state and resolved events.
- [ ] Add canonical lore and NPC knowledge lanes.
- [ ] Create expected/forbidden-source retrieval cases.
- [ ] Measure Hit/Recall@K, wrong-region/entity retrieval, spoiler leakage, and latency.
- [ ] Add developer trace output for source IDs and scores.
- [ ] Compare retrieval configurations against the evaluation set and record the selected baseline.
- [ ] Run retrieval evaluation in CI.

Exit gate: the curated first-slice dataset meets its documented retrieval threshold and spoiler tests.

## Phase 6 - AI narration and free-text intent

Goal: add bounded AI value without weakening game correctness.

- [ ] Compare intent/narration model candidates against grounding, schema rate, latency, and cost budgets; record the selection in an ADR.
- [ ] Add direct provider SDK adapters behind `IntentInterpreter` and `Narrator` interfaces.
- [ ] Map free text to legal commands with validation and clarification.
- [ ] Narrate exact domain events using filtered retrieved context.
- [ ] Validate every response; allow one bounded repair attempt and deterministic fallback.
- [ ] Store prompt/model/content/retrieval versions, latency, usage, and cost.
- [ ] Add grounding, contradiction, injection, schema, timeout, and fallback evaluations.

Exit gate: the provider can be disabled and the complete game loop remains correct and playable.

## Phase 7 - End-to-end portfolio vertical slice

Goal: deliver one polished, deployable demonstration of the whole architecture.

- [ ] Connect the typed frontend to the turn API.
- [ ] Complete responsive/accessibility work for the demo flow.
- [ ] Handle progress, idempotent retry, reconnect, conflict, and AI fallback states.
- [ ] Add end-to-end tests for new game, merchant, exploration, combat, death, save/reload, free text, and provider failure.
- [ ] Add a developer-only RAG/turn trace.
- [ ] Document architecture, evaluation results, screenshots, setup, and a short demo script.
- [ ] Complete production containers, deployment pipeline, rate/cost limits, backups, and readiness checks on top of the earlier CI/migrations.

Exit gate: a fresh clone can run the documented demo; production deployment passes the same critical flow; evidence is suitable for the CV/portfolio.

## Phase 8 - Campaign expansion

Goal: grow a proven system into the complete game.

- [ ] Quest journal, codex, map, and settings.
- [ ] Player memory and bounded NPC relationship knowledge.
- [ ] Crystal Forest content and distinct gameplay mechanic.
- [ ] Factions, additional quests, equipment, abilities, and encounters.
- [ ] Colossus Crater, final boss, and ending.
- [ ] Content-authoring and balance workflows for continued expansion.

Exit gate: a complete authored campaign has progression, ending, regression coverage, retrieval quality evidence, and save migrations.
