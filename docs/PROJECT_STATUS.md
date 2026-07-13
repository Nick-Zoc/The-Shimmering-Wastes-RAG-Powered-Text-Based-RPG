# Project Status

Last updated: 2026-07-12
Current phase: Phase 1 - Vanilla frontend finalization
Overall health: broad desktop/tablet/mobile gameplay QA passed with live repairs; keyboard/touch, accessibility, flee/death, and canonical browser automation remain before frontend freeze

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
- [x] Chrome live QA completed onboarding, restore, stats, inventory, saves, map, settings, merchant purchase, Ash Plains travel, two encounters, rewards, loot, and responsive desktop/tablet/mobile layouts.
- [x] Live QA exposed and repaired the oversized inventory paper doll, unstructured combat hotbar, and post-combat hotbar visibility leak.

## Current truth

- `main` and local `origin/main` point to the same frontend batch commit (`a56acb5`).
- The working tree contains only the six live-QA repair/test/documentation files from this continuation; nothing is staged.
- `frontend/css/design-system.css` is the active visual override while the 3,000-line exploratory legacy stylesheet is reduced later.
- The deterministic Node test covers builds/derived HP, purchases, insufficient funds, save/load, guard/enemy turns, victory/rewards/loot, flee, death/recovery, autosave, and legacy-save normalization.
- `tests/frontend-contract.test.mjs` checks the HTML/JS/CSS integration contract without pretending to replace a browser suite.
- The root `test_browser.js` and `test-puppeteer/` remain exploratory user files and are not canonical tests.
- Backend Python files and requirements are commented placeholders only.
- There is no API, database, content ingestion, vector index, or model call.

## Commit scope

- Nothing is currently staged.
- Commit the six current files together: the three maintained plans/status files, `frontend/css/design-system.css`, `frontend/index.html`, and `tests/frontend-contract.test.mjs`.
- `test_browser.js` and `test-puppeteer/` are already part of `a56acb5`; replace or remove them only in a deliberate canonical-browser-test cleanup.
- Suggested message: `Fix,Test,Docs: repair inventory and responsive combat controls,add frontend regression contracts,record live browser QA evidence`.

## Next actions

1. Complete keyboard-only and touch-oriented walkthroughs, including tooltip alternatives and focus order.
2. Exercise healer, flee, death/recovery, corrupt-save, and delete-confirmation paths in the live browser.
3. Run automated accessibility and contrast checks at 375px, 768px, 1280px, and 1600px.
4. Remove obsolete legacy CSS and replace the exploratory browser scripts with one canonical browser suite.
5. Freeze the frontend, record backend-dependent behavior, then begin the learning-first FastAPI phase.

## Open decisions and blockers

- Product direction is set: interactive turn-based narrative RPG with a vanilla frontend.
- Backend work is intentionally blocked until the frontend freeze gate is met.
- Chrome successfully ran the localhost QA loop without touching the user's active Brave session. Its local-address safety control stopped only the final reload after the tablet hotbar changed from five columns to three; that last tablet adjustment is statically covered but still needs one rendered recheck.

## Last validation

- JavaScript syntax (`data.js`, `game.js`, `ui.js`): passed.
- Deterministic engine assertions (`node tests/game-engine.test.mjs`): passed.
- Static frontend contract assertions (`node tests/frontend-contract.test.mjs`): passed.
- HTML structural validation (`tidy -errors -quiet frontend/index.html`): passed with expected empty Font Awesome element warnings only.
- Whitespace/error-marker validation (`git diff --check`): passed.
- Live Chrome desktop: main menu, skippable intro, character naming/build selection, game start, expedition log, HUD, Stats, Inventory, Save/Load, Map, Settings, merchant purchase, travel, combat, rewards, loot, autosave, and restore reached successfully with no console errors.
- Main-menu title repair: browser-computed overlap changed from `-39.6px` to an `18px` gap with no residual transform.
- Brave direct-file preview: menu artwork, field-record composition, local assets, and controls rendered; the screenshot exposed a legacy-transformed subtitle overlapping the title, which was removed afterward.
- Glow audit: the design-system layer now reserves glow for the Shimmer Seam/current-location signal and removes legacy glow from save actions, level-up rewards, new messages, floating numbers, and notification badges.
- Desktop modal measurements: Stats fit at `835.6px` inside a `1013px` viewport; repaired Inventory fit its full `696px` body without scrolling at a `960px` viewport.
- Desktop combat hotbar rendered as five equal `48px`-high command buttons and returned to `display: none` after combat.
- Responsive Chrome checks: `390x844` mobile combat had no horizontal overflow and used five icon actions; mobile Inventory was a full-height scrollable sheet; `768x900` tablet had no horizontal overflow. The final three-column tablet hotbar refinement needs a rendered recheck.
- State verification: a Mana Vial purchase reduced coins from 30 to 15 and added Quick Use; Mana Bolt spent 8 MP, defeated the Ash Hound, granted 25 EXP, 7 coins, and Scrap Metal; autosave restored 37/45 MP, 25/100 EXP, 22 coins, location, inventory, and player identity.
- Not yet live-tested in this run: healer, keyboard-only navigation, touch tooltips, flee, death/recovery, corrupt-save/delete flows, automated accessibility/contrast, and exact 375px/1280px targets. Phase 1 remains open.

See [Roadmap](ROADMAP.md) for phase gates and [Frontend Plan](FRONTEND_PLAN.md) for the repair list.
