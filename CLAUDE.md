# Presentation Kit

Skills for turning a brief into a defensible Figma Slides deck — research → outline → narrative arc → visual design → slides → motion → speaker notes → rehearsal → handoff. Works with any MCP-compatible AI tool; targets the `figma-console` MCP server.

## Commands

```bash
./setup              # Install skills to ~/.claude/commands/
./setup --local      # Install to .claude/commands/ in current project
./setup --cursor     # Install as Cursor skills
./setup --update     # Pull latest and reinstall
./setup --uninstall  # Remove installed skills
./lint-skills.sh     # Validate SKILL.md frontmatter + shared references
```

## Project Structure

```
presentation-kit/
├── design-system/                    # Extracted + shipped artifacts
│   ├── brand.json                    #   Identity (written by /setup)
│   ├── tokens.json                   #   Color / typography / spacing / radii / shadows
│   ├── typography.json               #   Role mapping: section label / heading / body / caption / accent
│   ├── motion.json                   #   Durations, easings, transitions, reduced-motion policy
│   ├── color-modes.json              #   Dark / light variants + accent usage rules
│   ├── content-voice.md              #   Tone, word budgets, banned phrases
│   ├── slide-file-structure.md       #   Figma file / page conventions
│   ├── image-provider.json           #   External image-gen provider config (OpenAI / Gemini / Replicate)
│   ├── decisions.md                  #   Append-only log of meaningful decisions
│   └── templates/                    #   TEMPLATE REGISTRY — data, not code
│       ├── index.json                #     Catalog of all templates + slot summary
│       └── <id>.json                 #     13 shipped templates (title / stat-callout / 2-column / …)
│
├── plans/                            # Per-deck outputs
│   └── <deck-slug>/
│       ├── brief.md                  #   Problem, audience, CTA, duration
│       ├── discovery.md              #   Context from files / URLs / Figma / pasted text
│       ├── research.json             #   Claim → source map (URL, quote, retrievedAt)
│       ├── outline.md                #   Action-titled, human-edited
│       ├── arc.json                  #   Chosen arc + beat → slide mapping + emphasis curve
│       ├── aesthetic.json            #   Committed style direction (after /style-preview)
│       ├── deck.json                 #   Canonical deck (compiled by /plan-deck)
│       ├── slides/<nn>.json          #   Per-slide specs
│       ├── tasks.md                  #   Flat execution contract (zero runtime decisions)
│       ├── ghost-deck.md             #   Titles-only essay + score
│       ├── narrative-audit.md
│       ├── audit.md
│       ├── qa-report.md              #   Parallel QA scores per dimension
│       ├── score.md                  #   Composite 0-10
│       ├── export-checklist.md
│       ├── workflow-log.md           #   Timestamped pipeline log
│       ├── images/                   #   Generated PNGs (flat + layered variants)
│       ├── screenshots/              #   Per-slide PNG exports
│       └── handoff/                  #   Shareable bundle
│
├── schemas/                          # JSON Schemas
│   ├── deck.schema.json
│   ├── slide.schema.json
│   ├── arc.schema.json
│   ├── template.schema.json
│   └── research.schema.json
│
├── shared/                           # Read-only helpers referenced by skills (never imported)
│   ├── design-system-loading.md      #   Tier 0-3 fallback
│   ├── tool-selection.md             #   figma-console tool decision tree
│   ├── slides-tool-selection.md      #   Slides-specific: create_slide vs figma_execute + API limits
│   ├── build-layers.md               #   5-layer model (Background → Structure → Graphics → Typography → Polish)
│   ├── slide-grid.md                 #   1920×1080 coordinates + canvas positioning
│   ├── visualization-chooser.md      #   "If you have X, use Y" heuristic table
│   ├── screenshot-validation.md      #   Scale discipline + per-layer checks
│   ├── text-mastery.md               #   Text dance + font pre-flight
│   ├── decision-capture.md           #   Append to design-system/decisions.md
│   ├── speaker-notes-helper.md       #   figma_execute snippet for slide.speakerNotes (escape hatch)
│   ├── asset-sources.md              #   Icon / image CDN catalog (Lucide, Simple Icons, Unsplash, Picsum)
│   └── anti-patterns.md              #   WRONG/RIGHT pairs + placeholder detection + error recovery
│
├── build-helpers/                    # Reusable scripts and templates
│   ├── slide-helpers.js              #   Figma Plugin API helpers (mkSlide, mkText, setBg, setNotes)
│   ├── text-pack.js                  #   Pre-compute wrapping + line counts before setText
│   ├── layout-pack.js                #   Fit solver (shrink / wrap / truncate-with-warning)
│   ├── template-instantiate.js       #   Generic slot-fill engine (reads template.json → Plugin API ops)
│   ├── image-provider.js             #   Adapter layer for external image gen
│   ├── d3-patterns/                  #   6 chart patterns (from luan007/figma-slides-mcp)
│   │   ├── data-table.js
│   │   ├── flow-diagram.js
│   │   ├── comparison-columns.js
│   │   ├── bar-chart.js
│   │   ├── gantt-timeline.js
│   │   └── donut-chart.js
│   ├── build-phases.md               #   5-layer pipeline spec
│   ├── tasks-template.md             #   Execution-contract template
│   └── slide-tasks-template.md       #   Per-slide task breakdown
│
├── decisions/
│   └── RESEARCH.md                   #   Append-only architecture decision log
│
├── benchmarks/
│   ├── test-cases/                   #   Canned briefs (Series B pitch, tech keynote, internal update)
│   ├── rubrics/
│   └── results/
│
├── <skill-dir>/                      # 14 skill directories, each with SKILL.md (authored in Phase 1+)
│   ├── setup/
│   ├── setup-templates/
│   ├── brief/
│   ├── research/
│   ├── outline/
│   ├── arc/
│   ├── style-preview/
│   ├── plan-deck/
│   ├── build/
│   ├── image/
│   ├── motion/
│   ├── notes/
│   ├── rehearse/
│   └── handoff/
│
├── CLAUDE.md                         # This file
├── ETHOS.md                          # Design philosophy (6 principles)
├── PRINCIPLES.md                     # Storytelling + visual design frameworks
├── README.md                         # Install + quick-start
├── CHANGELOG.md
├── TEST-CHECKLIST.md
├── VERSION
├── LICENSE
├── package.json
├── setup                             # Installer
└── lint-skills.sh                    # SKILL.md validator
```

## Core Directives (override default behavior)

These rules apply to every skill. A skill that violates these is wrong even if the user doesn't flag it.

### 1. Arc-first

No outline without a selected arc. The arc (`arc-scqa`, `arc-narrative`, `arc-sparkline`, `arc-10-20-30`) defines beat structure; the outline is validated against beats before `/plan-deck` can proceed. Changing the arc invalidates the outline — explicitly prompt the user to re-outline.

### 2. Action titles mandatory

Every slide's title is a full-sentence takeaway, not a topic label.

- ✗ "Market Size"
- ✓ "The market is growing 40% year over year."

`/outline` runs `action-title-lint` on every run. Topic-label titles are rewritten in-place or flagged for user decision. See `shared/anti-patterns.md`.

### 3. Ghost-deck test gate

Before any deck is built, the titles-only sequence (ghost deck) must read as a coherent mini-essay. Score is assigned by LLM-as-judge 0-10. **< 7/10 blocks `/plan-deck`.** Fix the outline first.

### 4. 5-layer build model

Every slide is constructed in this order:
1. **Background** — fill, gradient, or photo base
2. **Structure** — cards, panels, dividers, region rectangles
3. **Graphics** — charts, diagrams, icons, layered images
4. **Typography** — action title, body, labels, accents
5. **Polish** — alignment fixes, spacing tweaks, accent details

Screenshot between every layer. See `shared/build-layers.md`.

### 5. Screenshot validation after every meaningful action

- `figma_take_screenshot` at scale:1 for verification (1920×1080 native).
- scale:0.5 is for deck overviews only.
- Never stack 5 operations without an intermediate screenshot — fail fast beats fail deep.
- See `shared/screenshot-validation.md`.

### 6. Visual > Verbal

At plan time, check each slide against the visualization chooser in `shared/visualization-chooser.md`.

- Two things to compare → side-by-side panels, not paragraph
- Process / sequence → flow diagram, not numbered list
- Parts of a whole → donut or stacked bar, not table of percentages
- Categories / taxonomy → card grid or tag pills, not bullet list
- A key metric → giant number + small label, not sentence with number embedded

If a viable visual exists, use it. Bullet lists are the fallback, not the default.

### 7. One idea per slide; no two consecutive same-template slides

If the user is presenting 4 concepts, that is 4 slides minimum. Layout variety is enforced at `plan-deck`: no two slides in a row share a template. Failing this gates the build.

### 8. Template coverage ≥ 70%

Plans where < 70% of slides use a registered template (i.e., too many freehand layouts) are flagged. The template registry exists to create consistency; deviate only with cause.

### 9. Every body claim has `sources[]`

Every claim in slide body copy OR speaker notes must have a `sources[]` entry pointing to `research.json#claim-<id>`. Untraced claims block the build. This keeps the deck defensible.

### 10. Speaker notes via `shared/speaker-notes-helper.md`

`figma-console` has no typed tool for speaker notes. They are set via `figma_execute` + Plugin API: `slide.speakerNotes = "..."`. There is **one** canonical helper; every skill that sets notes reads it. Do not re-derive the snippet.

### 11. Font pre-flight

Before any `setText` on new text nodes, confirm the font is available. Use `figma_execute` to call `figma.listAvailableFontsAsync()` filtered by query. Wrong font names fail silently. See `shared/text-mastery.md`.

### 12. Text mastery dance

Never guess character counts for range styling. The sequence is always:

1. Create text node + setText (content + font load).
2. Read actual character count via Plugin API (`node.characters.length`).
3. Apply `setRangeFontName` / `setRangeFontSize` / `setRangeFills` using the real length.

Unicode, emoji, CJK all have length surprises. See `shared/text-mastery.md`.

### 13. Layered images only

AI-generated images are never emitted as a flat composite. Background / mid / foreground are separate Figma layers so users can edit text independently. If the provider returns a single file, `/image --layered` decomposes it (Canva Magic Layers pattern).

### 14. Node IDs are session-scoped

`figma_search_components` at session start. Never reuse IDs across conversations. The `figma-console` MCP documents this explicitly.

### 15. Append-only decision log

When a skill picks a non-obvious arc, template, aesthetic, or motion pattern — or rejects an obvious alternative — append a one-line decision to `design-system/decisions.md`. See `shared/decision-capture.md`. This is the project's long-term memory.

---

## Pre-flight thought questions (enforced by `/outline` and `/plan-deck`)

Before building any slide, answer:

1. What is the ONE takeaway?
2. What is the visual metaphor? (Comparison → two columns; process → flow; hierarchy → stack; distribution → chart.)
3. Where does the eye go first? (Largest + brightest wins; make sure that is the takeaway.)
4. What can be removed?

If these can't be answered, the slide isn't ready. Borrowed from `luan007/figma-slides-mcp`.

---

## Quick Start for Presenters

### What is this?

Presentation Kit gives you slash commands in your AI tool that build, audit, and rehearse a deck in Figma Slides. You describe the audience and the ask; the kit picks an arc, writes an outline you edit, compiles a deck, generates images, writes speaker notes, and coaches your delivery.

### Prerequisites

1. **An AI coding tool with MCP support** — Claude Code, Cursor, Windsurf.
2. **Figma Desktop** with a Slides file open and the [Figma Console MCP](https://github.com/nichochar/figma-console-mcp) Desktop Bridge plugin running.
3. **This repo** — cloned and skills installed via `./setup`.

### Your first 15 minutes

```
Step 1: Open a Figma Slides file. Run the Desktop Bridge plugin.
Step 2: In your AI tool, run /setup.
        → Interviews brand identity, writes tokens / typography / motion,
          scaffolds the file with title / section / closing slides.
Step 3: /setup-templates.
        → Profiles existing slide-masters + registers 13 built-in templates.
Step 4: /brief.
        → HMW, audience, CTA, duration, tone. 3-4 questions.
Step 5: /research.
        → Pulls citations from the web + your files into research.json.
Step 6: /outline → /arc → /style-preview → /plan-deck → /build.
        → Skeleton deck in Figma Slides.
Step 7: /image → /motion → /notes → /rehearse → /handoff.
        → Rich, rehearsed, audited, shipped.
```

## Common workflows

### "I need a 10-minute pitch by tomorrow morning"

```
/brief                → problem, audience, CTA, duration (10 min), tone
/research             → cited claims in research.json
/outline              → action-titled outline; ghost-deck test gate
/arc --type=narrative → Raskin strategic narrative (enemy → promised land → proof)
/style-preview        → pick 1 of 3 aesthetics
/plan-deck → /build   → skeleton deck in Figma Slides
/image                → layered images per slide
/notes                → speaker notes with timing markers + Q&A prep
/handoff              → audit → QA → score → bundle
```

### "I have a 30-page research doc — turn it into a 20-min exec update"

```
/brief                      → "internal leadership review, 20 min, decision needed"
/research --source=doc.pdf  → pulls claims from the doc
/outline                    → compress 30 pages to ~12 action-titled slides
/arc --type=scqa            → Minto: situation / complication / question / answer
/plan-deck → /build         → skeleton
/notes --timing             → 20-min budget distributed across slides
/rehearse                   → time yourself, flag pacing drift
```

### "My decks always look generic — help"

```
/style-preview               → see 3 aesthetic directions before any slide is built
                               (no default; you pick the look up front)
/plan-deck                   → enforces template variety (no two consecutive same-template slides)
/handoff                     → parallel QA catches AI slop patterns
```

### "I'm not confident on the speaker notes"

```
/notes --generate --qa-prep  → claim + evidence + transition + anticipated Q&A per slide
/notes --timing              → [~45s] markers to hit duration target
/rehearse                    → reads aloud, times you, flags long sentences
```

---

## Figma Slides MCP interaction

All skills use the [Figma Console MCP](https://github.com/nichochar/figma-console-mcp) server. Key tool groups:

### Slide authoring
- `figma_create_slide`, `figma_duplicate_slide`, `figma_delete_slide`, `figma_reorder_slides`, `figma_list_slides`
- `figma_add_text_to_slide`, `figma_add_shape_to_slide`
- `figma_set_slide_background`, `figma_set_slide_transition`, `figma_get_slide_transition`
- `figma_get_slide_content`, `figma_get_focused_slide`, `figma_get_slide_grid`
- `figma_skip_slide`, `figma_set_slides_view_mode`

### Components (for template masters and library reuse)
- `figma_search_components`, `figma_get_library_components`, `figma_instantiate_component`

### Tokens / variables
- `figma_get_variables`, `figma_get_token_values`, `figma_browse_tokens`, `figma_setup_design_tokens`, `figma_batch_create_variables`

### Content properties
- `figma_set_text`, `figma_set_fills`, `figma_set_strokes`, `figma_set_image_fill` (accepts URL or base64)
- `figma_set_instance_properties` for boolean + text overrides on instances

### Screenshots
- `figma_take_screenshot` — REST API, supports up to 4× scale, PNG/JPG/SVG/PDF. Pass `nodeId` of the slide.
- `figma_capture_screenshot` — Desktop Bridge, 1× PNG auto-capped at 1568px. Lighter.

### Escape hatch
- `figma_execute` — runs Plugin API JavaScript. Required for:
  - Speaker notes (`slide.speakerNotes = "..."`)
  - Complex range-styling on text
  - Slide-level operations not exposed as typed tools
  - Any batched script

See `shared/slides-tool-selection.md` for the full decision tree.

---

## Output formats

### `deck.json` (canonical compiled deck)

```json
{
  "$schema": "presentation-kit/deck/v1",
  "$metadata": { "title": "Series B Pitch", "audience": "tier-1 VCs", "duration": "20min", "arc": "narrative", "aesthetic": "editorial-serif" },
  "slides": [{ "$ref": "slides/01-title.json" }],
  "tokens": "design-system/tokens.json",
  "templates": "design-system/templates/index.json",
  "research": "plans/<deck>/research.json"
}
```

### `slide.json` (per-slide spec)

```json
{
  "$schema": "presentation-kit/slide/v1",
  "id": "slide-03",
  "index": 3,
  "actionTitle": "Our churn fell 40% after we killed the trial.",
  "template": "stat-callout",
  "beat": "evidence-2",
  "content": {
    "primaryStat": { "value": "40%", "label": "churn reduction" },
    "supportText": "Measured Q2 2025 across 1,200 accounts.",
    "image": { "path": "images/03.png", "layer": "foreground", "alt": "..." }
  },
  "tokens": { "bg": "color.surface.emphasis", "fg": "color.text.inverse", "typeScale": "display.lg" },
  "notes": "<~45s> We killed the trial because...",
  "transition": { "type": "smart-animate", "duration": 400 },
  "motion": [{ "element": "primaryStat", "effect": "count-up", "from": 0 }],
  "sources": ["research.json#claim-17"],
  "nodeId": null
}
```

### `arc.json` (beat mapping)

```json
{
  "$schema": "presentation-kit/arc/v1",
  "type": "narrative",
  "beats": [
    { "id": "enemy", "slides": [2, 3] },
    { "id": "promised-land", "slides": [4, 5] },
    { "id": "evidence", "slides": [6, 7, 8] },
    { "id": "obstacles", "slides": [9] },
    { "id": "proof", "slides": [10] }
  ],
  "emphasisCurve": [0.2, 0.3, 0.5, 0.7, 0.9, 0.6, 1.0]
}
```

### `research.json` (claim → source map)

Each claim:
```json
{
  "id": "claim-17",
  "text": "Enterprise SaaS churn averaged 14% in 2024.",
  "source": "https://example.com/report.pdf",
  "quote": "...industry-wide churn hit 14% for mid-market SaaS…",
  "retrievedAt": "2026-04-22T14:30:00Z"
}
```

---

## For Skill Developers

### Skill format

Each skill is a directory containing a `SKILL.md` file. Skills are registered via `./setup` and invoked as slash commands.

**Frontmatter (required):**

```yaml
---
name: outline
description: |
  Outline-first deck planning. Produces action titles, runs ghost-deck-test,
  voice-audits against content-voice.md, and lints topic-label titles.
allowed-tools:
  - mcp__figma-console__figma_*
  - Read
  - Write
  - Edit
  - Bash
  - AskUserQuestion
  - Agent
  - WebSearch
  - WebFetch
---
```

**Body (required sections):**
1. `# <Skill Name>` heading.
2. `## Tone` or `## Definition of Done` (or both).
3. Numbered steps or phases.
4. References to `shared/*.md` where relevant.

### Writing skills

- Use presenter-first language — arc, beat, action title, pacing, emphasis.
- Skills interact with Figma via `figma-console` MCP.
- Always validate with screenshots after visual changes.
- Plans output as human-readable markdown (outline.md, brief.md, handoff bundles) plus machine-readable JSON where needed.
- Ask the user before making assumptions about brand, arc, or aesthetic.
- Skills degrade gracefully without pre-extracted data — use `figma_get_design_system_kit` as a fallback.

### Skill linting

`./lint-skills.sh` checks:
- YAML frontmatter present
- Required fields: `name`, `description`, `allowed-tools`
- Tool references are valid (`mcp__figma-console__*`, `Read/Write/Edit/Bash/AskUserQuestion/Agent/WebSearch/WebFetch`)
- `shared/*.md` references resolve to existing files
- Body has a heading after frontmatter
- Body has a `## Definition of Done` or `## Tone` section

## Commit style

One logical change per commit. Separate renames from behavior changes. Commits that move code should not also change it. Do not combine schema changes with skill changes.
