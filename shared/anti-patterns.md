# Anti-Patterns

WRONG / RIGHT pairs that catch silent failures. Placeholder detection and error recovery are folded in here. Consult before building any slide.

Borrowed from `luan007/figma-slides-mcp` anti-patterns format, extended for `figma-console` quirks.

## Color & fill

- ✗ `{ r: 1, g: 0.3, b: 0, a: 0.5 }` — alpha on color object
- ✓ `{ type: "SOLID", color: { r: 1, g: 0.3, b: 0 }, opacity: 0.5 }` — opacity on fill

- ✗ Gradient fills without `gradientTransform`
- ✓ Include `gradientTransform: [[a, b, tx], [c, d, ty]]` (2×3 affine matrix)

- ✗ More than 2 accent colors in a deck
- ✓ 1 accent + 1 complement max; rest grayscale

## Text & fonts

- ✗ `"Inter Semi Bold"` (extra space)
- ✓ `"Inter SemiBold"` (exact form from `listAvailableFontsAsync`)

- ✗ Setting `text.characters = "..."` before loading the font
- ✓ `await figma.loadFontAsync({ family, style })` first, then set characters

- ✗ Guessing character count for `setRangeFontName`
- ✓ Read actual length via `text.characters.length`, use `indexOf` for substring positions

- ✗ Text without `width` set (overflow risk)
- ✓ Always set `width` on multi-line text nodes

- ✗ Ignoring `lineHeight` and `letterSpacing` (defaults look generic)
- ✓ Set both; see `PRINCIPLES.md#typography-role-mapping` for values

- ✗ `list_fonts` with no query param (returns 2000+ fonts; likely to hit timeout)
- ✓ `list_fonts(query: "Inter")` always filtered

## Nodes & z-order

- ✗ Assuming z-order flips between nodes
- ✓ Elements render in creation order — create backgrounds FIRST, overlays LAST

- ✗ Reusing node IDs from a previous conversation
- ✓ Node IDs are session-scoped. Always `figma_search_components` at session start.

- ✗ Using `figmaKey` (component set) for `figma_instantiate_component`
- ✓ Use `variantKey` (specific variant) — a 40-char hex hash. Check `design-system/templates/<id>.json`.

## Batching

- ✗ 30+ commands in a single `figma_execute` script
- ✓ Max 8–12 mixed ops (with `setText` + font loading); 20 safe for shape-only

- ✗ Referring to a failed command's output with `$N.nodeId`
- ✓ Separate by logical unit; get literal IDs before reuse

- ✗ `figma_execute` scripts exceeding 30 seconds (hard timeout — fails silently)
- ✓ Split into smaller scripts; keep each under 20s

## Slides API

- ✗ Trying to `figma_create_slide` on a non-Slides file (Design or FigJam)
- ✓ Verify editor type is Slides via `figma_get_file_data({verbosity: "summary"})` first

- ✗ Using `createTable`, `createShapeWithText`, `createVideoAsync` in Slides
- ✓ These are Design-mode only. Use basic shapes + layouts in Slides.

- ✗ `foreignObject` in SVG for slide graphics
- ✓ Figma parser strips `foreignObject`. Use plain SVG primitives.

- ✗ Satori-rendered text assumed editable
- ✓ Satori renders text as paths (non-editable). Use D3 or native nodes for editable text.

- ✗ Trying to export PDF/PPTX programmatically
- ✓ Export is manual — File → Export in Figma UI. `/handoff` produces an `export-checklist.md`.

## Speaker notes

- ✗ Trying to use a typed tool for slide.speakerNotes (there isn't one)
- ✓ `figma_execute` with the snippet in `shared/speaker-notes-helper.md`

- ✗ Setting `speakerNotes` on a non-slide node (e.g. a text node or a frame)
- ✓ Check `slide.type === "SLIDE"` before assigning

## Placeholder text detection

Flag and replace ANY of these in slides (never ship):

**Named person placeholders (common UI kits):**
- "Olivia Rhye", "Phoenix Baker", "Lana Steiner", "Candice Wu", "Natali Craig"
- "olivia@untitledui.com", "phoenix@untitledui.com", etc.
- Any name + email + role triplet from a UI kit

**Generic placeholders:**
- "Lorem ipsum" (any Latin filler)
- "[Title]", "[Description]", "[Subtitle]" — bracket placeholders
- "Heading", "Subheading", "Body text" — style names used as content
- "Text", "Label", "Value" — property names used as content

**Default numeric placeholders:**
- "100", "$100.00", "1,234" — round placeholder values (replace with real data or flag)

**Default nav items (from sidebar UI kits):**
- "Home", "Dashboard", "Projects", "Tasks", "Reporting", "Users" appearing together

**When acceptable:** Never. The presentation-kit is final-content-only. If real data isn't available, flag the slide and ask the user.

## AI slop anti-patterns (specific to slides)

- ✗ 3-column generic card grid on every slide — default AI output
- ✓ Layout variety: enforced at `plan-deck`. No two consecutive same-template slides.

- ✗ Stock hero image (unnamed people on laptops, gradient overlay)
- ✓ Generated image tuned to brand via `/image`, OR cut the image entirely

- ✗ Bullet list when a chart / diagram / comparison would carry the idea
- ✓ Visualization chooser at plan time (`shared/visualization-chooser.md`)

- ✗ Centered-everything uniform 3-column grid
- ✓ Asymmetric layouts (at least 30% of slides off-center)

- ✗ "Clean modern" as the stated aesthetic direction
- ✓ `/style-preview` produces 3 distinct aesthetic directions; user picks one — no generic defaults

- ✗ Equal visual weight on every element
- ✓ One primary element per slide (Von Restorff)

- ✗ Section divider that is just the word "Problem" on a blank slide
- ✓ Section divider includes a transitional visual OR sets up the next beat

- ✗ First bullet restates the slide title
- ✓ Cut the first bullet — action title is the takeaway

## Error recovery patterns

### When `figma_execute` returns `ok: false`

1. **Read the error message** — many MCP errors include available property names / valid options in the response.
2. **Check node type** — e.g. trying to `instantiate_component` on a deleted node returns type mismatch.
3. **Re-run `figma_search_components`** — node IDs may be stale.
4. **Reduce batch size** — split the script into smaller pieces.
5. **Verify font loaded** — `loadFontAsync` failures cascade silently.

### When a screenshot shows unexpected content

1. **Don't re-run the same op** — diagnose first.
2. **Read the slide content** with `figma_get_slide_content(slideId)` to see the actual tree.
3. **Check for placeholder text** with the list above.
4. **Check for phantom heights** — frames stuck at default 100px.
5. **Screenshot the parent frame, not just the slide** — reveals canvas positioning issues.

### When you hit 3 fix iterations

1. **Leave a Figma comment** on the slide via `figma_post_comment` describing the issue.
2. **Log to `build-log.md`** with the failure context.
3. **Move on** — `/handoff --audit` will surface it at the end.
4. **Do NOT keep trying.** Endless fix loops waste tokens and rarely recover.
