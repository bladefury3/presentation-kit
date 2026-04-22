# Asset Sources

CDN catalog for icons, images, and stock assets. Used by `/image`, `/build`, and `/plan-deck`. Borrowed from `luan007/figma-slides-mcp`.

## Icons

Icons are fetched as SVG from free CDNs. Apply via `figma_set_image_fill` (for raster use, simplest) or `figma_execute` + `figma.createNodeFromSvg` (for recolorable vector).

| Source | URL pattern | Notes |
|---|---|---|
| Lucide | `https://unpkg.com/lucide-static/icons/{name}.svg` | 1400+ icons, clean line style, confirmed working |
| Tabler | `https://unpkg.com/@tabler/icons/icons/outline/{name}.svg` | 4000+ icons, outline + filled |
| Feather | `https://unpkg.com/feather-icons/dist/icons/{name}.svg` | 280 icons, Lucide's predecessor |
| Heroicons | `https://unpkg.com/heroicons/24/outline/{name}.svg` | Tailwind team, 2 weights |
| Phosphor | `https://unpkg.com/@phosphor-icons/core/assets/regular/{name}.svg` | 6 weights available |
| Simple Icons (brand logos) | `https://cdn.simpleicons.org/{brand}/{color}` | 2500+ company/brand marks. Color is hex or "white" / "black". |

### Icon selection rules

- **Default to Lucide** for generic UI icons (arrows, chevrons, status marks).
- **Use Simple Icons** for brand logos (never draw a custom brand logo — licensing risk + inaccuracy).
- **Avoid** decorative icons that don't communicate meaning. If an icon doesn't help comprehension, cut it.
- **Never emoji as icons.** Emoji render inconsistently across OSes and look amateur.

### Icon sizing

Standard sizes within presentation-kit:
- Inline (with text): 16–20px
- Card accent: 24–32px
- Feature highlight: 48–64px
- Oversized hero: 120–200px

Always square-bounded; rectangle icons signal trouble.

## Stock / placeholder images

For image layouts when no user asset is provided AND image generation isn't desired:

| Source | URL pattern | Notes |
|---|---|---|
| Picsum | `https://picsum.photos/{w}/{h}` | Random photo placeholder |
| Picsum by ID | `https://picsum.photos/id/{id}/{w}/{h}` | Specific image, deterministic |
| Picsum filtered | `https://picsum.photos/{w}/{h}?grayscale&blur=2` | Built-in grayscale + blur |
| Unsplash direct | `https://images.unsplash.com/photo-{id}?w={w}&fit=crop` | Named photos; requires photographer credit in footer per Unsplash license |
| Placeholder.co | `https://placehold.co/{w}x{h}/{bg}/{text}` | Solid-color blocks with text — good for wireframe stages |

**Use sparingly.** Most slides should have generated images (`/image`) tuned to brand, not stock. Stock is fine for:
- Placeholder during plan-deck review
- Wireframe fidelity levels
- Quick drafts before commit to brand imagery

### Apply via `figma_set_image_fill`

```
figma_set_image_fill(nodeId, {
  imageUrl: "https://picsum.photos/1200/800",
  scaleMode: "FILL"  // or "FIT", "CROP", "TILE"
})
```

## Generated images (the default for production decks)

See `/image --generate` and `build-helpers/image-provider.js`. External providers:
- **OpenAI** `gpt-image-1` (or `dall-e-3` fallback) — high quality, brand-tunable via style prompt
- **Gemini Imagen** — faster, good for layered decompositions
- **Replicate** — Stable Diffusion variants, tiled generation for layered images

Provider choice lives in `design-system/image-provider.json`. Set once at `/setup`.

### Layered image decomposition (`/image --layered`)

Instead of a single flat image, the skill generates three:
1. **Background** — ambient gradient, texture, or blurred scene
2. **Mid-ground** — primary subject (person, object, diagram)
3. **Foreground** — overlay elements (text-safe negative space, callout shapes)

Each is applied as a separate Figma layer. Text overlays live above the foreground, always editable.

**Why:** Canva Magic Layers pattern. Nobody wants to replace an AI-generated image because the embedded text was wrong — layered images let you edit text independently.

## Attribution

- **Unsplash** — photographer credit in deck footer or bibliography (per their license).
- **Simple Icons** — attribution via their URL; no footer credit needed for brand marks used representationally.
- **Generated images** — no attribution required; do NOT claim human authorship.

Attribution text lives in `plans/<deck>/handoff/attributions.md` (produced by `/handoff`).

## Fetch performance

- CDN assets are cached by Figma once applied via `figma_set_image_fill`. Re-uses are free.
- For high-volume icon usage (10+ on one slide), fetch via `figma_execute` + single network round-trip, not 10 individual `figma_set_image_fill` calls.
- Image generation is slow (10–60s per image depending on provider). `/image --generate` should run async where possible — provide a CLI spinner via Bash.
