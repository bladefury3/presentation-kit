# Design System Loading

Standard fallback for loading presentation-kit artifacts. Every skill that reads brand, tokens, templates, motion, or deck context MUST follow this pattern.

## Tier 0: Product + narrative context (loaded first, informs everything)

Read these from the project directory before any decision:

- `design-system/brand.json` — identity, audience voice, logos (written by `/setup-deck`)
- `design-system/content-voice.md` — tone, word budgets, banned phrases
- `design-system/decisions.md` — append-only log of prior decisions (see `shared/decision-capture.md`)
- `plans/<deck>/brief.md` — problem, audience, CTA, duration (if working on a specific deck)
- `plans/<deck>/arc.json` — chosen arc + beat structure (once `/arc` has run)
- `plans/<deck>/aesthetic.json` — committed aesthetic direction (once `/style-preview` has run)

If `decisions.md` exists, scan it before making any choice the log might already cover. Cite the prior decision when applying it; cite + override when deviating. Skills that make new meaningful decisions append per `shared/decision-capture.md`.

If `brief.md` exists, use it to:
- Pre-fill audience voice (skip questions already answered in brief)
- Apply the duration budget to slide count, speaker-notes timing, motion density
- Default to the brief's tone unless overridden

If these files are missing, proceed — they are optional enrichment. Suggest running the appropriate skill (`/setup-deck`, `/brief`) if the user would benefit from persistent context.

## Tier 1: Local JSON (fast, pre-extracted)

Read ALL of these from the project directory:

- `design-system/tokens.json` — color / type / spacing / radii / shadows (W3C DTCG format)
- `design-system/typography.json` — role mapping (section-label / heading / body / caption / accent)
- `design-system/motion.json` — durations, easings, per-transition defaults, reduced-motion policy
- `design-system/color-modes.json` — dark/light variants + accent usage rules
- `design-system/templates/index.json` — template registry catalog
- `design-system/templates/<id>.json` — per-template slot definitions + auto-layout + token bindings
- `design-system/image-provider.json` — external image-gen provider config (optional)

If all relevant files exist and contain data, proceed. This is the fastest path.

## Tier 2: Live MCP extraction (slower, always current)

If any files are missing:

> "Design system data not found locally. Let me try reading it directly from Figma..."

```
Use figma_get_design_system_kit with:
  - include: ["tokens", "styles"]
  - format: "full"
```

For large design systems, use `format: "compact"` to avoid context overflow.

For templates specifically, use `figma_search_components` filtered by the templates page, then `figma_get_component_details` for each.

## Tier 3: Ask user

Only if Tier 2 also fails:

> "Couldn't read design system data from Figma either. I can proceed with default typography and tokens, but the deck won't match any brand identity. Want to:
>
> A) Proceed with defaults (dark theme, Inter + Playfair)
> B) Run `/setup-deck` first to configure brand + tokens (recommended)
>
> **STOP.** Wait for response before continuing.

## Mode switching (dark / light)

When the user requests a light-theme deck (or other non-default mode), apply variable modes to the top-level slide master or to each slide via `figma_execute`:

```javascript
const slide = await figma.getNodeByIdAsync('<slideId>');
const modeCollections = /* from tokens.json $metadata.modeCollections */;

for (const [collName, collData] of Object.entries(modeCollections)) {
  const targetModeId = collData.modes["Light mode"] || collData.modes["Default"];
  if (!targetModeId) continue;
  const collection = await figma.variables.getVariableCollectionByIdAsync(collData.collectionId);
  if (collection) {
    slide.setExplicitVariableModeForCollection(collection, targetModeId);
  }
}
```

### Important notes

- **Pass collection objects, not string IDs** — `setExplicitVariableModeForCollection` requires a `VariableCollection` node, not a string.
- **Set modes on the parent frame/slide** — child instances inherit.
- **All collections need modes set** — even collections with only a "Default" mode.

## Key resolution rules

- Every token reference must resolve to a `figmaKey` (40-char hex). Path-style keys like `color/primary` fail silently in `setBoundVariable`.
- Every component reference must resolve to a `variantKey` (specific variant), NOT a `figmaKey` (component set). See `shared/tool-selection.md`.
- If a key is missing from cached data, search at runtime with `figma_search_components` or `figma_get_variables` — don't skip the element.
- Node IDs are session-scoped. Always `figma_search_components` at session start; never reuse IDs across conversations.
