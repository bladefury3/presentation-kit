# Slide Grid — Coordinates + Canvas Positioning

Deterministic coordinate grid for 1920×1080 Figma Slides. Use these ranges so slides have consistent rhythm across a deck. Borrowed from `luan007/figma-slides-mcp`.

## Vertical regions (Y axis)

| Region | Y range | Usage |
|---|---|---|
| Top margin | 0–50 | Empty — breathing room above the label |
| Top label | 50–70 | Section name, mono font, accent color (e.g. "EVIDENCE" / "PROMISED LAND") |
| Action title | 85–170 | Large serif heading — the slide's one takeaway |
| Subtitle / divider area | 170–220 | Short supporting text, divider line, or empty |
| Content zone | 230–750 | Cards, charts, images, body text |
| Footer tagline | 780–830 | Pull quote, summary line, callout (optional) |
| Brand footer | 1000–1060 | Logo, page number, attribution |
| Bottom margin | 1060–1080 | Empty |

## Horizontal column layouts

### Full width (1 column)
- x=115, width=1690
- For: title slides, section dividers, image-full-bleed, pull quotes

### Two columns
- Left: x=115, width=800
- Right: x=1000, width=800
- For: `2-column`, `comparison`, What-Is / What-Could-Be (Sparkline), contrast slides

### Three columns
- Col 1: x=115, width=520
- Col 2: x=670, width=520
- Col 3: x=1225, width=520
- For: `3-column`, feature triples, team cards

### Four columns
- Col 1: x=115, width=400
- Col 2: x=540, width=400
- Col 3: x=965, width=400
- Col 4: x=1390, width=400
- For: metric rows (4 stats), step sequences

### Asymmetric (left-heavy)
- Left: x=115, width=780 (primary content)
- Right: x=1000, width=800 (supporting visual or sidebar)
- For: headline + supporting chart, story + image

## Spacing scale

| Use | Value (px) |
|---|---|
| Card inner padding | 24 |
| Section inner padding | 48 |
| Gap between cards (horizontal) | 24 |
| Gap between rows (vertical) | 32 |
| Gap between major regions | 64 |

## Minimum padding rule

**Never crop to the edge.** Minimum 20px from slide bounds on all sides. 50px+ is healthier. If the design wants edge-to-edge (image-full-bleed template), the text overlay still respects the 50px margin.

## Canvas positioning

When placing a new element in an already-populated slide:

1. **Read existing children** — `figma_get_slide_content(slideId)` to enumerate current nodes + bounds.
2. **Compute occupied regions** — extract x, y, width, height for each child.
3. **Find gaps** — subtract occupied regions from the 1920×1080 canvas.
4. **Place new element** in the largest available gap that fits.

```javascript
// Canvas scan helper (run via figma_execute)
const slide = await figma.getNodeByIdAsync('<slideId>');
const occupied = slide.children.map(c => ({
  x: c.x, y: c.y, w: c.width, h: c.height
}));
// Check if a candidate region (cx, cy, cw, ch) overlaps any occupied rect
function overlaps(cx, cy, cw, ch) {
  return occupied.some(o =>
    cx < o.x + o.w && cx + cw > o.x &&
    cy < o.y + o.h && cy + ch > o.y
  );
}
```

**Never overlap existing content.** If no gap fits, either resize the candidate or move existing nodes (with user consent via `AskUserQuestion`).

## Applying the grid

When building a slide:

1. Pick the column layout based on the template.
2. Snap every x-coordinate to a column start.
3. Snap every y-coordinate to a region boundary.
4. After placement, screenshot and visually verify alignment lines are intact.

Deviation from the grid is allowed for creative effect (Layer 5 Polish), but always deliberate — not accidental.
