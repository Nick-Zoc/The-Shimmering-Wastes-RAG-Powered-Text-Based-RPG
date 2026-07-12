# ADR 0003: Vanilla Frontend and Learning-First Scope

- Status: Accepted
- Date: 2026-07-11
- Supersedes: the React/TypeScript/Vite frontend decision in ADR 0002

## Context

The project owner is comfortable working directly with HTML, CSS, and JavaScript but is not currently comfortable maintaining React. The purpose of the project is to learn FastAPI, deterministic backend architecture, vector databases, retrieval, and AI integration after finishing a polished frontend—not to maximize production infrastructure.

The current frontend already has a playable vanilla implementation and a useful visual foundation, but it lacks a coherent design language and contains duplicated mechanics, inaccessible components, false save feedback, and responsive failures.

## Decision

- Keep the player-facing application in semantic HTML, modular vanilla JavaScript, and project-owned CSS.
- npm may be used for development tooling, tests, bundling, or small focused packages, but no frontend framework is required.
- Lightweight browser libraries may be added only when they solve a specific problem better than a small project-owned implementation. Their purpose and ownership boundary must be documented.
- Create and enforce a project-specific design system before adding more screens or decorative effects.
- Finish, test, and polish the complete frontend prototype before beginning the FastAPI/RAG implementation phase.
- Teach backend concepts through readable modules, short explanations, focused examples, and deliberately staged exercises. Avoid production-only complexity until it supports a learning objective or fixes a demonstrated problem.
- Keep ADR 0002's FastAPI/Pydantic, deterministic engine, versioned content, and provider-interface decisions. PostgreSQL/pgvector remains a target to evaluate while learning; a simpler local store may be used first when it makes the concepts easier to understand.

## Consequences

Positive:

- The owner can understand and maintain the frontend without first learning a framework.
- Existing work and assets can be improved instead of rewritten.
- UI component behavior remains visible in ordinary HTML, CSS, and JavaScript.
- Time is spent learning FastAPI and RAG rather than production frontend abstractions.
- A coherent design system can remove the current generic AI-generated appearance.

Costs:

- The project must enforce its own component conventions and module boundaries.
- Large global scripts need gradual refactoring to avoid another monolith.
- Accessibility, state rendering, and cleanup that frameworks often structure must be handled deliberately.

## Rejected alternatives

- **React migration now:** rejected because it adds a learning prerequisite unrelated to the project's main educational goal.
- **Leave the current UI as-is and start the backend:** rejected because the frontend has known correctness, usability, responsive, and visual-coherence problems.
- **No tooling or libraries at all:** rejected because focused tooling can improve testing, safety, and iteration without changing the programming model.
