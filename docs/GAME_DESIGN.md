# Game Design

Status: canonical product and mechanics direction
Last updated: 2026-07-11

## Product definition

The Shimmering Wastes is an interactive, turn-based narrative RPG. It is not an idle game in the first release. The player makes explicit choices or enters optional free text; the world responds through deterministic mechanics and grounded AI narration.

The design goal is not an unrestricted chatbot. It is a real RPG whose AI layer makes authored systems feel reactive, contextual, and personal.

## Player fantasy

You are a Scrapper: part scavenger, part explorer, part survivor. You leave the safety of the Last Bastion to recover Old World technology and magical artifacts from a landscape broken by the Cataclysm. Every expedition trades safety for discovery. What you learn, whom you trust, and what you bring home changes which truths and routes become available.

## Core loop

```text
Prepare in the Last Bastion
-> choose an expedition goal and loadout
-> travel into a dangerous region
-> explore, investigate, negotiate, or fight
-> decide whether to push deeper or extract
-> return with loot, knowledge, wounds, and consequences
-> upgrade gear, abilities, relationships, and quests
-> unlock the next story layer
```

The meaningful decisions are risk, resource use, route, information, and commitment. More content should deepen those decisions rather than add disconnected menus.

## First portfolio vertical slice

The first complete demo should take roughly 10-15 minutes and prove the full architecture:

- Create a Scrapper and select one of the existing builds.
- Speak with Silas and/or Elara in the Last Bastion.
- Accept one concrete expedition goal.
- Travel to the Ash Plains.
- Resolve exploration through at least one non-combat and one combat event.
- Retrieve location/character/creature lore with visible developer provenance.
- Use free text once and explicit choices everywhere else.
- Return, sell or use loot, save, reload, and continue.
- Complete the same flow with the AI provider disabled, using deterministic narration templates.

Crystal Forest, the Colossus, dynamic quest generation, factions, companions, and long-term memory come after this slice is reliable.

## Canonical mechanics boundary

Mechanics live in three coordinated places:

1. Typed versioned rule/entity catalogs for tunable values.
2. Deterministic engine code for formulas and state transitions.
3. Tests and balance simulations for expected behavior.

Lore prose and model prompts can describe rules but are never the authority. A balance change updates the catalog and tests first.

Suggested content paths:

```text
content/worlds/shimmering_wastes/v1/rules/
  progression.yaml
  combat.yaml
  time.yaml
  economy.yaml
content/worlds/shimmering_wastes/v1/entities/
  builds.yaml
  abilities.yaml
  items.yaml
  creatures.yaml
  locations.yaml
```

## Game state model

The versioned game aggregate should include:

- Player identity, build, base attributes, level, EXP, and available upgrades.
- Current HP/MP plus authoritative base progression inputs; maximums are derived from the pinned build, level, attributes, equipment, and rules version. Any cached maximum is non-authoritative and rebuilt/validated on load.
- Equipment instances and inventory stacks.
- Currency and progression unlocks.
- Current location and expedition state.
- Day and time phase.
- Active encounter/combat state, round, statuses, and cooldowns.
- Quest state and authoritative stable IDs for discovered facts.
- Relationship/reputation values when introduced.
- World ID, immutable content/rules versions, state schema version, optimistic state version, and last committed turn ID.

Presentation state such as an open modal, tooltip, typewriter progress, or animation is not game state.

## Action model

All player input resolves to a typed command. Initial command families:

- `MOVE`
- `EXPLORE`
- `INVESTIGATE`
- `TALK`
- `BUY`
- `SELL`
- `USE_ITEM`
- `EQUIP`
- `UNEQUIP`
- `ATTACK`
- `DEFEND`
- `FLEE`
- `REST`
- `ACCEPT_QUEST`
- `TURN_IN_QUEST`

Every command has context requirements. The backend returns `action_options` with stable IDs, parameters, an `enabled` flag, and an optional disabled reason. The free-text interpreter receives only enabled action IDs. The backend revalidates the command even if the UI displayed it as enabled.

## Time rules

Use four phases: Morning, Afternoon, Evening, and Night.

- Travel, a meaningful exploration attempt, hunting, and other expedition activities normally consume one phase.
- Safe-zone conversation, inventory management, buying/selling, and inspecting stats do not consume a phase.
- Combat rounds do not advance world time individually.
- A top-level expedition activity consumes at most one phase. If travel/exploration immediately triggers combat, its time charge is deferred and applied once when that encounter resolves; combat does not add a second phase.
- Victory and escape apply that one deferred encounter cost. Death replaces it by advancing to the next Morning as part of recovery.
- Combat initiated independently from an otherwise free context consumes one phase when it resolves.
- Passing Night advances the day and applies only explicitly defined rest/camp effects.
- Time effects are domain events, not inferred from action name strings.

This resolves the contradiction in the original PDF between per-round time advancement and paused combat time.

## Combat direction

Combat is alternating-turn and event-driven:

```text
Encounter starts
-> player chooses an allowed ability/item/defend/flee command
-> engine resolves costs, hit, damage, statuses, and target state
-> enemy policy chooses and resolves its response if still active
-> cooldowns/status durations tick
-> next legal actions are returned
-> victory, escape, or death resolves the encounter and world-time cost
```

Initial combat supports:

- Physical and magical damage.
- Minimum-damage and resource-bound invariants.
- Critical hit and evasion based on explicit formulas.
- Defend and flee with testable effects.
- Ability MP costs and cooldowns.
- A small status-effect vocabulary.
- Seeded RNG recorded per turn.

Do not finalize formulas by copying the current browser implementation. It mixes build maximums, attributes, and equipment bonuses and mutates derived state. Define formulas in `combat.yaml`, implement them as pure functions, then run simulations before locking balance.

## Attributes and builds

Keep the four existing attributes:

- Strength: physical offense and a defined contribution to health/carrying capacity.
- Defense: damage mitigation and defensive ability scaling.
- Intelligence: magical offense, mana, and knowledge-oriented checks.
- Agility: initiative, evasion, critical chance, and flee checks.

Keep the five existing build concepts as starting distributions, not permanent classes:

- Bruiser
- Scout
- Scholar
- Vanguard
- Survivor

Every description must match implemented mechanics. For example, do not promise a Scholar EXP bonus until a tested modifier exists.

## Progression

- EXP thresholds come from versioned progression data.
- Level-up effects are explicit events.
- Stat points and automatic resource growth must not double-count the same increase.
- Equipment modifies derived totals without mutating base attributes. Derived maximum HP/MP is recalculated from authoritative inputs rather than stored as independent truth.
- Unequipping must reverse its exact contribution.
- Generated affixes are rolled only when an item instance is created as loot, never when it moves between slots.

Long-term progression should combine build expression, gear, abilities, relationships, and discovered knowledge rather than only larger numbers.

## Economy and inventory

- Currency cannot fall below zero.
- Buy/heal actions check affordability before any mutation.
- Sell price, stock, quantity, context, and inventory capacity are validated server-side.
- Item instances have stable IDs; stacks are used only for truly identical items.
- Equipment transfers preserve identity and affixes.
- Loot rolls and prices are deterministic for their recorded seed.
- Quest items cannot be sold or destroyed unless a quest explicitly permits it.

## Death and recovery

For the first slice:

- HP reaching zero ends the encounter immediately.
- The player wakes in the Last Bastion the next Morning.
- A defined percentage of carried, non-protected currency is lost.
- EXP is not lost unless later playtesting proves that penalty valuable.
- Quest-critical items and discovered lore are retained.
- The exact loss and recovery appear as domain events so narration cannot disagree.

## Exploration, quests, and story

Exploration should combine authored structure with controlled variation:

- Region encounter tables define eligible events and weights.
- Location, time, quest state, prior discoveries, and inventory filter eligibility.
- Quests are explicit state machines with prerequisites, stages, effects, and completion conditions.
- RAG supplies relevant descriptions, histories, voices, and clues.
- The model can vary narration and dialogue within known facts; it cannot silently create a canonical quest or permanent world fact.

Later, agentic quest proposals may enter an author review/validation pipeline. They must not directly write production rules or player state.

## NPC knowledge and memory

An NPC may speak only from facts allowed by:

- Their identity and role.
- Current location and time.
- Relationship/reputation threshold.
- Quest stage.
- Public versus secret knowledge tier.
- Facts the player has already revealed to them.

This makes RAG materially useful: Silas and Elara can answer the same topic differently without leaking hidden canon.

The game aggregate stores only authoritative discovered fact IDs. Searchable player-memory prose is a derived projection tied to those IDs, the game ID, and source turns; rebuilding it cannot change what the player officially knows.

## Content expansion order

1. Fully author Last Bastion and Ash Plains.
2. Add one complete quest arc and one secret/discovery branch.
3. Expand Crystal Forest with a new mechanic, not just stronger enemies.
4. Add factions and relationship consequences.
5. Add Colossus Crater and a complete ending.
6. Add alternate routes/endings only after the first campaign is coherent.

## Design validation

Before calling a mechanic complete, validate:

- State invariants with unit/property tests.
- Deterministic replay from seed and commands.
- A balance simulation across every build.
- Narrative/event agreement.
- No unreachable action or content ID.
- Save/load at every state-machine phase.
- AI-disabled playability.
- A short manual playtest with recorded friction notes.

Open balance values should remain marked as provisional in typed data; do not duplicate them across prose documents.
