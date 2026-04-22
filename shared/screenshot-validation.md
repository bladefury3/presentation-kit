# Screenshot Validation

Visual validation after creating or modifying any slide element. Every skill that mutates a slide reads this.

## Which screenshot tool

| Tool | How it works | Best for |
|---|---|---|
| `figma_take_screenshot` | REST API. Up to 4× scale; PNG/JPG/SVG/PDF. Pass `nodeId`. | **Validation after building.** Pass the slide nodeId for per-layer checks. |
| `figma_capture_screenshot` | Desktop Bridge (Plugin API). 1× PNG, auto-caps at 1568px. | **Analysis during planning.** Faster, lighter, for inspecting existing decks. |

Default: `figma_take_screenshot` for build validation, `figma_capture_screenshot` for exploratory analysis.

## Scale discipline

| Scale | Use | Size |
|---|---|---|
| 1 | Per-layer validation (mandatory), final slide verification, handoff screenshots | 1920×1080 native |
| 0.5 | Deck-overview contact sheet (never for validation) | 960×540 |
| 2 or 4 | Zooming into a specific defect only | 3840×2160+ |

**scale:1 for all validation.** scale:0.5 miscounts sub-pixel alignment issues.

## The loop (after every meaningful mutation)

1. **Screenshot** — `figma_take_screenshot(slideNodeId, scale=1)`
2. **Check** — run the per-layer checklist in `shared/build-layers.md` OR the post-build checklist below
3. **Fix** — address issues immediately (max 3 iterations per layer)
4. **Re-screenshot** — verify the fix
5. **Record** — on final passes, write screenshot to `plans/<deck>/screenshots/<nn>.png`

## When to screenshot

| After… | Screenshot… |
|---|---|
| Creating a slide background (Layer 1) | The slide |
| Adding structure — cards / panels (Layer 2) | The slide |
| Placing graphics / charts / images (Layer 3) | The slide |
| Adding text (Layer 4) | The slide |
| Polish pass (Layer 5) | The slide |
| Applying transitions (between slides) | Not per-slide — use deck grid view instead |
| Completing a full slide | Final scale:1 — write to `screenshots/<nn>.png` |

**One slide at a time.** Build slide N's 5 layers → screenshot → fix → move to slide N+1. Never build 3 slides before validating.

## Post-build slide checklist

Every final slide screenshot must pass:

- [ ] **Primary element wins the eye.** Squint-test: the action title and one focal element are visibly dominant.
- [ ] **No placeholder text.** Scan for "Olivia Rhye", "Lorem", "[Title]", "Heading", "Body text", "Label", "100", "$100.00" (see `shared/anti-patterns.md`).
- [ ] **No phantom heights.** No frame stuck at default 100px from `frame.resize(w, 100)` — auto-layout should HUG expand.
- [ ] **No clipped content.** Text or elements not cut off by container bounds.
- [ ] **No emoji icons.** Icons come from Lucide / Simple Icons / etc.; emoji substitutes are banned.
- [ ] **No overlapping content.** Canvas positioning respected; no layered rectangles where distinct regions intended.
- [ ] **Alignment lines consistent.** Left edges of cards align. Right edges align. Gaps are uniform.
- [ ] **Typography on-token.** Sizes, weights, tracking match `typography.json` roles.
- [ ] **Color usage disciplined.** 1–2 accent colors max. Rest grayscale. Accent highlights have meaning.
- [ ] **Template fidelity.** If template is `stat-callout`, slide actually follows stat-callout layout. If `comparison`, parallel structure is present.
- [ ] **Action title is a sentence.** Not a topic label.
- [ ] **One idea per slide.** Not stacking multiple takeaways.

Any ✗ blocks the "done" state. Fix or flag and move on — surfaces in `handoff --audit`.

## Common fixes

| Issue | Fix |
|---|---|
| 100px phantom height | `frame.resize(width, 1)` — auto-layout HUG expands |
| Unwanted property labels (e.g., "Label" showing on a button instance) | `figma_set_instance_properties` with `{ "Label": false }` |
| Default placeholder text from UI kits | `figma_set_instance_properties` or tree walk with replacement |
| Content clipped | `frame.clipsContent = false` on every frame |
| Overlapping existing content | Reposition using canvas scan (see `shared/slide-grid.md`) |
| Text overflow / text not wrapping | Set `width` on the text node; multi-line requires explicit width |
| Font shows as fallback (generic) | Font wasn't pre-flighted — run `figma.listAvailableFontsAsync()` first (see `shared/text-mastery.md`) |
| Accent color "too busy" | Reduce to 1 accent; rest grayscale per `PRINCIPLES.md#color-system` |

## Max iterations

3 fix attempts per layer. If still broken after 3, leave a Figma comment on the slide via `figma_post_comment`, mark the issue in `build-log.md`, and move on. Final `handoff --audit` surfaces all flagged issues.
