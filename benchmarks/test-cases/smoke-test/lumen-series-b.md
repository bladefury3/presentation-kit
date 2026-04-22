# Smoke Test — Lumen Series B Pitch

Canonical end-to-end test case. Every phase of the pipeline must produce the expected artifact for this brief.

## The brief

```
Make me a 10-slide Series B pitch for Lumen, a fictional enterprise
time-tracking startup raising a $40M round.

Audience: tier-1 VCs.
Duration: 15 min.
Arc: Strategic Narrative.
Brand: editorial-serif, warm neutrals.
Key claim: "We killed the trial. Churn fell 40%."
```

## Expected artifacts by phase

### After `/setup`
- `design-system/brand.json` with name=Lumen, audience voice, warm-neutral palette
- `design-system/tokens.json` with editorial-serif typography roles
- `design-system/motion.json` with default transitions (dissolve + smart-animate for beats)
- `design-system/slide-file-structure.md` with Slides file conventions
- Figma Slides file scaffolded with title / section / closing slide placeholders

### After `/setup-templates`
- `design-system/templates/index.json` lists 13+ templates
- Each template JSON has slot definitions and Figma master variantKeys (session-scoped)

### After `/brief`
- `plans/lumen/brief.md` with HMW, audience=VC, CTA="Commit to lead the round", duration=15min

### After `/research`
- `plans/lumen/research.json` with ≥ 20 cited claims
- Each claim has: id, text, source (URL), quote, retrievedAt, confidence

### After `/outline`
- `plans/lumen/outline.md` with 10 H2 action titles (full-sentence takeaways)
- `plans/lumen/ghost-deck.md` with score ≥ 7/10

### After `/arc --type=narrative`
- `plans/lumen/arc.json` with Raskin beats: enemy / promised-land / obstacles / magic-gifts / proof / ask
- Every slide maps to a beat
- `narrative-audit.md` confirms coverage

### After `/style-preview`
- 3 Figma frames rendered with different aesthetics
- `plans/lumen/aesthetic.json` with the committed direction

### After `/plan-deck`
- `plans/lumen/deck.json` with 10 slides[]
- `plans/lumen/slides/<nn>.json` — one per slide with action title, template, beat, content, tokens, sources
- `plans/lumen/tasks.md` — flat execution contract
- No two consecutive slides share a template
- Template coverage ≥ 70%
- Every body claim has `sources[]` entry

### After `/build`
- 10 slides rendered in Figma Slides
- Per-layer screenshots (5 layers × 10 slides = 50 screenshots)
- No placeholder text remaining
- Typography on-token

### After `/image --layered`
- 10 PNGs in `plans/lumen/images/` (flat or bg+mid+fg variants)
- Each applied to its slide via `figma_set_image_fill`
- Text overlays remain on separate editable layers

### After `/motion --transitions --choreograph`
- Every slide has a transition applied
- Key beats have cross-slide smart-animate sequences

### After `/notes --generate --timing --qa-prep`
- `slide.speakerNotes` populated via `figma_execute` on every slide
- `[~90s]` timing markers (summing to ~15 min)
- Anticipated Q&A block per key slide

### After `/rehearse`
- `plans/lumen/rehearsal-report.md` with pacing per slide, flagged long sentences, unpronounceable acronyms

### After `/handoff`
- Parallel QA score ≥ 8/10 composite
- A11y audit table (VPAT-style)
- `plans/lumen/handoff/` bundle with: deck link, screenshots, notes, bibliography, QA report, export checklist

## Scoring (v0.2, LLM-as-judge)

- Narrative coherence: ≥ 8/10
- Visual design: ≥ 7/10
- Content quality: ≥ 8/10
- Accessibility: ≥ 8/10
- Citations: 10/10 (binary — all or none)

Composite ≥ 8/10 gates pass.

## Known gotchas

- Figma Slides may not have all fonts loaded on first install — `/setup` must validate Playfair + Inter availability.
- External image provider may rate-limit; 10 images may take 5–10 min.
- Speaker-notes escape hatch (Plugin API) must be confirmed on day one via the smoke-test script.
