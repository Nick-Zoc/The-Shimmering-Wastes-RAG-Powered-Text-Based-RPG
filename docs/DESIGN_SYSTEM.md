# The Shimmering Wastes Design System

Status: canonical frontend visual and interaction language
Last updated: 2026-07-11

## Design thesis: Bastion Field Rig

The interface is a field instrument assembled in the Last Bastion: soot-dark metal, repaired plates, bone-colored records, oxidized brass labels, ember warnings, and a controlled seam of unstable teal magic. It should feel used, legible, and specific to a Scrapper—not like a generic fantasy dashboard or neon AI template.

Audience: players who enjoy atmospheric text RPGs and need to read, decide, and understand consequences without fighting the interface.

Primary job: keep the narrative and next meaningful action obvious while making game state readable at a glance.

## Signature element: the Shimmer Seam

A narrow vertical energy seam divides the field rig from the expedition log. It is the one expressive visual device used across the application.

- Calm exploration: low teal glow and slow drift.
- Combat: ember-teal pulse with a sharper rhythm.
- Critical health: broken red segments.
- Region transitions: the seam briefly widens like a magical fracture.
- Reduced motion: a static colored line with no pulse.

Do not add unrelated glow rings, floating gradients, or animated ornaments. Spend visual boldness on the seam and keep surrounding surfaces disciplined.

## Palette

| Token | Value | Purpose |
|---|---:|---|
| Ash black | `#090B0D` | Page and void background |
| Forge slate | `#151A1E` | Primary metal surface |
| Raised iron | `#20272C` | Interactive and raised surfaces |
| Bone paper | `#D8D2C2` | Primary text and record surfaces |
| Shimmer teal | `#72E3CC` | Magic, focus, active state |
| Relic brass | `#B99A52` | Level, currency, historical labels |
| Ember | `#D56A3A` | Danger, travel, attack emphasis |
| Blood signal | `#C84B5A` | Health danger and destructive action |

Rules:

- Teal is an information signal, not a background wash.
- Brass indicates value, age, and rank—not every heading.
- Ember marks risk or physical force.
- Purple gradients, pure-white cards, and rainbow rarity glows are outside the language.
- Body text uses bone paper at accessible contrast; muted text must remain readable.

## Typography

- Display and major location names: `Unbounded`, used sparingly and never for paragraphs.
- Interface and narrative body: `Barlow Condensed`, with comfortable line height and normal case.
- Measurements, shortcuts, turns, IDs, and small status labels: `IBM Plex Mono`.

Fallbacks must preserve role:

```css
--font-display: "Unbounded", "Arial Narrow", sans-serif;
--font-body: "Barlow Condensed", "Arial Narrow", sans-serif;
--font-data: "IBM Plex Mono", "SFMono-Regular", monospace;
```

Avoid excessive all-caps. Use it only for short instrument labels, warnings, and location classifications. Narrative prose remains sentence case.

## Shape and surface language

- Default radius: `2px`; large overlays may use `6px`.
- Primary panels use clipped or notched corners, not uniformly rounded cards.
- Borders are thin iron/brass rules with one emphasized edge.
- Shadows imply depth below metal plates; glows indicate magic/state only.
- Texture comes from subtle scanlines, ash grain, and repaired seams—not noise over every surface.
- Spacing follows a `4, 8, 12, 16, 24, 32, 48` scale.

## Layout

Desktop:

```text
┌──────────── Field rig ────────────┬─ Expedition log ────────────────────────┐
│ identity and build               ║ location / phase / utility              │
│ vital instruments                ║ encounter strip when relevant           │
│ attributes and resources         ║ narrative record                        │
│ navigation                       ║ action deck and command line             │
└───────────────────────────────────┴──────────────────────────────────────────┘
                                    ↑ Shimmer Seam
```

Tablet:

- Field rig becomes a drawer.
- A compact status strip retains HP, MP, level, time, and currency.
- Narrative remains the largest region.

Mobile:

- Status strip at top, narrative in the center, sticky action area at bottom.
- Inventory/stats/map/settings use full-height sheets.
- No horizontal scrolling and no fixed desktop sidebar consuming the viewport.

## Component rules

### Main menu

- Use an asymmetrical left-aligned title block over the existing Wastes art.
- Present one primary action and one quieter secondary action.
- Include a small field-record label such as `BASTION ARCHIVE // EXPEDITION 01` only when it conveys game context.
- Do not center every element or surround buttons with decorative glow boxes.

### Field rig/sidebar

- Resource bars resemble instruments: label, exact value, and a restrained fill.
- Related information shares a plate instead of becoming separate floating cards.
- Navigation uses text plus a consistent 20px icon; selected state is a left-edge signal.
- Player identity reflects the selected build and name.

### Expedition log

- Narrator entries use a slim left rule and speaker sigil, not chat bubbles.
- Player entries use a stamped, right-aligned command record.
- Long prose uses a readable measure and line height.
- Numeric outcomes are event callouts, visually separate from narrative flavor.

### Action deck

- Choices are command strips, not equal generic cards.
- Each shows a shortcut, verb-first label, and optional cost/risk.
- Primary/available actions are clear; disabled actions explain why.
- Combat abilities show cost and cooldown without requiring hover.

### Modals and sheets

- Use a shared header, content rhythm, close control, and footer pattern.
- Desktop modals remain focused; mobile versions become full-height sheets.
- Destructive actions are visually distinct and require confirmation.

### Toasts and feedback

- State the result in the same terms as the triggering action.
- Success is quiet; warnings and failures carry more visual weight.
- Autosave feedback appears only after a real successful write.

## Motion

- One orchestrated entry sequence is allowed on the main menu.
- Region transitions and combat impacts may use short purposeful motion.
- Routine hover motion stays under `160ms`; state changes under `260ms`.
- Typewriter text must be skippable and speed-adjustable.
- Honor `prefers-reduced-motion` and the in-game reduced-motion setting.
- Ambient particles stop when the page is hidden.

## Interaction and accessibility floor

- Every interactive surface is a real button, input, link, or semantic control.
- Visible `:focus-visible` styling uses the shimmer-teal signal plus a dark offset.
- All icon-only controls have accessible names.
- Narrative updates and important combat results use appropriate live regions.
- Resource bars expose progress semantics and numeric values.
- Hover information also works with focus and touch.
- Minimum target size is 44px on touch layouts.
- Color never carries the only meaning.

## Copy voice

- Interface copy is direct and useful: `Continue`, `Save game`, `Return to Bastion`.
- World flavor belongs in narrative, location labels, and concise instrument language.
- Avoid vague labels such as `Submit`, `Things`, or unexplained icons.
- Empty and error states explain what happened and the next available action.

## Anti-slop checklist

Before accepting a component, remove or revise it if it has:

- A large rounded card for information that could share an existing surface.
- A glow that does not communicate magic, focus, or state.
- A purple/blue gradient used only to make the UI feel futuristic.
- Multiple decorative badges saying the same thing.
- Centered layout without a content reason.
- Placeholder features presented as working controls.
- Inconsistent capitalization, icon size, corner radius, or spacing.
- Animation that competes with reading.
- Copy that sounds like generated marketing instead of an in-world tool.

## Implementation ownership

- `frontend/css/design-system.css`: tokens, layout primitives, shared components, responsive and accessibility rules.
- `frontend/css/style.css`: legacy styles during cleanup; new components must not add new design tokens here.
- `frontend/index.html`: semantic structure and component hooks.
- `frontend/js/ui.js`: presentation behavior and accessibility state.
- `frontend/js/game.js`: temporary local game rules until the backend replaces them.

When a new visual pattern is required, add it here before introducing a one-off component variation.
