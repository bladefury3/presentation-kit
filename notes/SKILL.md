---
name: notes
description: |
  Speaker notes. Four modes via flags: --generate (per-slide: claim +
  evidence + transition sentence + research citations), --timing
  (annotate [~Xs] per slide so total hits the duration target), --qa-prep
  (anticipated audience Q&A for key slides), --coach (flag long
  sentences, unpronounceable acronyms, jokes that need setup). Writes
  via the figma_execute escape hatch — see shared/speaker-notes-helper.md.
allowed-tools:
  - mcp__figma-console__figma_execute
  - mcp__figma-console__figma_get_status
  - mcp__figma-console__figma_list_slides
  - mcp__figma-console__figma_get_slide_content
  - mcp__figma-console__figma_post_comment
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - AskUserQuestion
  - Agent
---

# Speaker Notes

You generate, time, and polish the notes the presenter will read. Every claim in the notes ties back to a `research.json` entry. Notes are applied to Figma Slides via the `figma_execute` escape hatch (`slide.speakerNotes = "..."`) — there is no typed tool, and one canonical helper owns the shape.

**You do NOT edit slide content.** You write what the presenter says *above* the slide. If the slide's action title is weak, fix it in `/outline` — don't patch it with notes.

Read `shared/speaker-notes-helper.md` — that's the contract. Read `shared/text-mastery.md` if you need to range-style anything (rare for notes; mostly plain text).

## Why this matters

Presenter-notes generation is where every incumbent AI tool half-delivers. Gamma auto-generates notes that restate the slide. Copilot generates plausible but un-cited prose. Decktopus adds Q&A but doesn't tie to research.

This skill ships what presenters actually want: notes that extend the slide (not echo it), timing markers that sum to the target duration, anticipated Q&A grounded in the claims, and a coach pass that flags delivery risk. Every line in the notes is defensible.

## Modes

| Flag | What it does | Writes |
|---|---|---|
| `--generate` (default) | Per-slide notes: claim + evidence + transition | `slide.speakerNotes` via Plugin API + `slides/<nn>.json#notes` |
| `--timing` | `[~Xs]` markers distributed to hit target duration | appended to `speakerNotes` |
| `--qa-prep` | Anticipated audience Q&A per key slide | `plans/<slug>/qa-prep.md` |
| `--coach` | Flag long sentences / unpronounceable acronyms / needs-setup jokes | `plans/<slug>/coach-notes.md` + Figma comments |

Run multiple: `--generate --timing --qa-prep` runs all three in sequence. Default `--generate` only.

## Before you begin

### 1. Confirm Figma + prior skills

```
figma_get_status
Read plans/<deck-slug>/deck.json
Read plans/<deck-slug>/slides/<every>.json
Read plans/<deck-slug>/brief.md
Read plans/<deck-slug>/research.json
Read plans/<deck-slug>/arc.json
Read plans/<deck-slug>/build-log.md   # confirms slides exist
Read design-system/content-voice.md   # voice rules for notes
Read design-system/motion.json        # reduced-motion + timing defaults
```

If `/build` hasn't run, route. Notes write to actual Figma slides; the slides must exist.

If `/research` wasn't run, warn strongly:

> "No research.json — notes will be un-cited. The handoff audit will flag every claim. Recommend running `/research` first. Continue anyway? (A) Yes, un-cited (B) Stop and run /research"

**STOP.**

### 2. Re-resolve session-scoped nodeIds

```
figma_list_slides
```

Update `slides/<nn>.json#nodeId` if drift detected (same pattern as `/motion`).

### 3. Load the canonical escape hatch

Read `shared/speaker-notes-helper.md`. **Do not re-derive the snippet.** The helper is the single source of truth for how `slide.speakerNotes = "..."` is invoked via `figma_execute`. If the Plugin API changes, the helper changes once and every skill that writes notes keeps working.

## Mode --generate

For each slide, write notes composed of 3-5 sentences covering:

1. **Transition in** (optional, 1 sentence) — the sentence that lands the previous slide's point and opens this one. Not always needed; skip on slide 1 and section dividers.
2. **The claim** — the slide's action title, restated in spoken register (contractions, less formal than on-slide text).
3. **Supporting evidence** — 1-2 sentences citing specific claims from research.json. Mention source + year if the audience values credibility.
4. **Emphasis / aside** (optional, 1 sentence) — what the presenter wants the audience to feel or do at this moment.

Target word count: **~75-120 words per slide** (speaker delivers ~150 wpm → ~30-48 seconds per slide; 15-min / 10-slide deck → 90 sec/slide budget leaves room for pauses + Q&A).

### Pattern by arc beat

Each beat has typical notes shapes. Apply as a draft template; revise per slide's specifics.

| Beat | Notes shape |
|---|---|
| title | "Hi, I'm X from Y. In the next N minutes, I'll show you Z." |
| situation / shift | Observation the audience agrees with + "but something just changed" hook |
| complication | Specific quantification of the problem + 1 citation |
| question | Explicit framing of the decision — "So the question is…" |
| answer | Lead with the answer; promise 3 reasons to follow |
| pillar / magic-gift | The claim + 1 piece of evidence + a transition to the next one |
| proof | A customer story told in 2 sentences + the metric |
| obstacles | Acknowledge the objection head-on + how you answer it |
| ask / closing | Direct language about what you want; silence as the close |

### Example — slide 4 (promised-land)

Source:
- `slide.actionTitle`: "Our churn fell 40% after we killed the trial."
- `sources`: `["research.json#claim-17", "research.json#claim-18"]`
- Research claim-17: "Lumen reduced churn to 4% within 18 months of killing the trial." (internal-data, high confidence)
- Research claim-18: "The churn measurement covers 1,200 accounts across Q2 2025." (internal-data)

Generated notes:

```
So — what did we actually do? We killed the trial. Completely.

In the 18 months since, our churn dropped from the industry baseline of 14% down to 4%. That's across 1,200 accounts, measured Q2 2025.

The thing to notice isn't the number — it's that our competitors see churn as a retention problem. We started seeing it as a pricing problem. Same number, different frame, totally different product.

Let me show you how we did it.
```

Word count: 79 words. Speaks ~32 seconds at 150 wpm.

### Citation formatting in notes

When the presenter references a specific source, append `(claim-NN)` in the written notes so the presenter can cross-reference if they're questioned:

```
"We're the only mid-market SaaS with churn under 5% (claim-17, internal Q2 2025)."
```

The parenthetical is for the presenter's eyes; they'd speak the parenthetical aloud only if challenged.

### Apply via `figma_execute`

Use the canonical snippet from `shared/speaker-notes-helper.md`. Batch up to 20 slides per `figma_execute` call (30s timeout).

```javascript
// From shared/speaker-notes-helper.md — do not re-derive
const assignments = /* array of { slideId, notes } */;
const results = [];
for (const { slideId, notes } of assignments) {
  const slide = await figma.getNodeByIdAsync(slideId);
  if (!slide || slide.type !== 'SLIDE') {
    results.push({ slideId, ok: false, error: `not a slide: ${slide?.type}` });
    continue;
  }
  slide.speakerNotes = notes;
  results.push({ slideId, ok: true, noteLength: notes.length });
}
return results;
```

Also mirror to `slides/<nn>.json#notes` so the plan file reflects the actual state. Reading Figma is expensive; the JSON is the cache.

## Mode --timing

Given a target total duration, distribute time per slide per the arc's emphasis curve — not uniformly.

### Algorithm

1. Total time = `brief.md#duration` minus Q&A buffer (default 20% of duration).
2. Base time per slide = total / slide count.
3. Weight each slide by `arc.json#emphasisCurve[index]`.
4. Allocate: `slide_time = base_time * (emphasis / mean_emphasis)`.
5. Normalize so the sum equals total_time.
6. Clamp: no slide under 20 seconds (audience can't absorb); no slide over 3 minutes (attention flags).

For a 15-min deck with 10 slides (target: 12 min minus 3 min Q&A = 12 min presentation = 720s):

| Slide | Emphasis | Raw weight | Allocated time |
|---|---|---|---|
| 1 (title) | 0.3 | 0.45 | 30s |
| 2 (shift) | 0.4 | 0.60 | 45s |
| 3 (winners-losers) | 0.5 | 0.75 | 60s |
| 4 (promised-land) | 0.8 | 1.20 | 95s |
| 5 (obstacles) | 0.6 | 0.90 | 70s |
| ... | ... | ... | ... |
| 10 (ask) | 1.0 | 1.50 | 105s |
| **Sum** | | | **720s ✓** |

### Annotate the notes

Prepend `[~Xs]` to each slide's notes:

```
[~95s] So — what did we actually do? We killed the trial...
```

If `--timing` runs alone, it modifies only the first line of each slide's notes. If combined with `--generate`, emit the marker as part of the composed text.

### Warn on misfit

If the generated notes for a slide would take longer than the allocated time (word count / 150 wpm > allocated), flag:

> "Slide 6's notes are 180 words (~72s) but the budget is 50s. Options:
> A) Trim the notes (I'll propose a 40-word cut)
> B) Increase the emphasis weight for slide 6 (cascades to slides around it)
> C) Accept the overrun — you'll need to talk faster or skip points live"

## Mode --qa-prep

For each slide with emphasis ≥ 0.6 (i.e., beats that will draw questions), generate 2-3 anticipated questions + suggested answers.

Seed the questions from the slide's claims + adjacent research. Question archetypes:

| Archetype | Prompt to generate |
|---|---|
| Methodology challenge | "How did you measure that?" → answer from research.json#claim-NN's methodology |
| Scope challenge | "Does this hold for non-<audience> too?" → acknowledge boundary |
| Comparison challenge | "What about [competitor]?" → point to the differentiating pillar |
| Skepticism | "That seems too good to be true — what's the catch?" → honest disclaimer |
| Follow-up | "What's next?" → tease the ask slide |

Write `plans/<slug>/qa-prep.md`:

```markdown
# Q&A Prep: <deck-slug>

## Slide 4 (promised-land) — "Our churn fell 40% after we killed the trial."

### Q: How did you measure that?
A: 1,200 accounts, Q2 2025, gross revenue churn (not account churn). Baseline was Q2 2024 before we killed the trial. Source: internal retention dashboard, verified by our CFO.

### Q: Isn't killing the trial just selection bias? Only motivated buyers sign up?
A: Fair challenge. We saw a 20% drop in signups but a 3× increase in paying conversion. Net revenue per cohort is up 2.1×. If it were just selection, net wouldn't move — but it did.

### Q: Does this work for segments smaller than mid-market?
A: We haven't tested below 10 seats. We don't plan to — SMB has different retention dynamics. Sticking to our ICP.
```

Post a Figma comment on each slide referencing the qa-prep file so the presenter sees it in their review:

```
figma_post_comment(slideId, "Q&A prep for this slide: plans/<slug>/qa-prep.md#slide-4")
```

## Mode --coach

Scan the generated notes; flag delivery risks. Output as Figma comments on the respective slides + a summary file.

### Checks

1. **Sentence length** — any sentence > 25 words → flag ("try breaking into two")
2. **Unpronounceable acronyms** — acronyms not spelled out on first use OR containing uncommon letter combos → flag ("spell out or gloss")
3. **Jokes needing setup** — sarcasm or references that require context the audience may not have → flag ("add a setup clause or cut")
4. **Filler words** — "actually", "basically", "just", "I think" in the notes → flag ("cut — these are speech habits, not writing")
5. **Citations read aloud** — notes that include `(claim-NN)` should NOT be spoken verbatim; flag ("parenthetical is for your eyes — don't say it")
6. **Numbers without units** — "40" without "%" / "$" / "million" → flag
7. **Tone mismatch** — informal phrasing in a formal audience's notes → flag

Write `plans/<slug>/coach-notes.md`:

```markdown
# Coach Notes: <deck-slug>

Scan complete. <N> issues across <M> slides.

## Slide 4
- [sentence-length] "So what we actually did is we killed the trial and in the 18 months since we've seen our churn drop from the industry baseline of 14% all the way down to 4% which is across 1,200 accounts that we measured in Q2 2025." (48 words — split into 3)
- [filler] "actually" in sentence 1 — cut

## Slide 7
- [acronym] "ARR" used without spelling out first — add "Annual Recurring Revenue" on first mention
- [jokes] "our competitors are still chasing the trial wagon off a cliff" — requires the audience to know the trial-wagon metaphor; add setup or cut
```

Post Figma comments on each flagged slide (max 3 comments per slide to avoid clutter).

## Present (overall, after any combo of modes)

```
**Speaker notes complete.**

Modes run: --generate --timing --qa-prep --coach
<N>/<N> slides have notes (avg 85 words / ~34s each)
Total estimated delivery time: 12 min 14 sec (target: 12 min) ✓

Coach flags: <N> (see coach-notes.md) — most are minor (filler words)
Q&A prep: <N> key slides covered (see qa-prep.md)
Cited: <N>/<N> claim-bearing slides have research references

Figma presenter notes panel is now populated — open presenter mode to review.

Next:
  /rehearse <slug>   — read notes aloud, time yourself, catch pacing drift
  /handoff <slug>    — final audit + bundle
```

## Decision capture

```
2026-04-22 [/notes <slug>] Front-loaded Q&A prep on slides 4, 8, 10 — those are the pitch's 3 peaks; audience will question the 40% churn claim hardest
```

## Edge cases

### Notes for slide 1 (title) feel forced
Title slides often need just 1-2 sentences of intro. Shorten, don't pad. Skip the "transition in" pattern.

### Section divider slides
Notes there are transition moments. Use: "Now let's talk about [section topic]. Here's why this matters…" — lean on the beat label from arc.json.

### Presenter writes their own notes
If `slides/<nn>.json#notes` is already populated by the user (not null), respect it. Offer:

> "Slide 6 already has notes. Options:
> A) Keep user's notes as-is, skip
> B) Regenerate (overwrite) — I'll show diff first
> C) Enhance — merge user's intent with cited claims"

### figma_execute fails to set speaker notes
The escape hatch in `shared/speaker-notes-helper.md` is the architecture-critical path. If it fails:

1. Re-read the helper — maybe the Plugin API changed.
2. Check `slide.type === 'SLIDE'` — maybe the nodeId drifted to a non-slide.
3. Fall back to sidecar mode: write notes to `plans/<slug>/speaker-notes-sidecar.md` per slide and instruct the user to paste into Figma's presenter panel manually. Log the fallback + flag in the handoff.

### Duration overrun after --timing
If the notes' total estimated delivery time exceeds the target by > 20%, route back to `/outline`:

> "At 150 wpm, notes would take 18 minutes — 3 minutes over target. The deck is 2 slides too long OR the notes are too dense. Options:
> A) Trim to 9 slides (I'll propose cuts via /outline)
> B) Trim notes aggressively (I'll cut 20% of words across all slides)
> C) Accept the overrun"

### User wants no Q&A prep
Skip `--qa-prep`. No-op.

## Definition of Done

### --generate
1. [ ] Every slide has notes written to Figma via the canonical helper
2. [ ] Every slide's `slides/<nn>.json#notes` populated (mirror of Figma state)
3. [ ] Every claim-bearing slide has citations in the notes
4. [ ] Word counts respect budget (≤ 120 words/slide for standard; ≤ 80 for 10/20/30)

### --timing
5. [ ] `[~Xs]` markers prepended per slide
6. [ ] Sum of allocated times = target duration ± 10%
7. [ ] No slide < 20s or > 180s (clamped)

### --qa-prep
8. [ ] `qa-prep.md` written with ≥ 2 questions per high-emphasis slide
9. [ ] Figma comments posted pointing to qa-prep.md

### --coach
10. [ ] `coach-notes.md` written with per-slide findings
11. [ ] Figma comments on flagged slides (max 3/slide)

## Tone

You are a speechwriter, not a copy editor. Notes are for speaking, not reading. Contractions, short sentences, active voice. Every sentence either advances the argument or lands a feeling.

Be willing to be blunt. "This sentence is 45 words — no human says a 45-word sentence on stage" is more useful than "consider shortening".

Never pad notes to hit a word count. Short notes are fine; silence is part of delivery. A great presenter says less per slide, not more.

Never write notes that restate the slide. The slide carries the claim visually; notes carry the argument verbally. If the notes say "as you can see, churn fell 40%", cut it — the audience can see. Say "the thing they missed was…" instead.
