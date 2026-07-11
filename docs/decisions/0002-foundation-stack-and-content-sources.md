# ADR 0002: Foundation Stack and Content Sources

- Status: Accepted
- Date: 2026-07-11

## Context

The current client is a static global-script prototype, while the backend and content pipeline are placeholders. The project needs a maintainable stack that can deliver a portfolio vertical slice without introducing microservices or orchestration frameworks before the core boundaries are proven.

The original documents leave React versus vanilla JavaScript, database, vector store, framework, and content format unresolved.

## Decision

Adopt this initial modular-monolith foundation:

- Incrementally migrate the client to React, TypeScript, and Vite while preserving the current visual prototype as a reference.
- Use FastAPI and Pydantic for versioned HTTP contracts.
- Use PostgreSQL with pgvector for durable game data, metadata/full-text search, and vector retrieval in one service.
- Use direct async model-provider SDKs behind `IntentInterpreter`, `Embedder`, and `Narrator` interfaces.
- Do not add LangChain/LangGraph until a measured integration or orchestration need justifies it.
- Store mechanics/entities in validated YAML/JSON, lore/dialogue in validated Markdown, and assets as files referenced by a manifest.
- Publish immutable manifest-derived content versions and build disposable versioned retrieval indexes from them.

Specific embedding, intent, and narration models remain evaluation decisions. Their selections require quality/latency/cost evidence and a later ADR.

## Consequences

Positive:

- The client gains typed components without discarding the established art direction.
- State and vectors share PostgreSQL transactions, backups, metadata, and operational tooling.
- Content remains reviewable in Git and indexes remain reproducible artifacts.
- Thin provider interfaces allow experiments without placing provider objects in the domain engine.
- The first slice avoids a second vector service and an unneeded agent framework.

Costs:

- The frontend migration and PostgreSQL development environment require upfront setup.
- Content validation/ingestion must be implemented rather than relying on a PDF loader.
- Provider integrations need small project-owned adapters.

## Rejected alternatives

- **Continue expanding global vanilla scripts:** rejected because UI, state, rules, timers, and saves are already tightly coupled and difficult to test.
- **SQLite plus a separate local vector store for the server slice:** rejected to avoid an early persistence/retrieval migration; SQLite remains useful for isolated tests or throwaway experiments.
- **LangChain/Chroma as mandatory foundations:** rejected until their abstraction or orchestration value is demonstrated by a concrete requirement.
- **PDF or vector index as canonical content:** rejected because neither provides typed reviewable truth or safe version migrations.
