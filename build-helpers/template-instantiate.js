// template-instantiate.js — Generic slot-fill engine.
// Reads a template.json + slide.json content, produces Plugin API ops to render the slide.
//
// Called by /build Layer 2 (structure). Keeps template logic data-driven, not code-driven.
// Phase 0: stubs. Phase 1: real implementation.

/**
 * instantiateTemplate — produce an array of Plugin API ops to render a slide from a template.
 *
 * @param {object} template - template.json
 * @param {object} slide - slide.json
 * @param {object} context - { tokens, typography, slideNodeId, parentFrame }
 * @returns {Array<object>} sequence of ops to execute via figma_execute
 */
function instantiateTemplate(template, slide, context) {
  const ops = [];

  // If template has a Figma master, instantiate it first
  if (template.figmaMaster?.variantKey) {
    ops.push({
      kind: "instantiate",
      variantKey: template.figmaMaster.variantKey,
      target: context.slideNodeId,
      slotValues: extractSlotValues(slide, template),
    });
    return ops;
  }

  // Otherwise, build from scratch via auto-layout frame + slot fills
  ops.push({
    kind: "createFrame",
    parent: context.slideNodeId,
    autoLayout: template.autoLayout,
    tokens: template.tokens,
  });

  for (const slot of template.slots) {
    const value = slide.content[slot.id];
    if (!value && slot.required) {
      ops.push({ kind: "error", message: `Required slot '${slot.id}' missing for slide ${slide.id}` });
      continue;
    }
    if (!value) continue;

    if (slot.type === "text" || slot.type === "quote") {
      ops.push({
        kind: "addText",
        parent: "CURRENT_FRAME",
        text: typeof value === "string" ? value : value.text,
        typeScale: slot.typeScale,
        tokens: template.tokens,
      });
    } else if (slot.type === "display-number") {
      ops.push({
        kind: "addText",
        parent: "CURRENT_FRAME",
        text: value.value || value,
        typeScale: slot.typeScale || "accent-number",
        tokens: template.tokens,
      });
      if (value.label) {
        ops.push({
          kind: "addText",
          parent: "CURRENT_FRAME",
          text: value.label,
          typeScale: "body.md",
          tokens: template.tokens,
        });
      }
    } else if (slot.type === "image") {
      ops.push({
        kind: "setImageFill",
        parent: "CURRENT_FRAME",
        imagePath: value.path,
        layer: value.layer || "background",
      });
    } else if (slot.type === "chart") {
      ops.push({
        kind: "renderChart",
        parent: "CURRENT_FRAME",
        engine: template.chartEngine,
        data: value,
        tokens: template.tokens,
      });
    } else if (slot.type === "list" || slot.type === "timeline-event") {
      ops.push({
        kind: "renderList",
        parent: "CURRENT_FRAME",
        items: Array.isArray(value) ? value : value.items || [],
        slot: slot,
        tokens: template.tokens,
      });
    }
  }

  return ops;
}

/**
 * extractSlotValues — pick out slot.id → value mapping for a component instance.
 * Used when the template has a Figma master and we need to set properties via figma_set_instance_properties.
 */
function extractSlotValues(slide, template) {
  const values = {};
  for (const slot of template.slots) {
    const val = slide.content[slot.id];
    if (val !== undefined) values[slot.id] = val;
  }
  return values;
}

/**
 * opsToScript — compile ops array into a figma_execute script string.
 * Phase 1: real implementation that emits Plugin API JS.
 */
function opsToScript(ops, helpersInline = false) {
  // Phase 0: placeholder
  const header = helpersInline ? "/* slide-helpers inlined */\n" : "";
  const body = ops.map((op) => `// op: ${op.kind}`).join("\n");
  return header + body;
}

module.exports = {
  instantiateTemplate,
  extractSlotValues,
  opsToScript,
};
