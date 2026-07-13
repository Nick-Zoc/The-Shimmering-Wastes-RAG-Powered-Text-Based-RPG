# Frontend Plan

Status: active area plan
Last updated: 2026-07-12

## Outcome

Finish a polished, intuitive, full-featured frontend prototype in semantic HTML, modular vanilla JavaScript, and project-owned CSS before beginning FastAPI/RAG implementation.

The frontend should be excellent enough to serve as the permanent visual client and simple enough for the project owner to understand, extend, and debug without learning a framework first.

The canonical visual language is [The Shimmering Wastes Design System](DESIGN_SYSTEM.md).

## Frontend principles

1. Keep HTML, CSS, and JavaScript visible and understandable.
2. Use npm for testing/tooling or focused libraries, not as an excuse to introduce framework complexity.
3. Keep one local rules path until FastAPI becomes authoritative.
4. Separate data, local game state, and UI behavior instead of adding more global cross-calls.
5. Render player/model text safely.
6. Every visible control must work, explain why it is unavailable, or be removed.
7. Desktop polish cannot come at the cost of mobile, keyboard, reduced-motion, or readable prose.
8. Add features only when they improve the prepare -> explore -> fight -> return loop.

## Current strengths to preserve

- Strong post-magical-apocalypse subject and pixel-art menu background.
- Main menu -> visual-novel intro -> character creation onboarding.
- Five build concepts with useful visual portraits.
- Narrative log plus explicit choices and optional free text.
- HUD resources, time cycle, particles, region transitions, inventory, save slots, and combat feedback concepts.
- Last Bastion, merchant, healer, and Ash Plains as a useful playable slice.

## Problems to remove

- Generic neon-card visual language, excessive glow, inconsistent radii, and scattered one-off styles.
- Desktop-only fixed sidebar and unusable 375px layout.
- Competing scripted and dynamic combat systems.
- Inert/unstyled ability hotbar and mismatched VFX class names.
- False autosave feedback and broken main-menu load layering.
- Derived-stat reads that mutate/inflate HP and MP.
- Equipment transfers that can reroll affixes.
- Reward field mismatches and missing loot in the dynamic path.
- Travel/region state that can contradict narration.
- Purchases/healing that can create negative currency.
- Player/model input rendered through unsafe HTML.
- Mouse-only build, inventory, equipment, and quick-use controls.
- Player name/build not reflected consistently.
- Save state without schema normalization or coherent combat restoration.
- Placeholder Party/Map/Settings controls presented like finished features.
- Runtime DiceBear avatars and multiple CDN dependencies without clear ownership.

## Target vanilla structure

The current files may be split gradually after behavior is stable:

```text
frontend/
  index.html
  css/
    design-system.css
    style.css              # legacy styles reduced over time
  js/
    data.js                # temporary catalogs and authored scenes
    game.js                # temporary local deterministic engine
    ui.js                  # rendering and interaction behavior
    preferences.js         # later: user settings
    storage.js             # later: versioned local saves
    app.js                 # later: boot and coordination
  img/
  audio/
```

Do not split files merely to appear architectural. Extract a module when it has a clear responsibility, public API, and testable behavior.

## F0 - Correctness and trust

Goal: make the current loop truthful and coherent before visual expansion.

- [x] Choose the dynamic ability resolver as the single combat path and remove scripted numeric combat updates.
- [x] Fix ability invocation, cooldowns, guard, flee, victory rewards, loot, and enemy-specific narration.
- [x] Make derived stats pure and equipment transfers identity-preserving.
- [x] Validate affordability, inventory, travel, and region transitions.
- [x] Implement real debounced autosave and a usable load/continue path.
- [x] Normalize old local saves with a schema version.
- [x] Sanitize authored narrative HTML and render player/model text safely.
- [x] Reflect player name, build, and portrait consistently.
- [ ] Replace duplicate exploratory scripts with meaningful assertions.

Exit gate: Last Bastion -> merchant/healer -> Ash Plains -> victory/flee/death -> save/reload has no state/narrative contradiction.

## F1 - Bastion Field Rig redesign

Goal: replace the generic AI-generated appearance with the canonical design language.

- [x] Add centralized tokens and component primitives in `design-system.css`.
- [x] Redesign the main menu around an asymmetrical expedition-record composition.
- [x] Rebuild the sidebar as a coherent field rig rather than stacked cards.
- [x] Rework narrative messages into an expedition log with speaker sigils.
- [x] Rework choices and combat abilities into command strips/action deck.
- [x] Restyle stats, inventory, save, map, and settings through one modal/sheet pattern.
- [ ] Remove obsolete selectors, undefined tokens, inconsistent utilities, and decorative effects that do not communicate state.
- [x] Replace runtime-generated NPC avatars with project-owned sigils/assets.

Exit gate: all core screens look like one authored product and use the documented tokens/component patterns.

## F2 - Responsive and accessible shell

Goal: make the game comfortable on desktop, tablet, mobile, keyboard, and touch.

- [ ] Desktop two-column layout with readable narrative measure.
- [ ] Tablet field-rig drawer and compact status strip.
- [ ] Mobile stacked log with sticky action area and full-height sheets.
- [x] Semantic buttons for builds, items, equipment, quick use, and choices.
- [x] Labels, visible focus, live regions, and progress semantics.
- [ ] Keyboard and touch alternatives for every hover tooltip.
- [ ] Minimum touch target and contrast checks.
- [ ] No horizontal clipping at 375px, 768px, 1280px, and 1600px.

Exit gate: onboarding, exploration, combat, inventory, and save/load work at the four target widths and with keyboard-only navigation.

## F3 - QOL and complete frontend features

Goal: remove friction without overwhelming the player.

- [x] Settings: music, text size, typewriter speed/skip, reduced motion, and preference persistence.
- [x] Map: discovered regions, recommended level, current location, and locked-state explanation.
- [x] Save management: autosave, manual slots, timestamps, player/build identity, delete confirmation, and corrupt-save recovery.
- [ ] Narrative controls: skip typing, scroll-to-latest, and clear distinction between flavor and numeric outcomes.
- [ ] Action help: visible shortcuts, disabled reasons, costs/cooldowns, and input examples only when needed.
- [ ] Inventory: equipment comparison, consumable use confirmation where destructive, and clear empty states.
- [x] Combat: turn state, target status, cooldown visibility, damage feedback, guard/flee clarity, and reduced-motion variants.
- [ ] Connection/AI placeholders: honest offline/local-prototype states rather than fake backend feedback.

Exit gate: every visible navigation control has finished behavior and the main loop can be played without developer knowledge.

## F4 - Polish and verification

Goal: reach the frontend freeze before backend learning begins.

- [ ] Browser tests for new game, each build, merchant, healer, combat, death, save/load, settings, and mobile drawer.
- [ ] Accessibility scan and keyboard walkthrough.
- [ ] Visual snapshots at desktop/tablet/mobile.
- [ ] Asset size and runtime dependency review.
- [ ] Remove dead mock scenarios, duplicate CSS, console noise, broken placeholders, and unused assets.
- [ ] Playtest for pacing, choice clarity, narrative readability, and accidental information overload.
- [ ] Record remaining backend-dependent behavior explicitly.

Exit gate: frontend critical tests pass, manual checks are recorded, no visible control is knowingly fake, and the UI is frozen for the first FastAPI integration.

Validation note, 2026-07-12:

- Live Chrome QA reached menu, intro, character creation, HUD/log/actions, Stats, Inventory, Save/Load, Map, Settings, merchant purchase, travel, two encounters, rewards/loot, autosave, and restore.
- The inventory loadout was compacted after its oversized paper doll hid carried items; the action hotbar was rebuilt as a responsive command grid and now hides outside combat.
- Desktop and `390x844` mobile renders passed without horizontal overflow. The first `768x900` render exposed truncated five-column labels, so tablet changed to three columns; browser safety stopped the reload before that final refinement could be rendered again.
- Settings persistence was verified with instant narration and reduced motion. Remaining manual scope is healer, keyboard/touch, flee, death, corrupt/delete save flows, exact target-width snapshots, and accessibility/contrast automation.

## Backend handoff after frontend freeze

The vanilla client will later consume a small game-service boundary:

- `createGame()`
- `getGame()`
- `submitTurn()`
- `listTurns()`
- `save/continue` through the backend

Until then, `game.js` implements the same concepts locally for learning and playtesting. When FastAPI arrives, rules move behind the API without requiring a visual rewrite.

## Testing direction

npm may be introduced for:

- A small unit runner for pure JavaScript mechanics/storage helpers.
- Browser automation for complete flows.
- Accessibility checks.
- Formatting/linting only when it produces actionable feedback.

Tests must make assertions and manage their own server lifecycle. The current duplicate Puppeteer scripts are not a test suite.

## Completion rule

A frontend feature is complete only when it is reachable, visually consistent, keyboard/touch usable, truthful about state, covered by a meaningful check, and reflected in `PROJECT_STATUS.md`.
