# Slides Tool Selection

Slides-specific extensions to `shared/tool-selection.md`. These are the Figma-Slides-only tools and the escape hatches for capabilities that don't have typed tools yet (as of 2026-04).

## Slides ↔ figma-console tool map

| What I need | figma-console tool | Notes |
|---|---|---|
| Create a blank slide | `figma_create_slide` | Returns slide nodeId |
| Duplicate a slide | `figma_duplicate_slide` | Fast path for arc repetition (evidence slides, sparkline pairs) |
| Delete a slide | `figma_delete_slide` | — |
| Reorder slides | `figma_reorder_slides` | — |
| List slides in the deck | `figma_list_slides` | Call at session start |
| Focus / navigate to a slide | `figma_focus_slide`, `figma_navigate` | Useful for progressive build |
| Skip slide in presenter | `figma_skip_slide` | For backup / cut-material slides |
| Add text to a slide | `figma_add_text_to_slide` | For simple labeled text. Use `figma_execute` for complex typography. |
| Add shape to a slide | `figma_add_shape_to_slide` | Rectangles, ellipses |
| Set slide background | `figma_set_slide_background` | Solid / gradient — see Color rules in `shared/anti-patterns.md` |
| Set transition | `figma_set_slide_transition` | 7 types; see below |
| Get transition | `figma_get_slide_transition` | For audit / preview |
| Get slide content (tree) | `figma_get_slide_content` | Returns children structure |
| Get focused slide | `figma_get_focused_slide` | What's visible right now |
| Get slide grid | `figma_get_slide_grid` | Deck overview |
| Screenshot a slide | `figma_take_screenshot` | Pass slide nodeId. scale:1 validation, scale:0.5 overview. |
| Instantiate a template master | `figma_instantiate_component` | Variant key, not component set key |
| Set image fill (image layer) | `figma_set_image_fill` | Accepts URL or base64 |
| Search for template masters | `figma_search_components` | Session-scoped IDs |

## Escape hatches (no typed tool — use `figma_execute`)

### Speaker notes
Figma Slides exposes `slide.speakerNotes` via the Plugin API. There is no typed tool. See `shared/speaker-notes-helper.md` for the canonical snippet — **every skill that writes notes MUST use it**, do not re-derive.

### Clearing a slide's contents
```javascript
// Run via figma_execute
const slide = await figma.getNodeByIdAsync('<slideId>');
for (const child of slide.children.slice()) {
  child.remove();
}
```

### Font listing (pre-flight before `setText`)
```javascript
// Run via figma_execute
const fonts = await figma.listAvailableFontsAsync();
const filtered = fonts.filter(f => f.fontName.family.toLowerCase().includes('inter'));
return filtered.map(f => `${f.fontName.family} ${f.fontName.style}`);
```

### Text range styling
```javascript
// Run via figma_execute
const node = await figma.getNodeByIdAsync('<textNodeId>');
await figma.loadFontAsync({ family: "Inter", style: "SemiBold" });
const len = node.characters.length;
node.setRangeFontName(0, len, { family: "Inter", style: "SemiBold" });
node.setRangeFontSize(0, len, 18);
```

### Variable mode switching (dark / light)
See `shared/design-system-loading.md` for the full snippet.

## Slide transitions

7 transition types supported natively:

| Type | Direction | Duration range | When to use |
|---|---|---|---|
| `dissolve` | — | 200–600ms | Default for most slides |
| `push` | left / right / top / bottom | 300–800ms | Between arc beats |
| `slide-in` | left / right / top / bottom | 300–800ms | Section dividers |
| `slide-out` | left / right / top / bottom | 300–800ms | Closing transitions |
| `move-in` | left / right / top / bottom | 300–800ms | Overlay-style |
| `move-out` | left / right / top / bottom | 300–800ms | Overlay dismissal |
| `smart-animate` | — | 400–1200ms | Cross-slide animation (duplicate slide → shift element) |

Use `figma_set_slide_transition` with `{ type, direction, duration, easing }`. Easing options: `linear`, `ease-in`, `ease-out`, `ease-in-out`, `gentle`, `quick`, `bouncy`, `slow`.

## Hard limits (as of 2026-04)

- **No programmatic PDF/PPTX export.** Export is manual: File → Export in Figma UI. Only programmatic artifact is `figma_take_screenshot` per slide.
- **Intra-slide animation is not first-class.** Choreograph via cross-slide Smart Animate: duplicate slide → change one element → set `smart-animate` transition on the duplicate. Figma tweens the difference.
- **No typed tool for speaker notes.** Use Plugin API (`slide.speakerNotes = "..."`) via `figma_execute`.
- **Official Figma MCP does not support Slides.** presentation-kit requires `figma-console`. Any "works on both" claim is false today.
- **Node IDs are session-scoped.** Re-search on every session start; never reuse across conversations.
- **Batch timeout: 30 seconds.** Scripts exceeding this fail silently. Keep `figma_execute` under 20s, split otherwise.

## Duplicate & Modify > Rebuild

For arc-driven repetition (e.g. 3 evidence slides sharing a `2-column` template), use duplicate + modify, not rebuild-from-scratch:

1. Build slide 1 fully (5-layer model).
2. `figma_duplicate_slide` with `slideId: <slide1>`.
3. On the duplicate, mutate only the differing content (`figma_set_instance_properties`, `figma_set_text`, etc.).
4. Repeat for slide 3.

This is ~3× faster than 3 full builds and guarantees visual consistency.

## Placeholder detection

On every `figma_take_screenshot`, scan for:
- "Olivia Rhye", "Phoenix Baker", "Lorem ipsum" — UI kit defaults
- "[Title]", "[Body]", "Heading" — bracket placeholders
- Emoji used as icon substitutes
- Circle placeholders where icons should be

If found, flag and replace. See `shared/anti-patterns.md`.
