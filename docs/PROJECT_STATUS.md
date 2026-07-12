# Project Status

Last updated: 2026-07-12
Current phase: Phase 1 - Vanilla frontend finalization
Overall health: desktop browser loop partially validated and repaired; complete responsive/gameplay browser sweep still required before frontend freeze

## Done

- [x] Repository, documents, code, assets, tests, Git history, and working tree audited.
- [x] Both historical PDFs fully read and visually checked.
- [x] Current onboarding, Bastion, and merchant flow playtested locally.
- [x] Target architecture, game direction, RAG/content plan, frontend plan, roadmap, ADR, and agent workflow created.
- [x] `docs/` made trackable and baseline generated-file ignores added.
- [x] React migration superseded by ADR 0003; vanilla HTML/CSS/JS is the canonical frontend.
- [x] Bastion Field Rig design language documented.
- [x] Dynamic abilities made the only combat path; guard, flee, rewards, loot, and enemy turns now share one resolver.
- [x] Economy, travel, derived resources, equipment identity, save normalization, real autosave, and load restoration repaired.
- [x] Narrative rendering hardened and remote generated speaker avatars replaced with project-owned sigils.
- [x] Bastion Field Rig applied to the menu, HUD, expedition log, actions, combat, inventory, stats, saves, map, and settings.
- [x] Settings, field map, player identity, delete confirmation, legacy-save recovery, and deterministic engine assertions added.
- [x] Main menu and intro inspected in the live desktop browser; legacy title overlap repaired and the visual-novel typewriter made skippable.
- [x] Laptop-height field rig compacted and all modals converted to bounded scrollable ledgers/full-height mobile sheets after measured overflow defects.
- [x] Deterministic assertions extended through flee and death/recovery; a static frontend contract test now guards IDs, script order, safe rendering, accessibility hooks, and responsive contracts.
- [x] Direct `file://` loading verified in Brave and documented as a zero-setup review path.
- [x] Brave visual inspection exposed a remaining legacy subtitle transform; it was removed, and reward/notification feedback was restyled to eliminate non-semantic glow.

## Current truth

- `main` and local `origin/main` point to the same documentation commit (`ec6f2b5`).
- The working tree contains the inherited frontend batch plus the current correctness, design, QOL, test, and planning changes; nothing is staged.
- `frontend/css/design-system.css` is the active visual override while the 3,000-line exploratory legacy stylesheet is reduced later.
- The deterministic Node test covers builds/derived HP, purchases, insufficient funds, save/load, guard/enemy turns, victory/rewards/loot, flee, death/recovery, autosave, and legacy-save normalization.
- `tests/frontend-contract.test.mjs` checks the HTML/JS/CSS integration contract without pretending to replace a browser suite.
- The root `test_browser.js` and `test-puppeteer/` remain exploratory user files and are not canonical tests.
- Backend Python files and requirements are commented placeholders only.
- There is no API, database, content ingestion, vector index, or model call.

## Commit scope

- Nothing is currently staged.
- Include the maintained docs, `frontend/` changes, `frontend/css/design-system.css`, and `tests/game-engine.test.mjs` in the next reviewed frontend commit.
- Exclude `test_browser.js` and `test-puppeteer/` unless they are deliberately replaced with canonical browser assertions.
- Suggested message: `Feat,Fix,Refact: establish the Bastion Field Rig UI and frontend QOL,fix combat saves economy travel and safe rendering,refactor vanilla game state and interaction flows`.

## Next actions

1. Resume the live browser loop and re-verify the compact sidebar/modal repairs when local-preview access is available.
2. Visually playtest the complete Bastion -> Ash Plains loop on desktop, tablet, and 375px mobile.
3. Repair issues found in the keyboard, touch, inventory, map, settings, save, combat, flee, and death walkthroughs.
4. Remove obsolete legacy CSS and turn the exploratory browser scripts into one canonical browser suite.
5. Freeze the frontend, record backend-dependent behavior, then begin the learning-first FastAPI phase.

## Open decisions and blockers

- Product direction is set: interactive turn-based narrative RPG with a vanilla frontend.
- Backend work is intentionally blocked until the frontend freeze gate is met.
- Browser automation policies blocked both localhost continuation and the isolated `file://` page. Brave successfully rendered the file directly, but the user was actively using another Brave tab, so extended automation stopped rather than taking over their playback. Successful observations and unverified areas remain separated below.

## Last validation

- JavaScript syntax (`data.js`, `game.js`, `ui.js`): passed.
- Deterministic engine assertions (`node tests/game-engine.test.mjs`): passed.
- Static frontend contract assertions (`node tests/frontend-contract.test.mjs`): passed.
- HTML structural validation (`tidy -errors -quiet frontend/index.html`): passed with expected empty Font Awesome element warnings only.
- Whitespace/error-marker validation (`git diff --check`): passed.
- Live 1280x720 browser: main menu, skippable intro, character naming/build selection, game start, expedition log, choices, HUD, and Stats modal reached successfully.
- Main-menu title repair: browser-computed overlap changed from `-39.6px` to an `18px` gap with no residual transform.
- Brave direct-file preview: menu artwork, field-record composition, local assets, and controls rendered; the screenshot exposed a legacy-transformed subtitle overlapping the title, which was removed afterward.
- Glow audit: the design-system layer now reserves glow for the Shimmer Seam/current-location signal and removes legacy glow from save actions, level-up rewards, new messages, floating numbers, and notification badges.
- Measured defects: desktop sidebar was `1063px` tall in a `720px` viewport and Stats content was `836px`; compact-height and bounded-modal repairs were applied after measurement but could not be re-opened after local access was disallowed.
- 1600px, 768px, 375px, inventory, map, settings, saves, merchant, combat, flee, and death browser paths: not completed; Phase 1 remains open.

See [Roadmap](ROADMAP.md) for phase gates and [Frontend Plan](FRONTEND_PLAN.md) for the repair list.
