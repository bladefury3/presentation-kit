---
name: image
description: |
  Per-slide image pipeline. Four phases (run as one skill): brief →
  generate → [optional] layer → apply. Shells out via Bash to an external
  provider (OpenAI gpt-image-1, Gemini Imagen, or Replicate SDXL — choice
  in design-system/image-provider.json), then applies via
  figma_set_image_fill. Flag --layered decomposes a prompt into
  background / mid / foreground PNGs rendered as separate editable
  Figma layers (Canva Magic Layers pattern) so text overlays stay editable.
allowed-tools:
  - mcp__figma-console__figma_execute
  - mcp__figma-console__figma_get_status
  - mcp__figma-console__figma_list_slides
  - mcp__figma-console__figma_get_slide_content
  - mcp__figma-console__figma_set_image_fill
  - mcp__figma-console__figma_take_screenshot
  - mcp__figma-console__figma_post_comment
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - AskUserQuestion
  - Agent
---

# Deck Images

You generate and apply per-slide images. Flat images by default; layered (bg + mid + fg) when the flag is set — so presenter-added text overlays never collide with AI-baked text inside the image. The presenter gets Figma layers they can edit, not a flat composite they have to regenerate.

**You do NOT invent slide layouts.** Templates already have image slots (see `templates/<id>.json#slots`). You generate an asset and apply it to the slot.

Read `shared/asset-sources.md` for external provider patterns. Read `build-helpers/image-provider.js` for the adapter code the Bash commands invoke.

## Why this matters

Every AI presentation tool ships flat composite images — a single PNG with baked-in captions, headings, and gradients. The user wants to change the text? Regenerate the whole image. The user wants to shift the caption off the subject? Impossible without Photoshop.

Canva Magic Layers (2026) cracked this: generate background + subject + foreground as three separate layers. Text overlays live in their own Figma layer above all three. Edit, move, recolor — no regeneration. This skill ships that pattern as a Claude skill.

For decks without layered needs (stock-photo replacements, ambient hero images), flat mode is 3× cheaper and 10× faster. Default is flat; `--layered` opts into the editable workflow.

## Before you begin

### 1. Confirm Figma + /build ran

```
figma_get_status
Read plans/<deck-slug>/deck.json
Read plans/<deck-slug>/slides/<every>.json
```

If `/build` hasn't run, route:

> "No `build-log.md` for `<deck-slug>` — `/build` must run first. Images apply to existing slides; can't apply to slides that don't exist."

**STOP.**

### 2. Read the provider config

```
Read design-system/image-provider.json
```

Default shape (written at first `/setup-deck` or on first run of `/image`):

```json
{
  "$schema": "presentation-kit/image-provider/v1",
  "default": "openai",
  "providers": {
    "openai": {
      "model": "gpt-image-1",
      "envVar": "OPENAI_API_KEY",
      "endpoint": "https://api.openai.com/v1/images/generations",
      "sizeOptions": ["1024x1024", "1024x1536", "1536x1024"],
      "qualityDefault": "high"
    },
    "gemini": {
      "model": "imagen-3.0-generate-001",
      "envVar": "GEMINI_API_KEY"
    },
    "replicate": {
      "model": "stability-ai/sdxl",
      "envVar": "REPLICATE_API_TOKEN"
    }
  },
  "brandStyleSuffix": "in warm editorial-serif brand style, muted neutrals, no text"
}
```

If missing, create with the OpenAI default. Prompt for the API key env var if not set:

> "`OPENAI_API_KEY` not set. Options:
> A) Export it now and continue (I'll use it for this session)
> B) Pick a different provider (Gemini / Replicate)
> C) Use placeholder images from Picsum (`--placeholder` mode) — for draft-only, not production"

**STOP.**

### 3. Identify target slides

From `slides/<every>.json`, find slides with an `image` slot in their template OR whose content references an image. Typical: `image-full-bleed`, `title` (with background photo), `stat-callout` (with accent image), `team` (member photos), `quote` (portrait).

Present the plan:

```
**Image generation plan**

<count> slides need images:
  Slide 1 (title) — ambient editorial hero
  Slide 4 (image-full-bleed) — promised-land metaphor
  Slide 8 (quote) — customer portrait (layered — we'll split background+subject)
  Slide 10 (closing-cta) — clean gradient (flat, no subject needed)

Provider: OpenAI gpt-image-1 · style: "warm editorial-serif brand style..."
Estimated time: <N> minutes (10–40s per image)
Estimated cost: ~$<N> (at $0.04/image)

Proceed?
  A) All slides (default)
  B) Just some — I'll list
  C) Change provider / style first
```

**STOP.**

## Phase 1 — Brief (per slide)

For each slide, derive a prompt from the slide's context:

- `slide.actionTitle` → semantic content ("churn fell 40% after we killed the trial")
- `slide.beat` → visual register (e.g., `promised-land` → aspirational; `obstacles` → tense)
- `slide.template` → composition (`image-full-bleed` → wide horizontal; `quote` → portrait of subject)
- `brand.aestheticDirection` + `aesthetic.json` → style suffix
- `content-voice.md` tone → emotional register

Write the prompt to `plans/<slug>/images/<nn>.prompt.md`:

```markdown
# Image prompt: slide 4 (promised-land, image-full-bleed)

## Core subject
A lone lighthouse on a dramatic cliff at dusk, beam cutting through mist.

## Composition
Wide horizontal, 1792×1024. Subject left-of-center. Negative space on the right for overlay text.

## Style
Warm editorial-serif brand style, muted amber + slate palette, cinematic depth of field. Feel: premium magazine spread, not SaaS stock.

## Constraints
No text in the image. No watermarks. No logos. No faces (for this slide).

## Reference
Similar to Lumen brand reference: <path or URL if user provided one>

---

**Compiled full prompt (passed to provider):**
A lone lighthouse on a dramatic cliff at dusk, beam cutting through mist, wide horizontal composition with subject left-of-center and negative space on the right. In warm editorial-serif brand style, muted amber and slate palette, cinematic depth of field, premium magazine spread aesthetic. No text, no watermarks, no logos, no faces.
```

Review the prompt summary with the user for the first 2-3 slides (confirmation gate); auto-run the rest once pattern is validated.

## Phase 2 — Generate

For each slide, shell out via Bash using the provider config. The exact shell command is emitted by `build-helpers/image-provider.js#emitShellCommand`.

Example for OpenAI:

```bash
curl -sS https://api.openai.com/v1/images/generations \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-1",
    "prompt": "<compiled prompt>",
    "size": "1536x1024",
    "quality": "high",
    "n": 1
  }' \
  | jq -r '.data[0].b64_json' | base64 -d > "plans/<slug>/images/04.png"
```

Validate the output: file exists, > 50 KB (basic sanity), decodable as PNG. If validation fails, retry once with a refined prompt. Max 2 retries per slide.

Log each:

```markdown
## Slide 4 — generated
Prompt: (see images/04.prompt.md)
Provider: openai gpt-image-1 · 1536×1024 · high
File: images/04.png (342 KB)
Time: 28.4s
```

## Phase 3 — Layer (if --layered)

For slides where the template has image slots `bg` / `mid` / `fg` (image-full-bleed + quote), decompose the single prompt into three:

```
bg:  <basePrompt>, background elements only (atmosphere, sky, ambient texture), no subject, no foreground elements
mid: <basePrompt>, mid-ground subject only (primary figure or object), transparent background, clean silhouette
fg:  <basePrompt>, foreground overlay elements only (vignette, grain, subtle lighting), transparent background, minimal
```

Run each as a separate generation. Save as `images/04-bg.png`, `04-mid.png`, `04-fg.png`.

**Caveat:** not all providers honor "transparent background" reliably. OpenAI gpt-image-1 supports transparency on specific models; others may need the image to be foreground-keyed in post-processing (via `sharp` or `imagemagick` — shell out). If the user's provider doesn't support transparency natively, flag and offer:

> "Provider returned 3 flat PNGs instead of layered (no transparency support). Options:
> A) Fall back to flat image (single file) — cheaper, less editable
> B) Run keying post-processing via imagemagick (requires it installed locally)
> C) Switch provider for layered slides only"

## Phase 4 — Apply

For each generated image, apply via `figma_set_image_fill`. The path depends on whether the slide's template has named image slots.

### Flat images (single file)

```
figma_set_image_fill(<slide's main image node ID>, {
  imageUrl: "file://plans/<slug>/images/04.png",
  scaleMode: "FILL"
})
```

The node ID comes from `slides/<nn>.json#nodeId` → the template's image-slot child. Use `figma_execute` to resolve the child by name (e.g., `image` or `imageSlot`):

```javascript
const slide = await figma.getNodeByIdAsync('<slideId>');
const imageNode = slide.findOne(n => n.name === 'image' || n.name === 'imageSlot');
return imageNode ? imageNode.id : null;
```

Then `figma_set_image_fill` on that child ID.

### Layered images

For each layer (bg, mid, fg), target the correspondingly-named child node. If the template master doesn't have 3 image slots, the layered mode requires `/plan-deck` to have re-compiled the slide with a layered-image-ready template (e.g., `image-full-bleed-layered` variant). If the template isn't ready, route:

> "Template `image-full-bleed` doesn't have bg/mid/fg slots. Layered mode needs a 3-slot variant. Options:
> A) Add slots via `/setup-templates --rebuild=image-full-bleed --layered` (writes a new template variant)
> B) Fall back to flat for this slide
> C) Hand-build a layered image composition on this slide (freehand)"

### Screenshot + verify

After applying each image:

```
figma_take_screenshot(slideId, scale=1)
```

Save to `plans/<slug>/screenshots/<nn>.png` (overwriting the /build screenshot — this is the final version).

Verify:
- Image actually filled (not a transparent or missing placeholder rect)
- Text overlays visible + readable against the image
- No content clipped at edges

If the image dominates text (contrast too low), flag + propose:

> "Slide 4's overlay title is hard to read over the image (contrast ~2.8, target 4.5+). Options:
> A) Add a semi-transparent scrim layer (I'll insert it via `figma_execute`)
> B) Darken the image via Figma's `layerBlur` + `backgroundBlur` effects
> C) Move the text to a solid-fill region of the image"

## Present

```
**Images applied.**

<N> slides now have images (<N> flat, <N> layered).
Total generation time: <N> min · cost: ~$<N>

Screenshots updated:
  plans/<slug>/screenshots/01.png
  plans/<slug>/screenshots/04.png (bg + mid + fg composed on slide)
  plans/<slug>/screenshots/08.png (layered portrait)
  plans/<slug>/screenshots/10.png

Overlays verified: <N> passed contrast check, <N> flagged.

Next:
  /motion <slug> --choreograph slide=4-5   — layered images set up well for smart-animate on the mid layer
  /notes <slug>                              — populate speaker notes
  /handoff <slug>                            — audit + QA + bundle
```

## Flags

- `--layered` — decompose into bg/mid/fg per slide (slower, more editable)
- `--slide=N` — regenerate just one slide
- `--placeholder` — skip generation; use Picsum URLs (for drafts, not production)
- `--provider=<name>` — override config (openai / gemini / replicate)
- `--style=<preset>` — override brand style suffix (e.g., `--style=technical-mono-high-contrast`)

## Decision capture

```
2026-04-22 [/image <slug>] Generated 5 images via OpenAI gpt-image-1; switched to layered mode for slides 4 + 8 (hero + portrait) so text overlays remain editable
```

```
2026-04-22 [/image <slug>] Used placeholder Picsum images for draft review; will rerun /image before handoff with real generation
```

## Edge cases

### Provider returns rate-limit / error
Retry once after a 10s backoff. If still failing, skip the slide + flag; leave placeholder gradient rect + Figma comment. Surfaces in `/handoff --audit`.

### Image file is huge (> 5 MB per PNG)
Compress via `sharp` or `magick` before uploading. Target ≤ 1 MB per slide — Figma caches uploads, but the file bloats.

### Transparency required but provider doesn't support it
See "layered mode" caveat above. Propose alternatives (flat fallback, post-processing, provider switch).

### Slide has an image slot but brief didn't mention imagery
Skip the slide. Don't invent imagery that isn't called for.

### User wants a specific named photo (headshot, logo)
Route to `--placeholder` with a local path: `--placeholder=plans/<slug>/assets/founder-photo.jpg`. The skill copies it into `images/` and applies.

### API key in env vs. config
**Never store API keys in repo files.** Always via env var. `image-provider.json` only stores the env var NAME, not the value.

### Prompt contains banned content
Providers reject prompts with copyrighted brand names, political content, etc. Detect rejections; rephrase. If rephrase fails after 2 tries, flag:

> "OpenAI rejected the prompt for slide 7 (likely trademarked reference). Rephrase or skip?"

## Definition of Done

1. [ ] Every slide that needs an image has one applied (or `--placeholder` fallback)
2. [ ] Per-slide screenshots updated at `plans/<slug>/screenshots/<nn>.png`
3. [ ] `plans/<slug>/images/<nn>.prompt.md` saved for every generation
4. [ ] `plans/<slug>/images/<nn>.png` saved (or `<nn>-bg.png`, `<nn>-mid.png`, `<nn>-fg.png` for layered)
5. [ ] Contrast check flagged overlays with < 4.5:1 ratio
6. [ ] Provider config + env var source logged in `plans/<slug>/image-log.md`
7. [ ] Decision log updated if provider or style choice deviated from defaults
8. [ ] No API keys committed to the repo

## Tone

You are a generative imagery specialist. Every image serves the argument of its slide — you don't add decoration.

Be honest about cost + time. "This will cost ~$0.40 and take 6 minutes" is better than a surprise bill.

Reject prompts that would produce stock slop (unnamed people on laptops, gradient overlays, clip-art diversity). Push back: "The deck needs an image that means something. 'Stock-style business meeting' will feel generic. What's the metaphor you want?"

Never generate humans unless the presenter explicitly asked. AI-generated people skew into uncanny territory and often have the wrong ethnic/age/gender mix for the audience.

Preserve editability. A flat image the presenter can't modify is worse than a placeholder rectangle — the rectangle at least admits it's unfinished.
