# The Shimmering Wastes

The Shimmering Wastes is an AI-assisted, turn-based narrative RPG set in a post-magical-apocalypse world. The player is a Scrapper who prepares in the Last Bastion, ventures into dangerous regions, survives deterministic combat, recovers artifacts, and uncovers a grounded story shaped by retrieved world lore.

The repository currently contains an actively polished static frontend prototype and historical concept documents. The backend, persistence layer, content pipeline, retrieval system, and model integration have not yet been implemented.

## Product direction

- The backend game engine is the only authority for combat, inventory, economy, time, quests, progression, and saves.
- RAG retrieves relevant canonical lore and player-discovered knowledge.
- The model may interpret optional free text and narrate outcomes, but it cannot invent or mutate game state.
- Explicit action buttons remain available, and the game must remain playable when the AI provider is unavailable.
- The first portfolio milestone is one short, reliable, retrieval-backed expedition from the Last Bastion into the Ash Plains.

## Current prototype

The static prototype includes a main menu, visual-novel intro, five character builds, HUD, exploration, merchant and healer interactions, inventory/equipment, versioned `localStorage` saves, settings, a field map, and a deterministic Ash Plains combat path. It does not call a backend or an AI service.

Run it locally:

```bash
cd frontend
python3 -m http.server 8003
```

Then open `http://127.0.0.1:8003`. Stop the server with `Ctrl+C` when finished.

For a zero-setup visual preview, the current prototype can also be opened directly as `frontend/index.html` (a `file://` URL). This path is useful for UI review and was verified in Brave; the local server remains the preferred path for canonical browser automation and future API work.

The current prototype requires network access for Bootstrap, Font Awesome, DOMPurify, and Google Fonts. Character portraits and narrative speaker sigils are project-local.

Run the current code checks from the repository root:

```bash
node --check frontend/js/data.js
node --check frontend/js/game.js
node --check frontend/js/ui.js
node tests/game-engine.test.mjs
node tests/frontend-contract.test.mjs
tidy -errors -quiet frontend/index.html
```

See [Project Status](docs/PROJECT_STATUS.md) and [Frontend Plan](docs/FRONTEND_PLAN.md) before extending the active frontend batch.

## Project documents

Read these in order:

1. [Project Status](docs/PROJECT_STATUS.md) - concise current truth and immediate next work.
2. [Roadmap](docs/ROADMAP.md) - phase checklists, gates, and notes.
3. [Architecture](docs/ARCHITECTURE.md) - target components and authoritative turn flow.
4. [Game Design](docs/GAME_DESIGN.md) - product loop and deterministic mechanics.
5. [Content and RAG](docs/CONTENT_AND_RAG.md) - lore sources, ingestion, retrieval, assets, and evaluation.
6. [Frontend Plan](docs/FRONTEND_PLAN.md) - stabilization, vanilla architecture, polish, and integration plan.
7. [Design System](docs/DESIGN_SYSTEM.md) - the Bastion Field Rig visual and interaction language.
8. [Agent Workflow](AGENTS.md) - rules for future implementation runs.

The two PDF files under `docs/` are original concept material. They are useful historical seeds, but they are no longer canonical because their mechanics, data, and AI authority model conflict with the current prototype and target architecture.

## Target stack

- Frontend: semantic HTML, modular vanilla JavaScript, and project-owned CSS, with npm used for focused tooling or small libraries when useful.
- API: FastAPI with Pydantic contracts.
- Game engine: pure deterministic Python domain logic with seeded RNG.
- Persistence and retrieval: PostgreSQL with pgvector.
- AI integration: a direct provider SDK behind small `IntentInterpreter`, `Embedder`, and `Narrator` interfaces.
- Quality: unit, contract, integration, browser, accessibility, retrieval, grounding, latency, and cost tests.

See [Architecture](docs/ARCHITECTURE.md) and [ADR 0003](docs/decisions/0003-vanilla-frontend-and-learning-first-scope.md) for the rationale.

## License and assets

Source code is licensed under [Apache License 2.0](LICENSE). External/generated asset attribution and usage rights are still being cataloged; do not treat every current image/audio file as cleared for redistribution until the asset manifest is complete.
