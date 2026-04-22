# Text Mastery

Text is the #1 source of silent failures in Figma Slides. Wrong font names fail silently. Character-count off-by-ones break range styling. Unicode / emoji / CJK have length surprises. This helper defines the **mandatory** sequence for any non-trivial text.

Borrowed from `luan007/figma-slides-mcp` "Text Mastery Dance".

## Font pre-flight (always)

Before any `setText` or `figma_add_text_to_slide` on a new text node, verify the font is available. Wrong font names fall back to the system default — silently.

```javascript
// Run via figma_execute
const fonts = await figma.listAvailableFontsAsync();
const match = fonts.find(f =>
  f.fontName.family === "Inter" && f.fontName.style === "SemiBold"
);
if (!match) {
  throw new Error(`Font 'Inter SemiBold' not available. Available Inter styles: ${
    fonts.filter(f => f.fontName.family === "Inter").map(f => f.fontName.style).join(", ")
  }`);
}
```

**Font name format matters:**
- ✓ `"Inter SemiBold"` (exact form from `listAvailableFontsAsync`)
- ✗ `"Inter Semi Bold"` (extra space — fails silently)
- ✗ `"Inter semibold"` (lowercase — fails silently)

Cache the font-pre-flight result per session in a helper dict so you don't re-query for every text node.

## The Text Mastery Dance (for range styling)

To apply range styles (bold/italic/color on a substring), never guess character positions. The sequence is:

```javascript
// 1. Create the text node with placeholder content
const text = figma.createText();
text.x = 115;
text.y = 85;
text.resize(1200, 100);  // Always set width for wrapping

// 2. Load font FIRST (must be loaded before setting characters)
await figma.loadFontAsync({ family: "Inter", style: "Regular" });

// 3. Set the full text
text.characters = "Our churn fell 40% after we killed the trial.";

// 4. Read the actual length (never guess)
const len = text.characters.length;

// 5. Load any additional fonts needed for range styles
await figma.loadFontAsync({ family: "Inter", style: "SemiBold" });

// 6. Apply range styles using real positions
// Find the "40%" substring
const str = text.characters;
const start = str.indexOf("40%");
if (start !== -1) {
  const end = start + "40%".length;
  text.setRangeFontName(start, end, { family: "Inter", style: "SemiBold" });
  text.setRangeFontSize(start, end, 28);
  text.setRangeFills(start, end, [{ type: "SOLID", color: { r: 1, g: 0.3, b: 0 } }]);
}
```

**Key rules:**
- **Load font BEFORE setting characters.** `text.characters = "..."` throws if font not loaded.
- **Load font BEFORE setRangeFontName.** Each font variant (Regular, SemiBold, Bold) must be loaded separately.
- **Read `text.characters.length`** — never assume the string length matches what you passed (Unicode / emoji / combining characters differ).
- **Use indexOf for substring positions** — never count bytes.

## Text properties (always set these)

For every text node:

| Property | Why |
|---|---|
| `resize(width, height)` | Prevents overflow; controls wrapping |
| `textAutoResize` | `"HEIGHT"` for multi-line, `"NONE"` for fixed |
| `lineHeight` | `{ unit: "PERCENT", value: 120 }` — defaults look generic |
| `letterSpacing` | `{ unit: "PERCENT", value: -2 }` for display type — defaults look loose |
| `textAlignHorizontal` | `"LEFT"`, `"CENTER"`, `"RIGHT"` — property on node, NOT a range style |
| `textAlignVertical` | `"TOP"`, `"CENTER"`, `"BOTTOM"` |
| `fills` | Token-bound; never hardcoded hex |

## Unicode / emoji / CJK gotchas

| Input | `characters.length` | Why |
|---|---|---|
| `"Hello"` | 5 | Straightforward |
| `"Café"` | 4 | Accented char is 1 code unit |
| `"日本語"` | 3 | CJK chars are 1 code unit |
| `"👍"` | 2 | Emoji is a surrogate pair (2 UTF-16 code units) |
| `"👨‍💻"` | 5 | ZWJ sequences are multiple units |

Never calculate positions by counting visible characters. Always use `indexOf` on the actual `text.characters` value.

## Text budgets (from PRINCIPLES.md)

| Slot | Budget | What happens if over |
|---|---|---|
| Action title | 70 chars | Flag in `/outline`; rewrite or split slide |
| Section label | 25 chars | Truncate or rephrase |
| Stat primary | 6 chars | Abbreviate (e.g. "$2.3B" not "$2,300,000,000") |
| Stat label | 40 chars | Shorten |
| Body paragraph | 140 chars | Split into multiple slides |
| Pull quote | 180 chars | Edit down or break across two slides |
| Caption / meta | 80 chars | Truncate with ellipsis |
| Speaker notes (per slide) | 120 words | Trim; speaker-coach pass will flag |

Enforced by `/layout-pack` inside `/build`. Overflow gets fixed pre-build, not post-screenshot.

## Font name lookup table (starting point)

For brand setup. `/setup-deck` asks the user their preferred font family and verifies availability.

**Common Figma-available fonts:**
- Sans: `Inter`, `DM Sans`, `SF Pro Text`, `IBM Plex Sans`
- Serif: `Playfair Display`, `DM Serif Display`, `Fraunces`, `IBM Plex Serif`
- Monospace: `JetBrains Mono`, `IBM Plex Mono`, `Space Mono`, `Inter Mono`
- Typical weight styles: `Regular`, `Medium`, `SemiBold`, `Bold`, `Light`, `ExtraLight`

If the user's preferred font is missing, `/setup-deck` prompts for a fallback from the above list, and writes the chosen font to `design-system/typography.json`.
