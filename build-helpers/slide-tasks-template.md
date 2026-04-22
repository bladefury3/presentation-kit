# Per-Slide Build Tasks Template

Template for a single slide's build sub-plan. Referenced from `tasks.md` via inline slot-fill or `slides/<nn>.tasks.md` for complex slides.

## Context

```markdown
### Slide <index> — "<action title>"

- Template: <template-id>
- Beat: <beat-id> (arc: <arc-type>)
- Tokens: bg=<token>, fg=<token>, accent=<token>
- Duration allocation: ~<seconds>s of the deck's budget
- Depends on: slides/<prev-nn>.json (for smart-animate)
```

## Pre-requisites (before Layer 1)

- [ ] Template master resolved (variantKey = `<40-hex>`)
- [ ] Slide nodeId = `<session-scoped-id>` (from Phase 1 scaffold)
- [ ] Tokens read from `design-system/tokens.json`
- [ ] Fonts pre-flighted for all typography roles on this slide

## Layer 1 — Background

```markdown
- [ ] L1-01 figma_set_slide_background(<slideId>, { color: <token>, opacity: 1.0 })
- [ ] L1-02 figma_take_screenshot(<slideId>, scale=1)
- [ ] L1-V  Validate: bg applied, no transparency
```

## Layer 2 — Structure

```markdown
- [ ] L2-01 figma_instantiate_component(<variantKey>) → <structure-frame-id>
- [ ] L2-02 figma_move_node(<structure-frame-id>, <x>, <y>)
- [ ] L2-03 figma_resize_node(<structure-frame-id>, <w>, <h>)
- [ ] L2-04 figma_take_screenshot(<slideId>, scale=1)
- [ ] L2-V  Validate: structure within 20px slide margins, no overlap with existing nodes
```

If no template master exists (freehand layout), use `figma_execute` with a single script that builds the structure via `mkF()` + `bf()` helpers (see `build-helpers/slide-helpers.js`).

## Layer 3 — Graphics

```markdown
- [ ] L3-01 figma_set_image_fill(<bg-layer-id>, imageUrl="plans/<deck>/images/<nn>-bg.png")
- [ ] L3-02 figma_set_image_fill(<fg-layer-id>, imageUrl="plans/<deck>/images/<nn>-fg.png")
OR for a chart:
- [ ] L3-01 figma_execute run d3-pattern script (see build-helpers/d3-patterns/<pattern>.js)
- [ ] L3-02 Append generated SVG nodes to <slide>
- [ ] L3-03 figma_take_screenshot(<slideId>, scale=1)
- [ ] L3-V  Validate: images rendered, charts have editable text if fonts align
```

## Layer 4 — Typography

For each text slot defined in the template:

```markdown
- [ ] L4-01 figma_add_text_to_slide(<slideId>, { x, y, w, text=<actionTitle>, font=<family + style> })
- [ ] L4-02 figma_execute run text-mastery dance for range styles (if any)
- [ ] L4-03 Set lineHeight, letterSpacing, textAlign per typography.json role
- [ ] L4-NN (repeat for each slot: subtitle, body, caption, etc.)
- [ ] L4-V  figma_take_screenshot(<slideId>, scale=1); validate character counts within budgets
```

## Layer 5 — Polish

```markdown
- [ ] L5-01 Align left-edges of cards to column start coordinates (slide-grid.md)
- [ ] L5-02 Normalize vertical gaps to spacing scale (24 / 32 / 48 / 64)
- [ ] L5-03 Apply accent color to single focal element
- [ ] L5-V  Final figma_take_screenshot(<slideId>, scale=1) → write to plans/<deck>/screenshots/<nn>.png
- [ ] L5-V  Post-build checklist in shared/screenshot-validation.md passes
```

## Exit criteria

- Final screenshot saved
- Squint-test passes (primary element dominates)
- No placeholder text
- Template fidelity preserved
- Character budgets respected
- On-token colors and typography

If any exit check fails after max 3 fix iterations, `figma_post_comment` on the slide and move to next.
