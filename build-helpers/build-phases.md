# Build Phases

The execution pipeline used by `/build`. Mirrors design-kit's phased build model, adapted for slides + the 5-layer build model.

## Phase 0 — Pre-flight

Before any mutation:

- [ ] `figma_list_slides` — confirm deck structure
- [ ] `figma_search_components` — resolve all template master variantKeys (session-scoped)
- [ ] Read `design-system/tokens.json`, `typography.json`, `motion.json`, `templates/index.json`
- [ ] Read `plans/<deck>/deck.json`, `slides/*.json`, `tasks.md`
- [ ] Font pre-flight via `figma.listAvailableFontsAsync()` for every typography role in use
- [ ] Verify `tasks.md` validates against schemas; refuse to proceed on schema errors

**Exit gate:** all artifacts read, all keys resolved, all fonts loaded. If any fail, stop and escalate.

## Phase 1 — Scaffold

For each slide in order:

- [ ] `figma_create_slide` (or `figma_duplicate_slide` for arc repetition)
- [ ] Record slide nodeId back into `slides/<nn>.json` (session-scoped; for this run only)

No content yet. Just empty slides in the right order.

**Exit gate:** deck has the correct number of slides in the correct order; `figma_list_slides` confirms.

## Phase 2 — Build each slide (5-layer model)

For each slide, in order:

### Layer 1 — Background
- Apply `figma_set_slide_background` with token-bound color
- Screenshot (scale:1) → validate → fix (max 3 iterations) → verify

### Layer 2 — Structure
- Instantiate template master via `figma_instantiate_component` (if template has a Figma master)
- OR build structure from scratch via `figma_execute` (auto-layout frames, cards, panels)
- Screenshot → validate → fix → verify

### Layer 3 — Graphics
- Place images via `figma_set_image_fill` (layered variants as separate layers)
- Render charts via D3 pattern (delegate to `build-helpers/d3-patterns/<pattern>.js` → SVG → Figma nodes)
- Place icons from Lucide / Simple Icons CDN
- Screenshot → validate → fix → verify

### Layer 4 — Typography
- `figma_add_text_to_slide` for each text slot
- Apply range styles via `figma_execute` + text-mastery dance (see `shared/text-mastery.md`)
- Check character budgets from PRINCIPLES.md
- Screenshot → validate → fix → verify

### Layer 5 — Polish
- Align left-edges of cards (same x-coordinate)
- Normalize vertical gaps per `shared/slide-grid.md` spacing scale
- Apply one accent color to the single focal element (Von Restorff)
- Screenshot → final validation → write to `plans/<deck>/screenshots/<nn>.png`

**Exit gate per slide:** the post-build slide checklist in `shared/screenshot-validation.md` passes.

## Phase 3 — Transitions

After all slides exist:

- For each slide, apply `figma_set_slide_transition` from `slides/<nn>.json#transition`
- Spot-check in deck grid view via `figma_set_slides_view_mode("grid")`
- Test transitions in presenter mode (manual step — surface in export-checklist.md)

**Exit gate:** every slide has a `transition` applied; none are left at default dissolve-with-no-direction.

## Phase 4 — Speaker notes

Using the canonical snippet from `shared/speaker-notes-helper.md`:

- For each slide, apply `slide.speakerNotes` via batched `figma_execute`
- Verify via `slide.speakerNotes.length` matches what was written

**Exit gate:** every slide has notes. None empty.

## Phase 5 — Validation

- [ ] `handoff --audit` runs design + a11y audits
- [ ] `parallel-qa` scores ≥ 8/10 composite
- [ ] Healing loop iterates up to 3× if under threshold
- [ ] `screenshots/*.png` deck saved for handoff
- [ ] Export checklist written for manual File → Export step

**Exit gate:** composite score ≥ 8/10 OR user explicitly accepts lower score.

## Principles

1. **One slide at a time.** Never build 3 slides in parallel — validation cascades go wrong.
2. **Screenshot between every layer.** No blind sequences.
3. **Fix immediately.** Don't accumulate defects across slides.
4. **Batch intelligently.** Use `figma_execute` for layer-internal ops, typed tools for cross-slide ops.
5. **Surface flagged issues at the end.** If a slide fails after 3 fix iterations, comment on the slide and keep going.
