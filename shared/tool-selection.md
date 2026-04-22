# Tool Selection

Decision tree for choosing the right figma-console MCP tool. Using the wrong tool is the #1 source of silent failures. For Slides-specific tools, see `shared/slides-tool-selection.md`.

## Creating content

| I need to... | Use this | NEVER this |
|---|---|---|
| Place a library component | `figma_instantiate_component` | `figma_execute` with `createComponent()` |
| Create a slide | `figma_create_slide` | `figma_execute` to author a frame, then convert |
| Add text to a slide | `figma_add_text_to_slide` | `figma_execute` to create text then parent |
| Add a shape to a slide | `figma_add_shape_to_slide` | `figma_execute` for single rectangles |
| Create a complex node tree (auto-layout) | `figma_execute` (Plugin API) | Multiple chained typed tools |
| Set an image fill from URL or base64 | `figma_set_image_fill` | `figma_execute` (unless chained with other ops) |

## Modifying content

| I need to... | Use this | NEVER this |
|---|---|---|
| Set text on an instance | `figma_set_instance_properties` | `figma_execute` with tree walk (fails silently) |
| Toggle boolean props | `figma_set_instance_properties` | `figma_execute` |
| Set fill color | `figma_set_fills` | inline colors in `figma_execute` when a typed tool exists |
| Set stroke | `figma_set_strokes` | — |
| Move a node | `figma_move_node` | `figma_execute` for simple moves |
| Resize a node | `figma_resize_node` | `figma_execute` for simple resizes |
| Rename a node | `figma_rename_node` | `figma_execute` |
| Delete a node | `figma_delete_node` | `figma_execute` |
| Set slide transition | `figma_set_slide_transition` | `figma_execute` (typed tool is simpler) |
| Reorder slides | `figma_reorder_slides` | `figma_execute` |
| Skip a slide in presenter mode | `figma_skip_slide` | `figma_execute` |
| **Set slide speaker notes** | `figma_execute` (NO typed tool exists) | N/A — see `shared/speaker-notes-helper.md` |

## Reading content

| I need to... | Use this | Notes |
|---|---|---|
| Full design system | `figma_get_design_system_kit` | One call replaces 3–4 individual calls |
| Specific token values | `figma_get_token_values` | Faster than full kit for targeted lookups |
| Component search | `figma_search_components` | Session-scoped IDs; re-run at session start |
| Component details | `figma_get_component_details` | For variant axes and properties |
| File structure | `figma_get_file_data` | Use `verbosity: "summary"` first |
| Current selection | `figma_get_selection` | For user-directed operations |
| Text styles | `figma_get_text_styles` | For typography token extraction |
| All slides in the deck | `figma_list_slides` | — |
| Slide content (tree) | `figma_get_slide_content` | Pass slide nodeId |
| Focused slide | `figma_get_focused_slide` | What's visible in presenter/editor |
| Slide grid (deck overview) | `figma_get_slide_grid` | All slides in a grid layout |

## Screenshots

| I need to... | Use this | Notes |
|---|---|---|
| Validate after building a slide | `figma_take_screenshot` | Pass `nodeId` of the slide. scale:1 for validation. |
| Capture for deck overview | `figma_take_screenshot` at scale:0.5 | Overviews only |
| Capture for analysis | `figma_capture_screenshot` | AI-optimized: 1x PNG, auto-caps at 1568px |

## CRITICAL: variantKey vs figmaKey

Components have TWO keys. Using the wrong one causes silent failures.

- **figmaKey** — identifies the COMPONENT SET (the parent). Used for reference only.
- **variantKey** (or `defaultVariantKey`) — identifies a SPECIFIC VARIANT. This is what `figma_instantiate_component` needs.

```
WRONG: figma_instantiate_component with componentKey: "8022:24550" (component set key)
RIGHT: figma_instantiate_component with componentKey: "8017:532994" (variant key)
```

Check `design-system/templates/<id>.json` for `figmaMaster.variantKey`, not `figmaMaster.componentSetKey`.

## When to use figma_execute

Reserve `figma_execute` for operations that CANNOT be done via typed tools, OR for batches where typed tools would cause round-trip chatter:

- **Speaker notes** — `slide.speakerNotes = "..."` (no typed tool; see `shared/speaker-notes-helper.md`)
- **Text range styles** — `setRangeFontName`, `setRangeFontSize`, `setRangeFills` with pre-computed positions (see `shared/text-mastery.md`)
- **Multi-step frame creation with auto-layout + token bindings** — avoids per-step round trips
- **Font pre-flight** — `figma.listAvailableFontsAsync()` filtered by query
- **Batch ops on multiple nodes** — single `figma_execute` is faster than N typed calls
- **Variable mode switching** — `setExplicitVariableModeForCollection()`

**Timeout guidance:**
- Simple operations: 5s (default)
- Component instantiation + property setting: 10s
- Full slide build (5-layer model, 5–15 elements): 15–20s
- Never exceed 25s — split into multiple calls instead

**Batch limits (figma-console):**
- Pure shape ops: up to ~20 in one script
- Text ops with font loading: 8–12 max
- 30-second hard timeout — longer scripts fail silently
