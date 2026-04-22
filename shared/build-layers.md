# Build Layers — The 5-Layer Build Model

Every slide is constructed in this order. Screenshot between every layer. Used by `/build`. Borrowed from `luan007/figma-slides-mcp` with presentation-kit adaptations.

> **Layering dogma:** Think in layers, build in modules. Never generate a slide in one shot.

## Layer order

| # | Layer | What it contains | Tools |
|---|---|---|---|
| 1 | **Background** | Slide fill, gradient, or base photo | `figma_set_slide_background`, `figma_set_image_fill` |
| 2 | **Structure** | Cards, panels, dividers, region rectangles (auto-layout containers) | `figma_add_shape_to_slide`, `figma_execute` (for complex auto-layout) |
| 3 | **Graphics** | Charts (D3 patterns), diagrams, icons, layered images | `figma_set_image_fill` + D3 script via `figma_execute`, `figma_add_shape_to_slide` |
| 4 | **Typography** | Action title, body, labels, accents | `figma_add_text_to_slide`, `figma_execute` for range styling |
| 5 | **Polish** | Alignment fixes, spacing tweaks, accent details, subtle dividers | Typed tools for nudges + `figma_execute` for batches |

## The Loop (mandatory)

After each layer:

1. **Create** — execute layer operations
2. **Screenshot** — `figma_take_screenshot` at scale:1 with the slide nodeId
3. **Assess** — check against the per-layer checklist below
4. **Fix** — if issues found, fix immediately (max 3 iterations)
5. **Verify** — screenshot again
6. **Next** — move to the next layer

You will get coordinates wrong, text will overlap, sizing will be off — that's expected. The discipline is catching it immediately, not after 5 slides.

## Per-layer checklist

### Layer 1 — Background
- [ ] Background actually applied (slide isn't transparent white)
- [ ] Opacity is on the fill object, not in the color ({ r:..., g:..., b:..., opacity: 0.5 })
- [ ] Gradient has `gradientTransform` (2×3 affine matrix) if gradient
- [ ] Color matches `tokens.color.bg.<slide-role>` from `tokens.json`

### Layer 2 — Structure
- [ ] All cards / panels placed within slide bounds (min 20px padding from edges)
- [ ] Auto-layout set on containers (not manual positioning)
- [ ] No overlapping rectangles where distinct regions are intended
- [ ] Card borders use `rgba(white, 0.08)` on dark bg, or token equivalent
- [ ] `clipsContent = false` on frames that should expand with content

### Layer 3 — Graphics
- [ ] Icons from Lucide / Simple Icons (not emoji substitutes)
- [ ] Charts render via correct D3 pattern for the data shape (see `shared/visualization-chooser.md`)
- [ ] Images have `alt` metadata attached (for a11y)
- [ ] Layered images: bg + mid + fg as separate Figma layers, not a flat composite
- [ ] Image fills applied (no transparent placeholder rectangles)

### Layer 4 — Typography
- [ ] Fonts pre-flighted via `figma.listAvailableFontsAsync()` before `setText`
- [ ] Text-mastery dance: create → setText → read actual length → apply range styles
- [ ] `width` set on multi-line text (prevents overflow)
- [ ] `lineHeight` and `letterSpacing` explicitly set (not defaults)
- [ ] Action title is a full sentence (not a topic label)
- [ ] Character counts within budget per `PRINCIPLES.md#character-budgets`
- [ ] Typography roles match `typography.json` (section-label, heading, body, caption, accent)

### Layer 5 — Polish
- [ ] Alignment lines consistent across cards (same x-coordinates)
- [ ] Vertical rhythm: consistent gaps between sections
- [ ] Accent color used for exactly 1 focal element (Von Restorff)
- [ ] No placeholder text remaining (see `shared/anti-patterns.md`)
- [ ] One primary element wins the eye (check via squint-test: does the takeaway pop?)

## Screenshot scale discipline

| Intent | Scale | Purpose |
|---|---|---|
| Per-layer validation | 1 | Native 1920×1080, catches sub-pixel issues |
| Final slide verification | 1 | Ships to `screenshots/<nn>.png` |
| Deck overview | 0.5 | Contact-sheet, never for validation |
| Never | 2 or 4 | Wasted tokens unless zooming into a specific defect |

## Batch operation guidance

For layers that create many nodes (e.g. Layer 2 building 4 cards + dividers), use `figma_execute` with a single Plugin API script. Limits:
- 8–12 mixed operations max (includes `setText` + font loads)
- 20 pure shape operations safe
- 30-second hard timeout

If a script fails silently, it's likely too long — split. See `shared/slides-tool-selection.md#hard-limits`.

## Exit criteria (move to next slide only when)

- All 5 layers complete
- Final screenshot passes the squint-test (one primary element dominates)
- No placeholder text
- All typography on-token
- Template coverage counted in `plan-deck` still ≥ 70%

If you have to flag (max 3 iterations reached, still broken), leave a comment on the slide via `figma_post_comment` and move on. Surface in `handoff --audit`.
