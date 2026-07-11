# Frontend Plan

Status: active area plan
Last updated: 2026-07-11

## Outcome

Preserve the current visual identity and useful interaction concepts, but replace the mutable, timer-driven browser game engine with a typed client that renders authoritative snapshots and events from a deterministic game service.

Target stack: React, TypeScript, and Vite. Migration is incremental: first capture and stabilize the intended vertical slice, then port one screen/feature boundary at a time while reusing suitable CSS and assets.

## Current baseline

The current static frontend is visually promising and includes:

- Main menu, audio, visual-novel intro, and five character builds.
- Desktop HUD, time themes, particles, transitions, and narrative chat.
- Last Bastion, merchant, healer, and Ash Plains scripted flow.
- Stats, inventory, quick-use items, equipment ideas, and save-slot UI.
- Choice buttons plus optional free text.

It has no API calls. `frontend/js/data.js`, `game.js`, and `ui.js` own all state, rules, narrative, DOM mutation, and local saves.

## Release-blocking findings

The current uncommitted feature batch must not be treated as complete until these are resolved:

- Scripted numeric combat and a new dynamic ability engine run side by side.
- Ability buttons are unstyled and inert because the UI checks `window.GameEngine` while the engine is a top-level lexical binding.
- The new VFX code creates class names that have no matching CSS.
- Main-menu Load Game opens a Bootstrap modal behind the menu's higher z-index layer.
- The UI displays "Auto-saved" without writing a save.
- `getDerivedStats()` mutates and permanently inflates max HP/MP.
- Moving equipment can reroll an affix and create value from nothing.
- Dynamic combat reads `xpReward`/`coinsReward`, while data defines `expReward`/`coinReward`.
- Return/flee/explore narration can disagree with the stored region.
- Purchases and healing can drive currency below zero.
- Rust Beetle combat reuses Ash Hound-specific scripted narrative.
- Player/model text flows through `innerHTML`, creating a DOM injection boundary.
- Player name/build avatar are not reflected consistently in the HUD or save-slot/load presentation.
- A 375px viewport leaves only about 55px for the main game because the sidebar remains fixed at 320px.
- Build, inventory, equipment, and quick-use cards are mouse-only clickable `div`s.
- Save files have no schema version/migration and do not restore a coherent combat/narrative phase.
- Map, settings, party, Crystal Forest, Colossus, and much declared content are placeholders or unreachable.

The current strengths are worth preserving; these failures are reasons to establish state and contract boundaries before adding more features.

## Target client responsibilities

The frontend owns:

- Screen and panel state.
- Input drafts and local preferences.
- Pending, retry, conflict, reconnect, and fallback presentation.
- Animation and reduced-motion behavior.
- Rendering of player-visible snapshots, events, narrative blocks, action options, and approved assets.

The frontend does not own:

- Damage, loot, prices, legal actions, travel, time, quests, progression, or authoritative saves.
- Parsing narrative strings to infer mechanics.
- Trusting model HTML, URLs, asset paths, or action IDs.

## Target structure

```text
frontend/
  src/
    app/
      routes/
      providers/
    api/
      client/
      contracts/
    features/
      onboarding/
      game-shell/
      narrative/
      actions/
      combat/
      inventory/
      character/
      saves/
      settings/
    components/
    styles/
      tokens.css
      global.css
    assets/
    mocks/
      game-service.ts
      fixtures/
    test/
```

Use an explicit UI/game phase value such as:

```text
menu | intro | creating | exploring | resolving | combat_player |
combat_enemy | defeated | dead | disconnected
```

Timers animate a known phase; they do not secretly determine state transitions.

## Crosswalk to the project roadmap

- Project Phase 1 delivers Frontend F0-F1.
- Frontend F2 can proceed against mock contracts during Project Phases 2-3.
- Project Phases 4-6 build content, retrieval, and AI behind that contract.
- Project Phase 7 delivers Frontend F3-F4 and the end-to-end slice.
- Frontend F5 belongs to Project Phase 8 campaign expansion.

## F0 - Preserve and stabilize the prototype

Goal: establish a truthful reference before migration.

- [ ] Decide one combat behavior and remove/disable the competing path.
- [ ] Fix ability invocation/styles, VFX class mismatch, load layering, and false autosave feedback.
- [ ] Make derived calculations pure and repair reward/equipment/economy/travel invariants.
- [ ] Sanitize player/narrative rendering.
- [ ] Reflect player identity and build consistently.
- [ ] Add a version to any retained local save format.
- [ ] Replace the duplicate smoke scripts with assertions for the intended vertical slice.
- [ ] Capture desktop and mobile reference screenshots.
- [ ] Document which unfinished features are deliberately deferred.
- [ ] Preserve the inherited uncommitted batch on a dedicated branch, patch, or clearly labelled WIP commit before migration; do not discard it with checkout/reset/clean.

Exit gate: Last Bastion -> Ash Hound -> victory or death -> save/reload works without narrative/state disagreement, and automated smoke checks fail on regressions.

## F1 - Establish React, TypeScript, and Vite

Goal: introduce the long-term shell without a blind big-bang rewrite.

- [ ] Add the Vite/React/TypeScript toolchain and canonical scripts.
- [ ] Preserve the current static implementation on a temporary reference route or tagged commit.
- [ ] Port design tokens, fonts/assets, and global layout intentionally; remove duplicate/obsolete CSS.
- [ ] Port main menu, intro, and character creation first.
- [ ] Implement a contract-compatible mock `GameService`.
- [ ] Port the HUD/narrative/action shell from fixtures.
- [ ] Add error boundaries and loading/conflict/fallback states.

Exit gate: the same onboarding and first exploration screen render through typed components and fixtures, with no game-rule mutation in components.

## F2 - Contract-driven gameplay UI

Goal: render the deterministic game model cleanly.

- [ ] Generate or define types for `GameSnapshot`, `ActionOption`, `TurnEvent`, `NarrativeBlock`, and `TurnResult`.
- [ ] Implement action submission with request IDs and expected state versions.
- [ ] Render explicit choices, disabled reasons, free-text clarification, and retries.
- [ ] Render structured combat events through one action bar.
- [ ] Port stats, inventory, equipment, quick use, and character identity.
- [ ] Map speaker/entity/asset IDs through an approved local manifest.
- [ ] Keep mock fixtures equivalent to backend contracts.

Exit gate: all stateful screens can run against both fixtures and the same typed service interface used by the backend client.

## F3 - Responsive and accessible shell

Goal: make the game usable beyond a desktop screenshot.

- [ ] Desktop: retain the two-column HUD and narrative composition.
- [ ] Tablet: collapsible HUD drawer plus compact status strip.
- [ ] Mobile: stacked layout, sticky action composer, and bottom navigation for character/inventory/map/settings.
- [ ] Use semantic buttons for every interactive card.
- [ ] Add labels, focus management, visible focus, live regions, and progressbar semantics.
- [ ] Provide keyboard and touch alternatives to hover tooltips.
- [ ] Add reduced-motion mode, typewriter skip/speed, and persistent audio/text preferences.
- [ ] Correct contrast and minimum target sizes.
- [ ] Test at representative desktop, tablet, and mobile viewports.

Exit gate: onboarding, one full turn, combat, inventory, and save/reload pass keyboard and mobile browser checks with no horizontal clipping.

## F4 - Backend integration

Goal: replace mock authority with the real turn API.

- [ ] Create/load a game and persist the guest ownership token safely.
- [ ] Submit idempotent turns and handle `409` state conflicts.
- [ ] Rehydrate from an authoritative snapshot after reload/reconnect.
- [ ] Show request/narration progress and recover by idempotent retry; if a connection drops after mechanics commit, render the durable fallback/result returned for that turn rather than resubmitting mechanics.
- [ ] Support deterministic fallback narrative and provider-disabled mode.
- [ ] Add a developer-only turn trace for events and retrieved source IDs.
- [ ] Add end-to-end contract fixtures to CI.

Exit gate: a browser completes the portfolio vertical slice against a restarted backend and survives duplicate requests, reconnect, and model failure.

## F5 - Player-facing feature expansion

After the end-to-end slice is stable, prioritize:

1. Quest journal and codex/discoveries.
2. Map and discovered locations.
3. Complete settings and accessibility preferences.
4. Narrative history/search and source-safe recap.
5. Equipment comparison, sorting, and filtering.
6. Relationship/reputation display when backed by mechanics.
7. Crystal Forest content and its distinct gameplay mechanic.
8. Colossus encounter and ending flow.

Do not build party/companion UI, multiplayer, procedural world maps, or advanced agent dashboards until their backend mechanics exist.

## Testing strategy

### Unit/component

- Rendering for every game phase and event type.
- Action availability and disabled reasons.
- Safe text/Markdown rendering.
- Asset-ID fallback.
- Responsive navigation and preference reducers.

### Contract

- Frontend types/fixtures match generated OpenAPI schemas.
- Unknown event types fail visibly in development and degrade safely in production.
- Old snapshots invoke a defined migration/error path.

### Browser

- New game and every build.
- Merchant affordability and inventory update.
- Combat victory, flee, and death.
- Save/reload and reconnect.
- Free-text success, clarification, rejection, and provider fallback.
- Desktop/tablet/mobile layouts.
- Keyboard-only navigation and accessibility scan.
- Visual regression for core screens.

## Asset and performance plan

- Replace runtime DiceBear requests with approved local assets or an intentional cached asset service.
- Bundle dependencies instead of relying on runtime CDNs.
- Convert portraits/backgrounds to suitable modern formats and dimensions.
- Compress or stream the approximately 11 MB background music asset appropriately.
- Pause decorative animation when hidden and honor reduced motion.
- Establish initial budgets for bundle size, first render, turn UI response, and animation frame stability.

## Frontend completion rule

A visual feature is not complete when its markup exists. It is complete when it is reachable, keyboard/touch usable, driven by authoritative state or contract fixtures, covered by a meaningful check, and reflected in `PROJECT_STATUS.md`.
