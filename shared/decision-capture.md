# Decision Capture

Append-only log of meaningful deck decisions. The presenter never runs a separate command — capture happens as a byproduct of skills that make choices. The log is the project's long-term memory: future sessions read it to understand *why* the deck is the way it is.

## The file

`design-system/decisions.md` — one file, grouped by topic, append-only.

Loaded automatically as Tier 0 alongside `brand.json` and `content-voice.md`.

## Format

```markdown
# Presentation Decisions

## Narrative & arc
- YYYY-MM-DD [/skill scope] Decision — one-line rationale

## Templates & layout
- YYYY-MM-DD [/skill scope] Decision — one-line rationale

## Typography & visual
- YYYY-MM-DD [/skill scope] Decision — one-line rationale

## Images & motion
- YYYY-MM-DD [/skill scope] Decision — one-line rationale

## Content & voice
- YYYY-MM-DD [/skill scope] Decision — one-line rationale

## Research & sourcing
- YYYY-MM-DD [/skill scope] Decision — one-line rationale

## Accessibility
- YYYY-MM-DD [/skill scope] Decision — one-line rationale
```

Rules:
- One line per decision. No multi-paragraph entries.
- `[/skill scope]` = the skill that made the decision and what it was working on. Examples: `[/arc lumen-pitch]`, `[/style-preview exec-update]`, `[/plan-deck series-b]`.
- Rationale is short (≤ 120 chars) — what tradeoff was made.
- Date is absolute (YYYY-MM-DD), never relative.
- Group under existing top-level headings. Don't invent new ones unless none fit.
- Newest entries at the **bottom** of each section (chronological, easy diff).

## When to capture

Only capture **decisions that future sessions need to know about.** Not every tiny choice — the meaningful ones that constrain future work.

| Skill | Capture when… |
|---|---|
| `/setup` | Recording the foundational brand, font, color, and voice choices on first run |
| `/brief` | Clarifying audience, single CTA, or scope that overrides an obvious default |
| `/outline` | Skipping an obvious slide (e.g. "no Team slide because audience knows us") |
| `/arc` | Choosing arc type when multiple could work ("SCQA over Narrative because decision-first audience") |
| `/style-preview` | Committing an aesthetic that rejects the obvious default ("chose editorial serif over clean sans to feel less SaaS-pitch-like") |
| `/plan-deck` | Picking a template for a slide when the obvious choice would fail (chose `quote` over `stat-callout` for slide 7 because the metric is contested) |
| `/image` | Choosing a provider or style preset that departs from brand default |
| `/motion` | Restricting transitions beyond the motion.json defaults (e.g. "no smart-animate for this deck — audience will watch remotely with bandwidth limits") |
| `/notes` | Adopting a timing strategy that deviates from even distribution |
| `/handoff` | User accepts an audit finding that creates a new rule ("going forward, all stats on yellow background") |

**Do NOT capture:**
- Token references that don't change the system
- Template instantiations
- Routine text edits or color nudges
- Anything trivially derivable from the deck files themselves
- Per-slide implementation details (those live in `plans/<deck>/slides/<nn>.json` or `tasks.md`)

## How to append

1. Read `design-system/decisions.md`. If it doesn't exist, create with the template headings above.
2. Find the right section heading (Narrative / Templates / Typography / Images / Content / Research / Accessibility). Use the existing section even if imperfect.
3. Append one line at the **bottom of that section** in the format above.
4. Do not delete or modify prior entries. The log is append-only.
5. Do not interrupt the user to confirm. Capture happens silently.

## How to read

Loaded as Tier 0 (see `shared/design-system-loading.md`).

Use it to:
- Avoid re-litigating decisions ("we already decided SCQA for internal decks")
- Apply established conventions to new work ("brand uses Fraunces serif per a prior decision")
- Cite prior context when proposing a change ("on 2026-04-10 we skipped the Team slide — this deck re-adds it because…")

## Tone

Write entries the way a thoughtful colleague would write a one-line note to their future self. Specific, sourced, uneditorialized.

- ✓ `2026-04-22 [/arc lumen-pitch] Picked Raskin Strategic Narrative — product-category-creation story, not feature-list audience`
- ✗ `2026-04-22 [/arc lumen-pitch] We made the right call picking Raskin because it works better for pitch decks in general`

The first is useful two months later. The second is noise.
