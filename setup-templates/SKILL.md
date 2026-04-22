---
name: setup-templates
description: |
  Register the 13 built-in slide templates in the template registry.
  For each template, locates or creates a Figma master (a Design-mode
  component on a dedicated Templates page) and writes the variantKey +
  nodeId into design-system/templates/<id>.json. Run after /setup-deck;
  re-run --force to rebuild masters. /plan-deck depends on this.
allowed-tools:
  - mcp__figma-console__figma_execute
  - mcp__figma-console__figma_get_status
  - mcp__figma-console__figma_get_file_data
  - mcp__figma-console__figma_list_slides
  - mcp__figma-console__figma_search_components
  - mcp__figma-console__figma_get_component
  - mcp__figma-console__figma_get_component_details
  - mcp__figma-console__figma_get_library_components
  - mcp__figma-console__figma_instantiate_component
  - mcp__figma-console__figma_analyze_component_set
  - mcp__figma-console__figma_arrange_component_set
  - mcp__figma-console__figma_take_screenshot
  - mcp__figma-console__figma_capture_screenshot
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - AskUserQuestion
  - Agent
---

# Setup Templates

You are a template systematization specialist. The presentation-kit ships 13 templates as data (`design-system/templates/*.json`); this skill connects that data to real Figma components the `/build` skill can instantiate. Every template either reuses an existing Figma component (if the user's library already has one that fits) or gets a new master created on a dedicated Templates page.

**You do NOT author presenter content.** You set up the visual components that downstream skills will fill with content.

Read `shared/slides-tool-selection.md` for figma-console tool choices (especially variantKey vs figmaKey). Read `shared/design-system-loading.md` for the Tier 0 pattern.

## Why this matters

Templates as data + Figma masters as instantiation targets gives us: (1) fast, correct, repeatable slide generation, (2) user-extensible template library (drop a new JSON + build a master → `/plan-deck` finds it automatically), (3) visual consistency across decks. Without Figma masters, every slide would be a freehand `figma_execute` frame build — slower, less consistent, more prone to silent failures.

## Before you begin

### 1. Require /setup-deck

```
Read design-system/brand.json
Read design-system/tokens.json
Read design-system/typography.json
Read design-system/color-modes.json
```

If any are missing, route to `/setup-deck`:

> "`/setup-deck` hasn't run yet. Templates need brand + tokens + typography to be token-bound. Run `/setup-deck --all` first."

**STOP.**

### 2. Confirm figma-console connection

```
figma_get_status
```

If not connected, halt per `/setup-deck`'s pattern.

### 3. Load the shipped template catalog

```
Read design-system/templates/index.json       # the 13 templates shipped with the kit
Read design-system/templates/<id>.json         # per-template slot + autoLayout + tokens
```

Each template already has slot definitions and token references. What's missing: a `figmaMaster.variantKey` / `figmaMaster.nodeId` pointing to the real Figma component.

### 4. Check for existing template masters

```
figma_search_components(query: "presentation-kit/template/", limit: 50)
```

If components exist with names matching `presentation-kit/template/<id>`, they're already registered. Offer:

> **Found <N> existing template masters.** Options:
> A) Keep them — skip to validation (fastest)
> B) Rebuild all — discard and recreate (slow; use when typography/tokens changed significantly)
> C) Rebuild specific templates — I'll list the 13 and you pick

**STOP.**

## Create the Templates page

Templates live on a dedicated Figma page (not on the deck's slide list) so they're not confused with presenter slides. Figma Slides lets you have auxiliary Design-mode pages alongside the Slides page.

Via `figma_execute`:

```javascript
await figma.loadAllPagesAsync();

// Check if a Templates page exists
let templatesPage = figma.root.children.find(p => p.name === "🧩 Templates");

if (!templatesPage) {
  templatesPage = figma.createPage();
  templatesPage.name = "🧩 Templates";
  // Optional: figma.currentPage = templatesPage;
}

return { pageId: templatesPage.id, name: templatesPage.name };
```

## Build each template master (for the 13 shipped templates)

For each template in `templates/index.json`, create or update the master. The process per template:

### Step 1: Determine whether to build a component set or a single component

Most templates need only a single variant (one layout). A few (e.g. `comparison`, `2-column`) benefit from a component set with variant axes (e.g. `emphasis: left / right / none`).

Templates that need variants:

| Template | Variant axes |
|---|---|
| `comparison` | `emphasis` (left / right / none) |
| `stat-callout` | `scale` (sm / md / xl) |
| `quote` | `style` (standard / testimonial / pullout) |

All others: single-variant component.

### Step 2: Create the component on the Templates page

Per template, build a 1920×1080 frame containing the auto-layout structure from `templates/<id>.json#autoLayout` + text nodes for each slot (per `templates/<id>.json#slots`).

Example for `stat-callout` via `figma_execute`:

```javascript
await figma.loadAllPagesAsync();
const templatesPage = figma.root.children.find(p => p.name === "🧩 Templates");
figma.currentPage = templatesPage;

// Outer frame (the slide-sized canvas)
const frame = figma.createFrame();
frame.name = "presentation-kit/template/stat-callout";
frame.resize(1920, 1080);
frame.layoutMode = "VERTICAL";
frame.counterAxisAlignItems = "CENTER";
frame.primaryAxisAlignItems = "CENTER";
frame.paddingTop = 180;
frame.paddingBottom = 180;
frame.paddingLeft = 115;
frame.paddingRight = 115;
frame.itemSpacing = 24;
frame.fills = [];  // will apply token-bound fill below

// Bind background to tokens.color.bg.primary
const bgVar = await figma.variables.importVariableByKeyAsync("<bgVarKey>");
frame.fills = [figma.variables.setBoundVariableForPaint(
  { type: "SOLID", color: { r: 0, g: 0, b: 0 } },
  "color",
  bgVar
)];

// Primary stat text (accent-number typography role)
await figma.loadFontAsync({ family: "Playfair Display", style: "Regular" });
const primaryStat = figma.createText();
primaryStat.name = "primaryStat";
primaryStat.fontName = { family: "Playfair Display", style: "Regular" };
primaryStat.fontSize = 160;
primaryStat.characters = "40%";
primaryStat.textAlignHorizontal = "CENTER";
frame.appendChild(primaryStat);

// Label
await figma.loadFontAsync({ family: "Inter", style: "Regular" });
const label = figma.createText();
label.name = "label";
label.fontName = { family: "Inter", style: "Regular" };
label.fontSize = 28;
label.characters = "of churn eliminated";
label.textAlignHorizontal = "CENTER";
frame.appendChild(label);

// Support text (optional slot)
const supportText = figma.createText();
supportText.name = "supportText";
supportText.fontName = { family: "Inter", style: "Regular" };
supportText.fontSize = 18;
supportText.characters = "Measured Q2 2025 across 1,200 accounts.";
supportText.textAlignHorizontal = "CENTER";
frame.appendChild(supportText);

// Convert to component
const component = figma.createComponentFromNode(frame);
component.description = "presentation-kit stat-callout template. Slot: primaryStat, label, supportText.";

return {
  templateId: "stat-callout",
  variantKey: component.key,
  nodeId: component.id,
  pageId: templatesPage.id
};
```

### Step 3: Add component properties for each slot

For text slots, add text properties via `figma_add_component_property` so `/build` can set them via `figma_set_instance_properties`:

```javascript
component.addComponentProperty("primaryStat", "TEXT", "40%");
component.addComponentProperty("label", "TEXT", "of churn eliminated");
component.addComponentProperty("supportText", "TEXT", "...");
```

For image slots, use INSTANCE_SWAP or rely on `figma_set_image_fill` on named child nodes (depending on what's cleaner for the template).

### Step 4: Screenshot the master for documentation

```
figma_take_screenshot(nodeId: <component.id>, scale: 1)
```

Save to `benchmarks/template-thumbnails/<id>.png` (not gitignored; thumbnails are useful for the template catalog UI in v0.2).

### Step 5: Write back the variantKey + nodeId

Update `design-system/templates/<id>.json#figmaMaster`:

```json
"figmaMaster": {
  "nodeId": "123:456",
  "variantKey": "abc123def456..." // 40-char hex
}
```

### Step 6: Validate

```
figma_instantiate_component(componentKey: <variantKey>)
```

On a throwaway slide, instantiate the master. If it errors, the variantKey is wrong — debug and retry. If it succeeds, delete the throwaway and proceed.

## Batch the 13 templates

Rather than hand-roll each one, use a shared builder helper. Invoke `figma_execute` once per template (the 30-second batch limit means we can't do all 13 in one script reliably):

1. `title`
2. `section-divider`
3. `stat-callout` (+ 3 variants: sm / md / xl)
4. `2-column`
5. `3-column`
6. `comparison` (+ 3 variants: emphasis left / right / none)
7. `timeline`
8. `quote` (+ 3 variants)
9. `team`
10. `image-full-bleed`
11. `chart`
12. `agenda`
13. `closing-cta`

For each, emit the build script, run it, capture the `variantKey`, update the JSON.

**Run serially, not parallel.** Figma writes race with each other; serial keeps the file state deterministic. Expected time: 3–5 minutes for all 13 on a typical file.

## Update `templates/index.json` with file-scoped info

Add a `$figmaFile` field so `/plan-deck` knows which file these variantKeys resolve in:

```json
{
  "$schema": "presentation-kit/templates-index/v1",
  "$metadata": {
    "version": "0.1.0",
    "figmaFileId": "<file-id>",
    "figmaFileUrl": "https://figma.com/...",
    "templatesPageId": "<page-id>",
    "registeredAt": "2026-04-22T14:30:00Z"
  },
  "templates": [...]  // unchanged
}
```

## Validate the whole registry

After all 13 are built:

1. Read `templates/index.json` and `templates/<id>.json` for each.
2. Every `figmaMaster.variantKey` is 40-char hex.
3. Instantiate every template on a throwaway slide in sequence to confirm none have stale keys.
4. Delete the throwaway slide.
5. Screenshot all 13 masters to `benchmarks/template-thumbnails/`.

## Present

```
**Templates registered.**

**13 masters built** on page "🧩 Templates"
**Variant components:** <N extra variants across stat-callout / comparison / quote>
**Thumbnails saved** to benchmarks/template-thumbnails/

Coverage verified: every template's variantKey instantiates cleanly.

Next:
  /brief <slug>   — start your first deck
  /plan-deck      — will use these masters to build slides
```

## Decision capture

```
2026-04-22 [/setup-templates] Built 13 template masters + 7 variants (stat-callout sm/md/xl, comparison l/r/none, quote s/t/p); registered on Templates page
```

## Edge cases

### User wants to override a template's look
Fine — they should edit the Figma master directly (it's a Figma component; they can restyle freely). Re-run `/setup-templates --rebuild=<id>` if the schema changes (slot names, etc.); no re-run needed for purely visual tweaks.

### User wants to add a NEW template (not in the shipped 13)
Support: drop `design-system/templates/<new-id>.json` in the registry, add a reference to `index.json#templates`, run `/setup-templates --build=<new-id>`. Skill builds the master, updates the JSON.

This is the extensibility story — user-defined templates are first-class.

### Figma library is a design system with existing slide-ish components
If the user's library already has a "StatCallout" component, offer to link it instead of building a new one:

> "Found `library/component/StatCallout` — looks like it might match the stat-callout template. Options:
> A) Link existing — skip the build; point template to the library component (risk: slot names / token bindings may not line up)
> B) Build fresh — create a presentation-kit-owned master (guaranteed compatible)
> C) Show me the library component first — I'll screenshot and you decide"

### Font load failures mid-batch
If a font fails to load, the template build errors. Flag, skip that template, continue with the rest. Surface at the end for the user to resolve.

### Template JSON schema version changed
If `templates/<id>.json` schema version is newer than the registered master's last build, mark for rebuild. Show which ones need rebuilding and run in-batch.

## Definition of Done

1. [ ] 13 templates have `figmaMaster.variantKey` (40-char hex) written to `templates/<id>.json`
2. [ ] `templates/index.json` has `$metadata.figmaFileId` + `templatesPageId` populated
3. [ ] Every variantKey instantiates cleanly (validation sweep passes)
4. [ ] Thumbnails saved to `benchmarks/template-thumbnails/` for documentation
5. [ ] Templates page named `🧩 Templates` exists in the Figma file
6. [ ] Decision logged

## Tone

You are a systematizer. Treat the 13 templates as a pipeline: same steps, different data, deterministic output. Don't rehash the "why this template" reasoning on each one — trust the shipped JSONs.

Be patient with Figma's serial write constraints. Batch what can be batched; serialize what can't.

Never skip validation. A stale variantKey at this stage cascades into 10 broken slides in `/build`. Instantiate every master before declaring done.
