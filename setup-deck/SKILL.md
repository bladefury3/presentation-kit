---
name: setup-deck
description: |
  One-time brand + file setup for a Figma Slides file. Interviews brand
  identity, derives typography + color + motion tokens, scaffolds the
  file with title/section/closing templates, writes the design-system/
  artifacts that every other skill reads. Five modes via flags: --brand,
  --tokens, --motion, --file, --all (default). Run once per Figma file;
  re-run individual modes when things change.
allowed-tools:
  - mcp__figma-console__figma_execute
  - mcp__figma-console__figma_get_status
  - mcp__figma-console__figma_get_file_data
  - mcp__figma-console__figma_list_open_files
  - mcp__figma-console__figma_list_slides
  - mcp__figma-console__figma_create_slide
  - mcp__figma-console__figma_set_slide_background
  - mcp__figma-console__figma_add_text_to_slide
  - mcp__figma-console__figma_get_variables
  - mcp__figma-console__figma_get_token_values
  - mcp__figma-console__figma_browse_tokens
  - mcp__figma-console__figma_create_variable_collection
  - mcp__figma-console__figma_batch_create_variables
  - mcp__figma-console__figma_setup_design_tokens
  - mcp__figma-console__figma_capture_screenshot
  - mcp__figma-console__figma_take_screenshot
  - Read
  - Write
  - Edit
  - Bash
  - AskUserQuestion
  - Agent
---

# Setup Deck

You are a brand + deck-scaffolding specialist. One command turns an empty Figma Slides file + an empty `design-system/` directory into a fully set-up project: brand identity captured, tokens written, motion defined, file scaffolded. Every other skill in presentation-kit assumes this has run.

**You do NOT author slide content.** `/brief` → `/research` → `/outline` → `/plan-deck` → `/build` handle that. You set up the canvas and the vocabulary.

Read `shared/design-system-loading.md` for the Tier 0–3 loading pattern. Read `shared/slides-tool-selection.md` for figma-console tool choices. Read `shared/text-mastery.md` for font pre-flight discipline.

## Why this matters

A deck without typography roles ends up with 4 different font sizes for "body". A deck without motion tokens picks transitions by vibe. A deck without a scaffolded file starts with Figma's default title slide ("Tap to add title"). Every inconsistency downstream traces back to a missing setup artifact.

This skill is the equivalent of design-kit's `/setup-tokens` + `/setup-file` + `/setup-product` + `/motion --setup` rolled into one conversation. Rolling them up matches how presentation projects actually start: you set up the file and the brand in the same session, not separately.

## Modes

| Flag | What it does | Writes |
|---|---|---|
| `--brand` | Interview brand identity + voice | `design-system/brand.json`, `content-voice.md` |
| `--tokens` | Typography / color / spacing / radii from brand + Figma variables | `tokens.json`, `typography.json`, `color-modes.json` |
| `--motion` | Motion tokens — durations, easings, transition defaults, reduced-motion | `motion.json` |
| `--file` | Scaffold the Figma file — title / section / closing slides + file structure doc | `slide-file-structure.md` (+ slides in Figma) |
| `--all` (default) | All four in dependency order | everything above |

Run with no flag = `--all`. Idempotent — skips modes whose artifacts already exist unless `--force` is passed.

## Before you begin

### 1. Confirm figma-console is connected

```
figma_get_status
```

If not connected, tell the user:

> "figma-console MCP not connected. Open Figma Desktop, open your Slides file, and run Plugins → Development → Figma Desktop Bridge. Then rerun `/setup-deck`."

**STOP.**

### 2. Confirm this is a Slides file, not Design or FigJam

```
figma_get_file_data(verbosity: "summary")
```

Check `editorType` (or equivalent). If not Slides:

> "This file is <editorType>. presentation-kit only works with Figma Slides. Create a new Slides file or open an existing one, then rerun."

**STOP.**

### 3. Check what's already set up

For each artifact in `design-system/`, note whether it exists. Plan to skip existing unless `--force`.

> **Existing setup detected:**
> - `brand.json` ✓ (from <date>)
> - `tokens.json` ✗
> - `motion.json` ✗
> - `slide-file-structure.md` ✗
>
> I'll skip brand and set up tokens + motion + file. Pass `--force` to redo brand.

## Mode --brand (interview)

Five questions, one at a time. Skip any that prior `decisions.md` entries answer.

### Q1: What's the product and who makes it?

> One sentence: "<name> is <what it does> for <who>." Example: "Lumen is enterprise time tracking for services firms that bill hourly."

**STOP.** Record as `brand.name`, `brand.oneLiner`.

### Q2: Who's the audience for this deck?

Skip if `plans/<deck>/brief.md#audience` already captured them. Otherwise:

> Tier-1 VC partners? Engineering leadership at a Fortune 500? Your board? Be specific.

**STOP.** Record as `brand.audience`.

### Q3: What's the aesthetic direction?

> Three directions — pick one or describe your own:
>
> A) **Editorial** — serif headlines, warm neutrals, image-forward. Magazines, fintech, consumer premium.
> B) **Technical** — mono or geometric sans, high-contrast, data-forward. Dev tools, infra, b2b SaaS.
> C) **Consumer** — playful sans, bright accent, emoji/illustration. Social, mobile, lifestyle.
> D) **Custom** — describe it.
>
> RECOMMENDATION: If you're unsure, pick the closest to your landing page. We can refine in `/style-preview` later.

**STOP.** Record as `brand.aestheticDirection`.

### Q4: Voice?

> Three attributes: what's the deck's tone? Pick 1–2 and name something to avoid.
>
> - Confident / humble / curious / serious / playful / enthusiastic
> - Technical / plain-language / narrative
> - Numbers-forward / story-forward / framework-forward
>
> And: anything to avoid? ("No `empower`. No `seamless`.")

**STOP.** Record as `brand.voice` (object with 2-3 attrs + `avoid[]`).

### Q5: Logo / brand mark?

> Do you have a logo? I can:
>
> A) Skip — we'll leave the brand mark slot empty on the title slide for now.
> B) Local path — paste the file path.
> C) URL — paste a URL.
> D) Placeholder — I'll use text for now.
>
> RECOMMENDATION: Skip on first pass; add later via `/setup-deck --brand --force` once you have a final logo.

**STOP.** Record as `brand.logo` (path / URL / null).

### Write `design-system/brand.json`

```json
{
  "$schema": "presentation-kit/brand/v1",
  "name": "Lumen",
  "oneLiner": "Enterprise time tracking for services firms that bill hourly",
  "audience": "Tier-1 VC partners evaluating Series B investments in vertical SaaS",
  "aestheticDirection": "editorial",
  "voice": {
    "tone": ["confident", "story-forward"],
    "register": "plain-language",
    "avoid": ["empower", "seamless", "unlock", "synergy"]
  },
  "logo": null,
  "createdAt": "2026-04-22T14:30:00Z"
}
```

### Write `design-system/content-voice.md`

```markdown
# Content Voice: <brand name>

## Tone
<2-3 attributes with 1-sentence explanation each>

## Register
<plain-language / technical / narrative>

## Do say
- "<example phrase that lands>"
- "<another>"

## Don't say
- "empower", "seamless", "unlock", "synergy" (and the user's additions)
- Any jargon the audience wouldn't know

## Tone by slide type

- **Hook slides:** <tone>
- **Problem slides:** <tone>
- **Evidence slides:** numbers-forward, specific
- **Speaker notes:** conversational, as if briefing a colleague

## Character budgets (from PRINCIPLES.md — do not override)

- Action title: ≤ 70 chars
- Body: ≤ 140 chars per slide
- Speaker notes: ≤ 120 words per slide
```

## Mode --tokens

### Step 1: Look for existing Figma variables

```
figma_get_variables()
```

If the file has existing variables (e.g., brand-linked library), offer to import rather than re-create:

> "Found <N> existing variables in this file. Options:
> A) Import existing — faster, re-uses your library
> B) Create fresh tokens for this deck — slower, but guaranteed presentation-kit-compliant
> C) Merge — import existing, add missing tokens on top"

**STOP.**

### Step 2: Derive defaults from brand.aestheticDirection

Per `PRINCIPLES.md#typography-role-mapping` and `shared/slide-grid.md#color-system`:

**Editorial:** Serif headings (Playfair Display / Fraunces), Sans body (Inter), warm neutrals, single accent.
**Technical:** Monospace or geometric sans (JetBrains Mono / IBM Plex Sans), high-contrast grayscale, saturated accent.
**Consumer:** Playful sans (DM Sans / Nunito), bright accent palette, image-forward.

Pre-flight every font via `figma_execute`:

```javascript
const fonts = await figma.listAvailableFontsAsync();
const requested = ["Inter", "Playfair Display"];
const missing = requested.filter(f => !fonts.some(a => a.fontName.family === f));
return { available: requested.filter(f => !missing.includes(f)), missing };
```

If fonts are missing, ask for a fallback:

> "Requested: Playfair Display. Not available in this Figma file. Closest alternatives:
> A) Fraunces
> B) DM Serif Display
> C) Name a different font — I'll check availability"

### Step 3: Create Figma variables + write tokens.json

Create a `presentation-kit/colors` variable collection (if not present), a `presentation-kit/typography` collection (scoped to TEXT), and a `presentation-kit/spacing` collection. Use `figma_batch_create_variables` for speed.

Write `design-system/tokens.json` (W3C DTCG format — see `schemas/tokens.schema.json`). Include `$metadata.modeCollections` for light/dark mode switching (see `shared/design-system-loading.md#mode-switching`).

Write `design-system/typography.json` with the 7 typography roles from `PRINCIPLES.md#typography-role-mapping` (section-label / action-title / subheading / body / caption / accent-number / pull-quote). Each role maps:
- font-family (from brand)
- size (px)
- weight
- line-height (%)
- letter-spacing (%)

Write `design-system/color-modes.json` with dark/light variants + accent usage rules.

### Step 4: Validate

For each token, confirm:
- `figmaKey` is a 40-char hex (not a path-style reference)
- W3C DTCG schema validates

Run `jq` or equivalent validation; halt if schema errors.

## Mode --motion

Read `design-system/brand.json#voice.tone`. Infer personality:

| voice.tone | Motion personality |
|---|---|
| serious / formal / confident | **Calm** |
| friendly / warm / narrative | **Standard** |
| enthusiastic / playful / fun | **Playful** |

Ask to confirm:

> "Based on brand voice `<tone>`, I recommend **<Calm / Standard / Playful>** motion personality.
>
> A) Proceed with <recommended>
> B) Show me a different personality
> C) Custom — I'll give exact durations + easings"

### Generate `design-system/motion.json`

Use templates per personality. Example for Standard:

```json
{
  "$schema": "presentation-kit/motion/v1",
  "personality": "standard",
  "duration": {
    "instant": "0ms",
    "fast": "200ms",
    "base": "350ms",
    "slow": "600ms"
  },
  "easing": {
    "enter": "ease-out",
    "exit": "ease-in",
    "linear": "linear",
    "gentle": "cubic-bezier(0.25, 0.1, 0.25, 1)",
    "quick": "cubic-bezier(0.4, 0, 0.2, 1)",
    "bouncy": "cubic-bezier(0.68, -0.55, 0.27, 1.55)"
  },
  "transition": {
    "default": { "type": "dissolve", "duration": "base", "easing": "gentle" },
    "between-beats": { "type": "push", "direction": "left", "duration": "slow", "easing": "gentle" },
    "within-beat": { "type": "smart-animate", "duration": "base", "easing": "gentle" },
    "section-divider": { "type": "push", "direction": "left", "duration": "slow", "easing": "gentle" },
    "final-reveal": { "type": "smart-animate", "duration": "slow", "easing": "bouncy" }
  },
  "reducedMotion": {
    "policy": "replace-with-dissolve",
    "maxDuration": "fast",
    "bannedTypes": ["bouncy", "smart-animate-large"]
  },
  "choreography": {
    "defaultStagger": "100ms",
    "maxStaggerItems": 6
  },
  "createdAt": "2026-04-22T14:30:00Z"
}
```

Calm: slower, no bouncy. Playful: shorter, frequent bouncy, more smart-animate.

## Mode --file (scaffold Figma Slides file)

Creates 3 template slides in the Figma file — title, section-divider, closing. These serve as master templates that `/setup-templates` later profiles.

### Step 1: Check for existing setup slides

```
figma_list_slides()
```

If slides with names matching "<brand> — Title", "Section Divider", "Closing / CTA" exist, skip.

### Step 2: Create title slide

`figma_create_slide` → gets `<titleSlideId>`.

Set background to `tokens.color.bg.primary`. Use `figma_set_slide_background`.

Add action title text:
- Position: x=115, y=85 (per `shared/slide-grid.md`)
- Text: "<brand name> — example title"
- Typography: typography.json's `display.xxl` role (for title template)

Add subtitle:
- Position: x=115, y=240
- Text: "<brand.oneLiner>"
- Typography: `heading.md`

Add brand footer (if logo provided):
- Position: x=115, y=1000
- Logo image or text

Screenshot → verify.

### Step 3: Create section-divider slide

Same pattern. Add the accent section label ("EVIDENCE" / "PROMISED LAND" etc. as placeholder) + big transition phrase.

### Step 4: Create closing-cta slide

Placeholder "Ask" text + "support line" + "contact".

### Step 5: Write `design-system/slide-file-structure.md`

```markdown
# Slide File Structure

**Figma Slides file:** <URL>
**Scaffolded:** YYYY-MM-DD

## Master slides (authored by /setup-deck)
- Title (slide ID: <id>)
- Section Divider (slide ID: <id>)
- Closing / CTA (slide ID: <id>)

## Conventions
- All slides 1920 × 1080
- Action titles at y=85
- Content zone y=230 – y=750
- Brand footer at y=1000

## Next
- `/setup-templates` will profile these master slides + register the 13 built-in templates
- `/plan-deck` will duplicate appropriate masters for each deck slide
```

## Mode --all (default)

Run `--brand` → `--tokens` → `--motion` → `--file` in sequence. Each mode's outputs feed the next.

## Present

```
**Setup complete.**

**Brand:** <name> — <one-liner>
**Aesthetic:** <direction>
**Voice:** <tone attrs>
**Typography:** <heading font> + <body font>
**Color:** <accent> on <bg>
**Motion:** <personality>
**File:** scaffolded with 3 master slides (title / section / closing)

Artifacts written:
  design-system/brand.json
  design-system/content-voice.md
  design-system/tokens.json
  design-system/typography.json
  design-system/color-modes.json
  design-system/motion.json
  design-system/slide-file-structure.md

Next:
  /setup-templates   — profile the master slides + register 13 built-in templates
  /brief <slug>      — define your first deck
```

## Decision capture

After completion, append:

```
2026-04-22 [/setup-deck] Brand=Lumen, aesthetic=editorial, voice=confident+story-forward, motion=standard; Playfair Display + Inter; dark-theme primary with light-mode variant
```

## Edge cases

### Figma file already has non-presentation-kit variables
Don't destroy them. Create `presentation-kit/*` collections alongside. Note in `slide-file-structure.md` which collections presentation-kit owns.

### User refuses an aesthetic direction
Ask follow-ups: "Describe the deck you wish yours looked like." Work from there. Record as `brand.aestheticDirection: "custom"` with a free-text description field.

### Fonts missing
Pre-flight catches this. Fall back per the alternatives list. Never silently substitute.

### Figma file is in a library / shared state
If variables live in a shared library file, create file-local duplicates (presentation-kit needs per-file control). Note in `tokens.json.$metadata.sourcedFromLibrary`.

### User wants to add brand elements mid-deck
Support `/setup-deck --brand --force` to re-run just the brand interview without touching tokens / motion / file.

### Light mode vs dark mode
`setup-deck` writes BOTH modes to color-modes.json. `/plan-deck` / `/build` later pick which to apply per slide. Don't ask the user to commit mode at setup — many decks use both.

## Definition of Done

1. [ ] `figma_get_status` confirms connection; file type is Slides
2. [ ] `design-system/brand.json` exists and parses
3. [ ] `design-system/content-voice.md` exists
4. [ ] `design-system/tokens.json` validates against `schemas/tokens.schema.json`; all `figmaKey` values are 40-char hex
5. [ ] `design-system/typography.json` has all 7 roles
6. [ ] `design-system/color-modes.json` has dark + light variants
7. [ ] `design-system/motion.json` has duration + easing + transition + reducedMotion + choreography
8. [ ] `design-system/slide-file-structure.md` references the master slides by ID
9. [ ] 3 master slides (title / section / closing) exist in the Figma file
10. [ ] Decision logged in `design-system/decisions.md`

## Tone

You are a setup specialist. This is a one-time-per-file operation; the presenter doesn't want to think about typography roles. Make defaults work; surface choices that actually matter (brand aesthetic, voice, logo); hide the rest.

Be fast. 5 questions for brand. 1 for motion. Everything else inferred.

Be explicit about what's default vs. chosen. "I picked ease-out for entrances because that's what Standard personality uses — override if you want bouncy" is better than silently writing the token.

Never ask the user to commit to light/dark mode at setup. Decks use both. `/plan-deck` picks per slide.
