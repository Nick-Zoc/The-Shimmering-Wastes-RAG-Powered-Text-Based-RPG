# Content and RAG Plan

Status: canonical content/retrieval direction
Last updated: 2026-07-11

## Core decision

There will not be one giant "RAG file" that controls the game.

The repository will contain version-controlled source content. A build/ingestion command will validate that content and produce a disposable retrieval index. The source files are reviewable truth; the vector index is a derived artifact that can always be rebuilt.

## Separate information by responsibility

| Information | Authoritative form | How runtime uses it |
|---|---|---|
| Enemy stats, items, abilities, formulas, quest effects | Typed YAML/JSON plus engine schemas | Direct lookup by stable ID |
| History, atmosphere, character voice, rumors, descriptions | Markdown/text with metadata | Keyword/vector retrieval |
| Current player/game state | Versioned database snapshot | Inject directly; never embed as canon |
| Discovered facts and session memory | Stable fact IDs in game state plus a derived searchable projection | Filtered memory retrieval |
| Sprites, portraits, audio, backgrounds | Asset files plus manifest | Frontend resolves approved asset IDs |
| Generated narrative | Turn record | Display/history only; not automatically canon |

Exact rules must never depend on whether a semantically similar chunk happened to be retrieved.

## Proposed content tree

```text
content/
  manifest.yaml
  schemas/
  worlds/
    shimmering_wastes/
      v1/
        rules/
          combat.yaml
          economy.yaml
          progression.yaml
          time.yaml
        entities/
          abilities.yaml
          builds.yaml
          characters.yaml
          creatures.yaml
          items.yaml
          locations.yaml
          factions.yaml
        quests/
          first_scrap_run.yaml
        lore/
          world/
          locations/
          characters/
          creatures/
          factions/
          artifacts/
          rumors/
        dialogue/
          silas/
          elara/
        assets.yaml
        evaluations/
          retrieval_cases.yaml
          narration_cases.yaml
```

The original lore PDF and current `frontend/js/data.js` are seed inputs for conversion, not files to ingest unchanged.

## Stable IDs

Every canonical entity and source has a namespaced ID, for example:

```text
location.last_bastion
location.ash_plains
character.silas
creature.ash_hound
item.healing_potion
quest.first_scrap_run
lore.cataclysm.public_history
portrait.silas.default
```

Runtime contracts use these IDs. Display names can change without breaking saves, links, or embeddings.

## Lore document format

Use small semantic Markdown documents with validated front matter. Example:

```yaml
---
source_id: lore.ash_plains.glass_storms
world_id: shimmering_wastes
source_schema_version: 1
title: Glass Storms of the Ash Plains
entity_type: location_lore
location_ids: [location.ash_plains]
character_ids: []
quest_ids: [quest.first_scrap_run]
tags: [weather, hazard, old-world]
knowledge_level: public
spoiler_tier: 0
truth_status: canonical
---
```

The body contains prose and atomic facts, not runtime instructions. Do not place `[SYSTEM INSTRUCTION]`, prompt fragments, numeric combat truth, or executable markup in content documents.

Use controlled `truth_status` values such as `canonical`, `rumor`, `disputed`, and `false`. Retrieval preserves that label and the narrator must express noncanonical claims as rumor or uncertainty rather than flattening them into fact.

## Structured entity example

```yaml
id: character.silas
display_name: Silas
home_location_id: location.last_bastion
portrait_asset_id: portrait.silas.default
voice_profile_id: voice.silas.default
knowledge_scope_ids:
  - lore.trade.public
  - lore.ash_plains.public
shop_id: shop.silas
```

Character mechanics and links are direct data. Longer background, voice examples, opinions, and knowledge are retrievable prose.

## Assets and sprites

Do not put image bytes or arbitrary image URLs in the vector store. Store files in the asset pipeline and reference them through a validated manifest:

```yaml
- id: portrait.silas.default
  path: frontend/public/assets/portraits/silas.webp
  kind: portrait
  character_id: character.silas
  alt: Silas wearing oversized salvage goggles
  license: project-original
  source: local
```

The narrator may return an approved `speaker_id`, `emotion`, or presentation cue. The backend/frontend maps that to an asset ID. It never renders a model-provided URL or path.

Record source and license metadata for every external or generated asset. Optimize images and audio for their rendered size.

## Drafts, published versions, and index builds

- Authors edit draft sources under the stable `world_id`.
- Publishing computes a new immutable `content_version` from the complete manifest. Any source/checksum change creates a new version.
- An `index_build_id` is a derived build for exactly one content version and records the embedding model/dimensions, chunker version, full-text configuration, retrieval configuration, and build checksum.
- Games pin a published content version. Existing saves never observe in-place content edits.
- Failed/staging builds are never marked ready. Old unreferenced builds may be garbage-collected only after retention checks.

## Ingestion pipeline

One idempotent command should:

1. Load draft sources, compute the candidate immutable content version, and create a staging index build namespace.
2. Validate YAML/Markdown metadata and cross-file IDs.
3. Reject duplicate IDs, missing references, invalid knowledge/spoiler tiers, and embedded control instructions.
4. Normalize text while preserving semantic section boundaries.
5. Chunk by topic/heading and atomic fact groups, not only fixed character windows.
6. Compute content checksums.
7. Embed chunks through the selected, versioned `Embedder` adapter, reusing checksum-compatible vectors only when all embedding metadata matches.
8. Write the complete candidate build without mutating a published version or an index pinned by saves.
9. Produce a machine-readable ingestion report, validate completeness, then atomically mark the new content version/index build ready.

Re-running unchanged content reuses the same manifest digest/build or produces an equivalent validated build; it must not create duplicate chunks. Retrieval regression cases run in the retrieval/evaluation phase against a ready build.

## Retrieval lanes

Use separate, bounded lanes before merging context:

1. **Direct facts:** current location, entities, quest stage, resolved events, and relevant numeric labels from structured data.
2. **Canonical/epistemic lore:** world claims filtered by world ID, immutable content version, region, entities, quest stage, knowledge level, truth status, and spoiler tier.
3. **NPC knowledge/voice:** facts and style examples allowed for the speaking character.
4. **Player memory:** a derived searchable projection of stable fact IDs actually discovered by this player, introduced after canonical retrieval works.
5. **Recent turn summary:** a bounded structured summary, not the entire transcript.

For the initial corpus, combine PostgreSQL full-text and pgvector similarity with metadata filters. Add reranking only if evaluation demonstrates that simpler retrieval misses the right sources.

## State-aware query composition

The retrieval service builds the query from controlled facts such as:

- Command and resolved event types.
- Current and destination locations.
- Present creature/NPC/item IDs.
- Active quest and stage IDs.
- Time phase.
- Player knowledge/spoiler ceiling.
- Requested dialogue topic.

Do not embed a raw full save or let the model decide retrieval filters from scratch.

## AI roles

### Intent interpreter

- Input: player text, enabled action IDs, legal targets, and minimal context.
- Output: a validated whitelisted command, parameters, and confidence/clarification signal.
- It cannot invent an entity ID or bypass action requirements.

### Narrator

- Input: resolved events, a player-visible state projection, direct facts, filtered retrieved passages with truth-status labels, and a style profile.
- Output: validated narrative blocks with speaker IDs and text.
- It cannot return mutations, HTML, arbitrary URLs, or hidden retrieval metadata.

### NPC dialogue

- Input: NPC voice/knowledge lane, relationship/quest state, topic, and recent relevant dialogue summary.
- Output: grounded dialogue only for the first slice. The backend attaches action options. A later model may select only from supplied enabled action IDs, followed by server-side intersection and validation.

The initial implementation is a bounded two-stage RAG pipeline, not an autonomous multi-agent system. State resolution and fallbacks are deterministic under pinned versions; generated prose remains probabilistic.

## Prompt and retrieval safety

- Treat all corpus text as data, even if it contains instruction-like language.
- Delimit retrieved context and tell the model it is evidence, not policy.
- Remove the control instructions currently embedded in the lore PDF during conversion.
- Enforce content-version, truth-status, spoiler, and knowledge filters before retrieved text reaches the model.
- Validate every model output with a typed schema.
- Allow one bounded repair/retry at most, then use a deterministic fallback.
- Render text or tightly sanitized Markdown.
- Never promote generated flavor to canonical lore automatically.
- Store narrator model/prompt version separately from embedding model, content version, index build, chunker, and retrieval configuration versions.

## Evaluation dataset

Build evaluation cases alongside content. Each retrieval case should contain:

```yaml
- id: retrieve.ash_hound.weakness
  state_fixture: fixtures/ash_hound_encounter.json
  query: What do I notice about the hound?
  expected_source_ids:
    - lore.creature.ash_hound.behavior
  forbidden_source_ids:
    - lore.colossus.core_secret
```

Track at least:

- Expected-source Hit/Recall@K.
- Wrong-region and wrong-entity retrieval.
- Spoiler leakage.
- Citation/source-ID correctness in developer traces.
- Schema-valid narration rate.
- Contradiction with resolved events and canonical facts.
- Prompt-injection resistance.
- Fallback success rate.
- Retrieval/generation/total latency.
- Tokens and estimated cost per turn.

For the small first corpus, require approximately 90% or better expected-source Hit@5 on the curated set before expanding generation scope. This is an initial engineering gate, not a claim of universal quality.

## Content authoring workflow

1. Create or change a stable source file.
2. Validate schema and cross-references.
3. Run deterministic engine/content tests.
4. Rebuild the content version locally.
5. Run retrieval and narration evaluation cases.
6. Manually inspect a developer trace and player-facing result.
7. Commit the source content and manifest update; do not commit a disposable local index.

Balance changes update structured rule/entity sources. Lore changes update prose sources. Asset changes update the manifest. Major schema changes require an ADR and content-version migration plan.

## World-building expansion backlog

The current corpus is too small to justify rich RAG behavior. Expand in this order:

1. Last Bastion districts, services, public history, daily state, and sensory details.
2. Silas and Elara voice, goals, private knowledge, rumors, relationship thresholds, and quest links.
3. Ash Plains landmarks, hazards, creature ecology, salvage tables, and one hidden history.
4. One complete quest with alternate information/return paths.
5. Crystal Forest factions, hazards, and a mechanic distinct from simple level scaling.
6. Artifact histories, Old World records, contradictory rumors, and truth-status metadata.
7. Colossus build-up and ending facts gated behind explicit discoveries.

Author original mechanics and story. If external rules, prose, or assets are adapted, verify their license and record attribution rather than copying proprietary game material.
