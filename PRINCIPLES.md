# Presentation Principles

Shared frameworks referenced by all presentation-kit skills. This is the "design brain" — storytelling, visual hierarchy, typography, cognitive load, UX writing, and the anti-slop rules.

---

## Storytelling Arcs

Used by: `/outline`, `/arc`, `/plan-deck`, `/narrative-auditor`

Four arcs ship as first-class modes of the `/arc` skill. Each defines beats; every slide must map to a beat.

### 1. SCQA — Minto Pyramid (answer-first)

**Best for:** Internal decisions, exec updates, consulting recs, board readouts. Audiences who read the first slide and skip the rest.

**Structure:** Situation → Complication → Question → Answer → Supporting pillars (MECE).

**Beats:**
1. Situation — current state, shared context
2. Complication — what broke or changed
3. Question — the decision to be made
4. Answer — the recommendation (front-loaded)
5. Supporting pillar 1 + proof
6. Supporting pillar 2 + proof
7. Supporting pillar 3 + proof
8. Ask / next action

**Slide shape:** Answer comes early. Proof stacks behind each pillar.

### 2. Strategic Narrative (Andy Raskin)

**Best for:** Sales decks, fundraising, category creation, enterprise pitches.

**Structure:** Name a big shift → Winners vs losers → Promised Land → Obstacles → Magic gifts (features as enablers) → Proof.

**Beats:**
1. The Shift — world has changed
2. Winners vs losers — who adapts wins
3. Promised Land — where the world is going
4. Obstacles — why the path is hard
5. Magic gift 1 — feature as overcoming obstacle
6. Magic gift 2
7. Magic gift 3
8. Proof — customer story / traction
9. Ask

**Slide shape:** No product until slide 4-5. Opens with macro shift, not your company.

### 3. Sparkline (Nancy Duarte)

**Best for:** Keynotes, vision launches, all-hands, conference talks. Audiences you want to move.

**Structure:** Alternate What Is / What Could Be → build tension → end on New Bliss + CTA.

**Beats:**
1. Opening — common ground
2. What is #1
3. What could be #1
4. What is #2
5. What could be #2
6. What is #3
7. What could be #3
8. Crossing the threshold — CTA
9. New Bliss

**Slide shape:** Two-column contrast pattern repeated. Strong ending.

### 4. 10/20/30 (Guy Kawasaki)

**Best for:** Seed / Series A investor pitches, 20-minute formal pitches.

**Structure:** 10 slides, 20 minutes, 30pt font minimum.

**Fixed slide list:**
1. Title
2. Problem
3. Value proposition
4. Underlying magic
5. Business model
6. Go-to-market
7. Competitive analysis
8. Team
9. Projections / milestones
10. Status + ask

**Slide shape:** Hard constraints. Slide count, time, and font floor all fixed. Dense info, one idea per slide, big type, minimal text.

### Sub-arcs (not shipped as skills; use as beat templates inside the four)

- **Problem-Solution-Benefit** — simple 3-slide core for short updates.
- **Before-After-Bridge** — marketing / case-study core.
- **STAR** (Situation/Task/Action/Result) — case-study, retrospective, interview.
- **Dan Roam 6W** — who/what (portrait) / how much (chart) / where (map) / when (timeline) / how (flow) / why (variable plot). Use as slide-type vocabulary inside any arc.

---

## Visualization Chooser (Visual > Verbal)

Used by: `/outline`, `/plan-deck`. Enforced at plan time via `shared/visualization-chooser.md`.

| You have… | Use this | NOT this |
|---|---|---|
| Two things to compare | Side-by-side panels (template: `comparison`) | Paragraph describing differences |
| A process / sequence | Flow diagram with arrows | Numbered list |
| Parts of a whole | Donut chart or stacked bar | Table of percentages |
| Change over time | Line chart or Gantt | Text describing timeline |
| Categories / taxonomy | Card grid or tag pills (template: `3-column` / `team`) | Bullet list |
| Hierarchy / layers | Stack diagram | Indented list |
| Relationships | Radial diagram or network | Text describing connections |
| A key metric | Giant number + small label (template: `stat-callout`) | Sentence with number embedded |
| Pros vs cons | Check/X comparison columns | Two bullet lists |
| A timeline | Horizontal timeline with markers (template: `timeline`) | "First we did X, then Y" paragraph |

If a visual is viable, use it. Bullet lists are the fallback, not the default.

---

## Typography Role Mapping

Used by: `/setup`, `/plan-deck`, `/build`. Written to `design-system/typography.json`. Borrowed from `luan007/figma-slides-mcp` with presentation-kit adaptations.

| Role | Size | Weight | Tracking | Font | Line height |
|---|---|---|---|---|---|
| Section label | 11–13px | Regular | +15–20% | Monospace | — |
| Action title (heading) | 44–64px | Regular/400 | −2 to −3% | Serif | 100–120% |
| Subheading | 22–32px | SemiBold | −1% | Sans | 100–120% |
| Body | 15–18px | Regular | 0% | Sans | 150–180% |
| Caption / meta | 12–14px | Regular | +5% | Mono/Sans | 150–180% |
| Accent number (stat) | 36–72px | Regular | −2% | Serif | 100–120% |
| Pull quote | 28–40px | Light/Regular | 0% | Serif | 130–140% |

**Always set:**
- `width` on multi-line text (prevents overflow)
- `lineHeight` and `letterSpacing` (defaults look generic)
- `textAlignHorizontal` as a node property, not a range style

**Font names must match `figma.listAvailableFontsAsync()` output exactly** — e.g., `"Inter SemiBold"`, not `"Inter Semi Bold"`. Wrong name fails silently.

---

## Coordinate Grid (1920 × 1080)

Used by: `/plan-deck`, `/build`. See `shared/slide-grid.md` for full helper.

### Vertical regions

| Region | Y range | Usage |
|---|---|---|
| Top label | 50–70 | Section name, mono, accent color |
| Title | 85–170 | Action title, large serif |
| Subtitle area | 170–220 | Supporting text or dividers |
| Content zone | 230–750 | Cards, charts, images, body |
| Footer tagline | 780–830 | Pull quotes, summary lines |
| Brand footer | 1000–1060 | Logo, page number, attribution |

### Column layouts

| Layout | Columns | X positions | Width each |
|---|---|---|---|
| Full width | 1 | x=115 | ~1690 |
| Two columns | 2 | x=115, x=1000 | ~800, ~800 |
| Three columns | 3 | x=115, x=670, x=1225 | ~520 each |
| Four columns | 4 | x=115, x=540, x=965, x=1390 | ~400 each |
| Left heavy | 2 | x=115 (w=780), x=1000 (w=800) | Asymmetric |

**Minimum padding from slide edges: 20px.** Never crop text to the edge.

---

## Color System

Used by: `/setup`, `/plan-deck`, `/build`. Written to `design-system/color-modes.json`.

### Default dark theme palette (starting point — override per brand)

| Role | Color | Usage |
|---|---|---|
| Slide background | `#0a0a0a` or `#000000` | Default |
| Card fill | `#0a0a0a` or `#111111` | Panels, cards |
| Card border | `rgba(255,255,255,0.08)` or `#222222` | Subtle structure |
| Primary text | `#fafafa` / `#ffffff` | Headings, key text |
| Secondary text | `#999999` | Body, descriptions |
| Muted text | `#666666` | Captions, metadata |
| Dimmed text | `#333333` | Decorative, fine print |
| Accent (primary) | `#ff4d00` (example) | Labels, highlights, data viz |
| Accent dim | `rgba(accent, 0.12)` | Card backgrounds, glows |
| Success | `#00c853` | Positive indicators |
| Info blue | `#4285f4` | Secondary category |

### Accent usage rules

- **1–2 accent colors maximum.** More = noise.
- **Rest is grayscale.** Restraint is design.
- **Accent highlights must mean something** — primary CTA, key metric, category marker. Do not decorate.

### Fill opacity gotcha

Always set opacity on the fill object, not on the color:

- ✗ `{ r: 1, g: 0.3, b: 0, a: 0.5 }`
- ✓ `{ type: "SOLID", color: { r: 1, g: 0.3, b: 0 }, opacity: 0.5 }`

Strokes follow the same pattern.

---

## Slide Hierarchy Rules

Used by: `/outline`, `/plan-deck`.

### Action titles (mandatory)

Every slide title is a full-sentence takeaway. Topic-label titles are rewritten in-place by `action-title-lint`.

- ✗ "Market Size" / "Team" / "Why Now"
- ✓ "The market is growing 40% YoY." / "We've done this three times before." / "Enterprise buyers just became desperate."

### One idea per slide

If presenting 4 concepts, use 4 slides minimum. Do not stack ideas. The 5-layer build model has room for one story; two stories fight.

### Layout variety

No two consecutive slides share a template. Enforced at `plan-deck`. If slide 5 looks like slide 4 looks like slide 3, the deck has failed — repetition erases attention.

### Visual weight (one primary per slide)

| Weight | Count per slide | Role |
|---|---|---|
| Primary | 1 | The answer to "what is the ONE takeaway?" — largest, highest contrast |
| Secondary | 2–3 | Supporting context, transitional elements |
| Tertiary | remaining | Metadata, citations, page number |

If everything has equal weight, nothing stands out.

### Pre-flight thought questions (before building any slide)

1. What is the ONE takeaway?
2. What is the visual metaphor?
3. Where does the eye go first? (Is the primary element actually the takeaway?)
4. What can be removed?

If these can't be answered, the slide isn't ready.

---

## Ghost-Deck Test

Used by: `/outline` (gate before `/plan-deck`).

Print the action titles as a bulleted list. Read them in order. They must tell a coherent story on their own — no body, no visuals.

Score 0–10 via LLM-as-judge:
- **9–10**: Titles alone make the argument. The reader could advocate for the conclusion.
- **7–8**: Story is clear but missing one connective beat. Passes the gate.
- **5–6**: Topic-labels mixed with action titles; arc is implicit. **Blocks the gate.**
- **0–4**: Topic labels throughout. Rewrite the outline.

**Threshold: ≥ 7/10 to proceed.** Academic-pptx-skill introduced this test; presentation-kit enforces it.

---

## 5-Layer Build Model

Used by: `/build`. Full detail in `shared/build-layers.md`.

Every slide is constructed in this order, with a screenshot between each layer:

1. **Background** — slide background fill (`figma_set_slide_background`), gradient, or base photo.
2. **Structure** — cards, panels, dividers, region rectangles. Auto-layout containers.
3. **Graphics** — charts (D3 patterns), diagrams, icons from Lucide/Simple Icons, layered images.
4. **Typography** — action title, body, labels, accents. Font pre-flight + text mastery dance.
5. **Polish** — alignment fixes, spacing tweaks, accent touches.

**Screenshot between every layer.** Coordinates will be wrong, text will overlap, sizing will be off — that's expected. The discipline is catching it immediately, not after 5 slides. Max 3 fix iterations per layer before flagging and moving on.

---

## Cognitive Load Laws

Used by: `/plan-deck`, `/handoff --audit`.

### Hick's Law
Decision time scales with options.
- **Threshold:** > 5 options on a decide-slide without grouping → flag.
- **Fix:** Group into 2–3 buckets; use progressive disclosure.

### Miller's Law
Working memory holds 5–9 chunks.
- **Threshold:** > 6 bullets on a single slide → flag.
- **Fix:** Split across slides; chunk into groups of 3.

### Fitts's Law
Audience reading — same logic applies.
- **Threshold:** Body text < 15px at presenter distance → flag.
- **Fix:** Increase size; reduce count.

### Von Restorff (isolation effect)
The slide that breaks the pattern is remembered.
- Use for the CTA, the key metric, the punchline.
- If every slide is "isolated," none are.

---

## Character Budgets (per slide slot)

Used by: `/outline`, `/plan-deck`, `/layout-pack`.

| Slot | Budget | Notes |
|---|---|---|
| Action title | 70 chars | One sentence. Full takeaway. |
| Section label | 25 chars | 1–2 words. All caps. |
| Stat primary | 6 chars | "40%", "$2.3B", "10×" |
| Stat label | 40 chars | "of churn eliminated" |
| Body paragraph | 140 chars | One idea. If more, split the slide. |
| Pull quote | 180 chars | Attribution on a second line. |
| Caption / meta | 80 chars | Source, date, methodology. |
| Card title | 30 chars | 2–4 words. |
| Card body | 80 chars | One line of support. |
| Speaker notes (per slide) | 120 words | ~45–60 seconds at 150 wpm. |

Overflow is a bug, not a user problem. `/layout-pack` solves for fit before build.

---

## Tone Calibration

Used by: `/outline`, `/notes`, `/content-audit`. Written to `design-system/content-voice.md`.

| Context | Tone | Example |
|---|---|---|
| Hook / opening | Assertive, specific | "Churn is eating this industry alive." |
| Problem framing | Calm, evidence-based | "14% churn across mid-market SaaS in 2024." |
| Promised land | Concrete, time-bound | "Zero trial. 4% churn. In 18 months." |
| Proof / case study | Narrative, quoted | "We killed it on March 3rd. By July, churn was halved." |
| CTA | Direct, specific ask | "Commit to lead the round by Friday." |
| Speaker notes | Conversational | "This is where I pause. Look at each investor." |

**Never use** on slides: "Empower", "Seamless", "Unlock", "Synergy", "Revolutionary", "Best-in-class", "Next-generation" (unless in a brand name).

---

## Slide-Specific AI Slop Check

Used by: `/handoff --audit`. Blocks handoff on critical findings.

Common AI slide traps to flag and fix:

- **Generic card grid** — 3 cards with icons + label + sentence. Default AI output. Replace with purposeful visual metaphor.
- **Stock hero image** — unnamed people on laptops, gradient overlay. Either generate a layered image with brand style or cut the image.
- **Bullet list instead of visual** — any time ≥ 3 bullets could be a flow diagram, comparison, or chart. The visualization chooser must catch this.
- **Centered everything** — uniform 3-column centered grid. Real decks have asymmetry. At least 30% of slides should use off-center layouts.
- **"Clean modern"** — style-preview must produce distinct aesthetic directions, not three variations on neutral-with-sans-serif.
- **Equal visual weight** — if every element on a slide is the same size, none is the takeaway.
- **Generic section divider** — big word in the middle of a blank slide with the word itself (e.g., section titled "Problem" with the word "Problem" as the only content).
- **Restating the title in the first bullet** — if the first bullet rephrases the title, cut it.
- **Ghost emoji icons** — emoji used as decoration because "we need something visual." Use a real icon set (Lucide, Phosphor, Heroicons).

---

## Edge Case Taxonomy (for stress-test — v0.2)

Used by: `/stress-test` (future).

| Dimension | Test cases |
|---|---|
| Title length | 30 chars, 70 chars, 120 chars |
| Stat digits | 1-digit ("5"), 3-digit ("485"), precise ("$2.347B"), negative ("-$1.2M") |
| Body length | 0 chars, 40 chars, 140 chars, 300 chars (overflow) |
| Identity | Long founder names, non-Latin (日本語), RTL (العربية), emoji in names |
| Data | 3 bars vs 12 bars in a chart; timelines with 2 vs 15 milestones |
| Images | Landscape vs portrait source; transparent PNG; ultra-wide |
| Speaker notes | 20 words, 120 words, 500 words (over-budget) |
| Time | "5-min lightning" vs "45-min keynote" duration target |

---

## AskUserQuestion Format

Used by: all skills.

**Always follow this structure:**

1. **Re-ground:** State what you're planning and where you are. (1 sentence.)
2. **Simplify:** Explain the decision in plain English. No Figma jargon. Say what the presenter will SEE.
3. **Recommend:** `RECOMMENDATION: Choose [X] because [one-line reason]`.
4. **Options:** Lettered: `A) ... B) ... C) ...`.

### Rules

- **One decision = one question.** Never combine multiple choices.
- **Stop after each question.** Do not proceed until the user responds.
- **Escape hatch:** If the answer is obvious, state what you'll do and move on.
- **Connect to outcomes:** "This matters because your VC audience will see X on slide 3."

---

## Decision Capture

Used by: every skill. See `shared/decision-capture.md`.

When a skill picks a non-obvious arc, template, aesthetic, or motion pattern — or rejects an obvious alternative — append a one-line entry to `design-system/decisions.md`:

```
YYYY-MM-DD [/skill scope] Decision — rationale
```

Future sessions read this as Tier 0 context. The decision log is the project's long-term memory.

---

## What this is NOT

- **Not a template store.** Templates live in `design-system/templates/` as data; the registry is extensible. Anyone can add a template without authoring a skill.
- **Not a PowerPoint bridge.** presentation-kit commits directly to Figma Slides. Export to PDF/PPTX is manual (no programmatic export exists today).
- **Not an AI copywriter.** The presenter writes. Skills prompt, structure, and validate — they don't generate content unchecked.
- **Not a replacement for rehearsal.** `/rehearse` is a pacing coach, not a substitute for practice.
