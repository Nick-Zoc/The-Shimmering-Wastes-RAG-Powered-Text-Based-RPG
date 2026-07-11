# ADR 0001: Deterministic Backend Authority

- Status: Accepted
- Date: 2026-07-11

## Context

The original architecture proposed that an LLM retrieve enemy and world information, calculate outcomes, and emit state deltas for the backend to apply. The current static frontend independently calculates some outcomes while also replaying hard-coded numeric narratives. These two approaches already disagree about damage, rewards, time, and enemy state.

An RPG save must remain valid, replayable, testable, and resistant to prompt variation. LLM output is probabilistic and retrieved prose is not a safe source for exact rules.

## Decision

The backend deterministic game engine is the sole authority for:

- Legal actions and targets.
- Combat and RNG.
- Inventory, equipment, loot, and economy.
- Time, travel, progression, death, quests, and endings.
- Absolute persisted game state.

RAG retrieves narrative knowledge. The model may interpret optional player text into a whitelisted command and narrate an already-resolved outcome. Neither retrieval nor model output can directly change game state.

The game must complete turns with deterministic template narration when AI features are disabled or fail.

## Consequences

Positive:

- State and narrative can be tested against the same events.
- Saves can be versioned, replayed, migrated, and debugged.
- AI provider changes do not rewrite game rules.
- After command and state validation, model output cannot directly grant items or alter combat; the boundary reduces but does not eliminate prompt-injection risk.
- Explicit buttons and offline/degraded play remain possible.

Costs:

- Mechanics must be implemented and balanced in code/data instead of delegated to a prompt.
- The narrator requires richer structured events to produce varied prose.
- Free-text interpretation needs a constrained command schema and clarification path.

## Rejected alternatives

- **LLM as game master and physics engine:** rejected because state becomes nondeterministic and difficult to validate.
- **Frontend-authoritative rules:** rejected because clients are editable, saves are untrusted, and multi-device persistence becomes unsafe.
- **Rules stored only in RAG chunks:** rejected because approximate retrieval cannot guarantee the correct numeric rule is present.
