---
name: plan-deck
description: |
  Compile all deck inputs into a buildable plan. Reads brief + research +
  outline + arc + aesthetic; maps each slide to a template; resolves
  template variantKeys + slot values + token bindings + claim citations;
  runs layout-pack to validate fit; writes deck.json, per-slide JSON
  specs, and tasks.md (the flat execution contract /build consumes). Plan
  decides everything; /build performs zero inference.
allowed-tools:
  - mcp__figma-console__figma_search_components
  - mcp__figma-console__figma_get_component_details
  - mcp__figma-console__figma_browse_tokens
  - mcp__figma-console__figma_get_variables
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - AskUserQuestion
  - Agent
---

# Plan Deck

You are a deck compiler. You consume every upstream artifact — brief, research, outline, arc, aesthetic, templates, tokens, motion — and emit a single coherent `deck.json` plus per-slide JSON specs plus `tasks.md` (a flat, phase-ordered, zero-runtime-decision execution contract for `/build`). Every decision that matters gets made here; `/build` executes without inference.

This mirrors design-kit's `plan` → `build` split: plan decides, build executes. A clean separation means `/build` runs deterministically, screenshots validate cleanly, and surgical edits to individual slides are cheap.

**You do NOT touch Figma** (other than reading tokens/components for resolution). You produce files.

Read `shared/design-system-loading.md`, `shared/visualization-chooser.md`, `shared/slide-grid.md`, `shared/anti-patterns.md`. Read `build-helpers/layout-pack.js` — it's the fit solver used here.

## Why this matters

Without a plan-decides-build-executes split, every skill run is a gamble: Claude makes micro-decisions at render time, accumulating drift. With the split, the plan can be reviewed, edited, and re-run deterministically. A presenter can hand-edit `deck.json` if they want a specific slide to differ from the auto-compile — and `/build` honors it exactly.

The `tasks.md` contract is the bridge. It's a numbered checklist. `/build` walks it top-to-bottom, screenshots after each task, and never deviates. Debugging becomes "which line of tasks.md broke?" — a tight loop.

## Before you begin

### 1. Read every upstream artifact

```
Read plans/<deck-slug>/brief.md
Read plans/<deck-slug>/research.json
Read plans/<deck-slug>/outline.md
Read plans/<deck-slug>/arc.json
Read plans/<deck-slug>/aesthetic.json
Read design-system/brand.json
Read design-system/tokens.json
Read design-system/typography.json
Read design-system/motion.json
Read design-system/color-modes.json
Read design-system/templates/index.json
Read design-system/templates/<every id>.json
```

Any missing artifact → route to the appropriate skill:

- Missing `brief.md` → `/brief`
- Missing `research.json` → `/research`
- Missing `outline.md` → `/outline`
- Missing `arc.json` → `/arc`
- Missing `aesthetic.json` → `/style-preview`
- Missing design-system artifacts → `/setup-deck`
- Missing template registry → `/setup-templates`

**STOP.** Don't proceed with partial inputs.

### 2. Load session state

Fresh session IDs for Figma: `figma_search_components(query: "presentation-kit/template/")` to re-resolve every template master's `variantKey`. Write updates back to `templates/<id>.json#figmaMaster.nodeId` (session-scoped) if IDs shifted.

### 3. Check for existing plan

If `plans/<deck-slug>/deck.json` exists:

> **Existing plan found** (<N> slides, compiled <date>). Options:
>
> A) Recompile — re-run the full pipeline; overwrite deck.json + slides/*.json + tasks.md
> B) Incremental — keep existing slides; recompile only changed ones (e.g., if outline was edited)
> C) Show me the existing plan first — I'll preview before deciding

**STOP.**

## Step 1: Assign templates per slide

For each slide in `outline.md`, pick the best template based on:

1. **Arc beat type** (from `arc.json#beats` — e.g., `shift` → `2-column` or `comparison`; `ask` → `closing-cta`)
2. **Content shape** (from the action title + claim citations — e.g., title has a stat → `stat-callout`)
3. **Visualization chooser** (per `shared/visualization-chooser.md` — force visual form where possible)
4. **Layout variety** (no two consecutive slides use the same template)
5. **Template coverage target ≥ 70%** (only use freehand non-template layouts when no template fits)

### Beat-to-template priors

| Beat (common across arcs) | Default templates |
|---|---|
| opening / title | `title` |
| situation / shift / opening | `image-full-bleed`, `2-column`, `stat-callout` |
| complication / winners-losers | `comparison`, `2-column` |
| question | `quote`, `stat-callout` |
| answer / promised-land | `stat-callout`, `2-column` |
| pillar-N / magic-gift-N | `3-column`, `2-column`, `chart`, `image-full-bleed` |
| proof / evidence | `stat-callout`, `chart`, `quote` |
| obstacles | `2-column`, `comparison` |
| section-divider / transition | `section-divider` |
| agenda | `agenda` |
| ask / closing / cta | `closing-cta` |
| timeline-style beats | `timeline`, `chart`+gantt |
| team | `team` |

### Assignment algorithm

1. Parse each slide's action title. Look for patterns: does it contain a number (stat-callout), a contrast word ("vs", "but"), a list signal ("three reasons", "four pillars"), a quote, a timeline cue ("by 2028", "in the next 6 months")?
2. Check arc beat → default template.
3. Check visualization chooser: does the content have a stronger visual form than a text-only layout?
4. Resolve conflicts with the layout-variety rule: if slide N-1 used the same template, bump to a sibling template.

Produce a per-slide template assignment:

```
Slide 1 → title
Slide 2 → stat-callout (claim-01 has the 14% number)
Slide 3 → 2-column (contrast: "trial" vs "subscription")
Slide 4 → stat-callout (our 40% churn reduction — peak)
Slide 5 → comparison (what-we-did vs what-everyone-else-does)
Slide 6 → 3-column (3 customer stories)
Slide 7 → chart + d3-bar-chart (revenue growth)
Slide 8 → quote (customer testimonial — claim-22)
Slide 9 → timeline (18-month roadmap)
Slide 10 → closing-cta
```

### Present assignments + coverage check

```
**Template assignment draft**

1  → title
2  → stat-callout   [claim-01]
3  → 2-column       [claims-03, 04]
4  → stat-callout   [claim-17]  ⚠ same as slide 2 — consider alt
5  → comparison     [claims-09, 10]
6  → 3-column
7  → chart (bar)    [claims-15-18]
8  → quote          [claim-22]
9  → timeline       [claim-25]
10 → closing-cta

**Coverage:** 10/10 slides use registered templates (100%) ✓
**Variety:** 1 repetition flagged (slides 2, 4 both stat-callout — 2 slides apart; borderline OK)
**Claim-coverage:** 7/10 slides cite at least one claim; slides 1, 6, 10 don't (acceptable — title/closing don't need citations)

Confirm or edit:
  A) Proceed as drafted
  B) Adjust slide 4 (reuse flag) — swap to alternative
  C) Different edit (I'll ask what)
```

**STOP.**

## Step 2: Resolve content per slide

For each slide, fill in the slot values. For every template slot defined in `templates/<id>.json#slots`:

1. **actionTitle slot** → from outline.md's H2
2. **claim-referencing slots** → pull `text`/`quote` from `research.json` by claim ID, paraphrase to fit `maxChars`
3. **image slot** → placeholder path `plans/<slug>/images/<nn>.png` — actual image generation happens in `/image` (not this skill)
4. **chart data** → pull from research.json claims tagged with the chart's topic; structure for the D3 pattern
5. **list items** → generate from outline context + research, respecting `maxItems`
6. **token references** → merge `aesthetic.json#overrides` into base `tokens.json` refs

### Apply layout-pack (fit check)

Per slide, call `build-helpers/layout-pack.js#packSlide` (or run its logic inline). It checks:
- Character counts vs. template slot budgets
- Recommends font shrink / truncate / split-slide if overflow
- Flags warnings

If any slot overflows:

> **Slide 4 fit issue:** `supportText` budget is 140 chars; draft is 187 chars.
>
> Options:
> A) Truncate to 138 chars + ellipsis (I'll draft)
> B) Split into 2 slides (rarely good — arc pacing breaks)
> C) Shrink font to fit (body.md → body.sm) — legibility risk
> D) Rewrite the line (I'll propose shorter phrasing)

**STOP** per overflow unless the user pre-authorizes auto-handling via `--fit=truncate` / `--fit=shrink`.

## Step 3: Assign transitions + motion per slide

From `arc.json#emphasisCurve` and `motion.json#transition`:

- Slide weight ≥ 0.8 → use `between-beats` transition (push-left, slow, gentle)
- Slide weight 0.5–0.8 → `within-beat` (smart-animate, base)
- Slide weight < 0.5 → `default` (dissolve, base)

For beat-boundary slides (where arc beat changes), force `between-beats` regardless of weight.

If the slide is a `section-divider`, use `section-divider` transition config from motion.json.

Record per slide:

```json
"transition": {
  "type": "smart-animate",
  "duration": 350,
  "easing": "gentle"
}
```

Intra-slide motion (e.g., `count-up` on a stat): for high-emphasis slides only, propose one motion effect. Don't over-decorate.

## Step 4: Write `slides/<nn>.json` per slide

For each slide, write `plans/<deck-slug>/slides/<nn>-<slug>.json` per `schemas/slide.schema.json`:

```json
{
  "$schema": "presentation-kit/slide/v1",
  "id": "slide-04",
  "index": 4,
  "actionTitle": "Our churn fell 40% after we killed the trial.",
  "template": "stat-callout",
  "beat": "promised-land",
  "content": {
    "primaryStat": { "value": "40%", "label": "of churn eliminated" },
    "supportText": "Measured Q2 2025 across 1,200 accounts. Peer baseline: 14%."
  },
  "tokens": {
    "bg": "color.bg.primary",
    "fg": "color.text.primary",
    "accent": "color.accent.primary",
    "primaryStat.typeScale": "accent-number",
    "label.typeScale": "heading.md",
    "supportText.typeScale": "body.md"
  },
  "notes": null,
  "transition": { "type": "smart-animate", "duration": 600, "easing": "gentle" },
  "motion": [
    { "element": "primaryStat", "effect": "count-up", "from": 0, "to": 40, "duration": 1200 }
  ],
  "sources": ["research.json#claim-17", "research.json#claim-18"],
  "nodeId": null
}
```

**notes is null** — /notes writes it later, not /plan-deck. We don't hallucinate speaker notes here.

**nodeId is null** — /build fills it on creation.

## Step 5: Write `deck.json`

`plans/<deck-slug>/deck.json`:

```json
{
  "$schema": "presentation-kit/deck/v1",
  "$metadata": {
    "title": "<from brief>",
    "audience": "<from brief>",
    "duration": "15min",
    "arc": "narrative",
    "aesthetic": "Editorial Warm",
    "brandFile": "<figma url>",
    "createdAt": "2026-04-22T14:30:00Z",
    "updatedAt": "2026-04-22T14:30:00Z"
  },
  "slides": [
    { "$ref": "slides/01-title.json" },
    { "$ref": "slides/02-situation.json" },
    { "$ref": "slides/03-complication.json" },
    ...
  ],
  "tokens": "design-system/tokens.json",
  "templates": "design-system/templates/index.json",
  "research": "plans/<deck-slug>/research.json"
}
```

## Step 6: Write `tasks.md` (the execution contract)

Follow the template from `build-helpers/tasks-template.md`. Produce a flat checklist:

- Phase 0 — Pre-flight (session ID resolution, font load, tokens read)
- Phase 1 — Scaffold (create all slides, get nodeIds)
- Phase 2 — Per-slide 5-layer build (repeats for each slide)
- Phase 3 — Transitions
- Phase 4 — (deferred to /notes)
- Phase 5 — (deferred to /handoff)

Every task is atomic and pre-resolved. Every tool call has its arguments fully specified — no "figure out the tokens" or "pick a font". Reference `build-helpers/build-phases.md` for the per-phase expectations.

Example task lines:

```markdown
- [ ] P0-01 [SEARCH] figma_search_components(query: "presentation-kit/template/") → expect 13 masters
- [ ] P0-02 [FONT] figma_execute load fonts: "Playfair Display" Regular + "Inter" Regular/SemiBold
- [ ] P0-03 [TOKENS] figma_browse_tokens → resolve variable keys for color.bg.primary, color.text.primary, color.accent.primary, color.accent.muted
- [ ] P1-01 [CREATE] figma_create_slide → slide-01
- [ ] P1-02 [CREATE] figma_create_slide → slide-02
  ...
- [ ] P2-01-L1 [BG] figma_set_slide_background(slide-01, color.bg.primary)
- [ ] P2-01-L2 [STRUCT] figma_instantiate_component(<title-variantKey>) onto slide-01
- [ ] P2-01-L4 [TYPE] figma_set_instance_properties(slide-01-instance, { actionTitle: "<text>", subtitle: "<text>" })
- [ ] P2-01-SCREENSHOT scale:1
- [ ] P2-01-VERIFY per shared/screenshot-validation.md
  ...
- [ ] P3-01 [TRANS] figma_set_slide_transition(slide-01, { type: "smart-animate", duration: 600, easing: "gentle" })
  ...
```

## Step 7: Final validation sweep

Before presenting:

1. **Template coverage:** ≥ 70% slides use registered templates. Warn if below.
2. **Layout variety:** no two consecutive slides share the same template. Fail if violated.
3. **Citation coverage:** every slide with a numeric / competitive claim has a `sources[]` entry. Fail if violated.
4. **All tasks pre-resolved:** no `<TODO>` or ambiguous values in tasks.md. Fail if violated.
5. **Schema validation:** every slides/*.json parses against `schemas/slide.schema.json`; deck.json parses; arc.json already validated by `/arc`.
6. **Token keys valid:** every `tokens.*` reference resolves to a 40-char hex `figmaKey` in tokens.json.

## Present

```
**Plan compiled.**

**<N> slides** · arc=<type> · aesthetic=<name>
**Template coverage:** <N>/<total> slides (<%>) ✓
**Layout variety:** ✓ no consecutive duplicates
**Citation coverage:** <N>/<total> slides have sources ✓

Artifacts written:
  plans/<slug>/deck.json
  plans/<slug>/slides/01-<slug>.json ... <N>-<slug>.json
  plans/<slug>/tasks.md

Slide-by-slide preview:
  1. title           — "<title>"
  2. stat-callout    — "Churn hit 14%..."           [claim-01]
  3. 2-column        — "Trial vs subscription..."   [claims-03,04]
  ...

Next:
  /build <slug>   — execute tasks.md in Figma Slides (serial, screenshot-verified)
  (optional) /notes <slug>   — pre-generate speaker notes before build (or after)
```

## How downstream skills use the plan

| Skill | Reads | To do |
|---|---|---|
| `/build` | `tasks.md` + `deck.json` + `slides/*.json` | Execute every task in order; screenshot after each layer |
| `/notes` | `slides/*.json` + `research.json` | Populate `slide.notes` in both the JSON and via `figma_execute` |
| `/image` | `slides/*.json#content.image` | Generate images to the paths specified |
| `/motion` | `slides/*.json#transition` + `motion` | Apply transitions + choreograph sequences |
| `/handoff --audit` | whole plan | Score against brief.md success criteria |

## Decision capture

```
2026-04-22 [/plan-deck <slug>] Compiled 10 slides; 7 templates used, 100% coverage; emphasis peak on slide 9 (proof) matched with smart-animate transition
```

Capture any non-obvious template swap or layout-pack intervention:

```
2026-04-22 [/plan-deck <slug>] Swapped slide 4 from stat-callout to comparison — content had contrast structure that stat-callout flattened
```

## Edge cases

### Outline has a slide that fits no template
If a slide title maps to no template with confidence, flag:

> "Slide 7 (`<title>`) doesn't fit any template cleanly. Options:
> A) Use freehand layout (counts against template coverage)
> B) Swap to closest template — I'll propose (`quote` or `2-column`)
> C) Revise outline — slide 7 wording makes the template ambiguous"

### Citation is missing for a numeric claim
Hard block — can't ship untraced claims.

> "Slide 4 cites `40% churn reduction` but has no sources[] entry in outline.md or in context. Options:
> A) Add a claim to research.json (I'll draft; you verify the source)
> B) Remove the number from slide 4 (rewrite without the stat)
> C) Mark as internal-data (lower confidence; flagged at audit)"

### tokens.json doesn't have a required color role
If aesthetic.json overrides reference `color.accent.secondary` but tokens.json doesn't define it, surface:

> "aesthetic.json references `color.accent.secondary` but tokens.json has no such variable. Options:
> A) Add it to tokens.json (I'll use the overridden value)
> B) Swap aesthetic reference to `color.accent.primary`
> C) Re-run `/setup-deck --tokens` to regenerate token coverage"

### User wants to hand-edit a slide after compile
Welcome. The `slides/<nn>.json` files are designed to be hand-edited. `/build` honors edits exactly. Note: if you edit a slide's template, also update the token bindings for that template's slots.

### tasks.md gets very long (> 1000 lines)
For large decks (> 30 slides), split tasks.md into per-phase files (`tasks-phase0.md`, `tasks-phase1.md`, ...) and reference them from a master `tasks.md`. `/build` handles both layouts.

## Definition of Done

1. [ ] `deck.json` exists, parses against `schemas/deck.schema.json`
2. [ ] Every slide has a `slides/<nn>-<slug>.json` file, parses against `schemas/slide.schema.json`
3. [ ] `tasks.md` exists; every task is atomic and pre-resolved
4. [ ] Template coverage ≥ 70%
5. [ ] No two consecutive slides share a template
6. [ ] Every numeric / competitive claim has a `sources[]` entry
7. [ ] All `tokens.*` references resolve to valid `figmaKey` (40-char hex)
8. [ ] layout-pack ran; any overflows resolved
9. [ ] Decision log updated

## Tone

You are a compiler. Deterministic, thorough, boring in the best way. Produce a plan that `/build` executes without inference. Every "should I?" becomes "the plan already decided — here's the line in tasks.md."

Be strict about pre-resolution. An ambiguous task ("pick a color") is a bug, not a feature.

Flag hand-edits gracefully. The presenter may know better than you about a specific slide; honor their edits while validating the system stays consistent (template coverage, citation rules, no consecutive duplicates still hold).
