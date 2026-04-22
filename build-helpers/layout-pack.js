// layout-pack.js — Fit solver. Given a slide + template + content, solve for a layout
// that fits without overflow. Shrink, wrap, or truncate-with-warning.
//
// Called by /plan-deck before emitting slides/<nn>.json, and by /build Layer 4 as a last check.
// Phase 0: stubs. Phase 1: real implementation.

const { estimateHeight, shrinkToFit, truncateWithWarning } = require("./text-pack.js");

/**
 * packSlide — given slide content + template, solve for layout.
 * Iterates through slots, estimates heights, shrinks fonts if needed, flags overflow.
 *
 * @param {object} slide - slide.json content
 * @param {object} template - template.json definition
 * @param {object} tokens - resolved typography tokens from typography.json
 * @returns {object} packed slide with adjusted font sizes + warnings array
 */
function packSlide(slide, template, tokens) {
  const warnings = [];
  const packed = { ...slide, content: { ...slide.content } };

  for (const slot of template.slots) {
    const value = slide.content[slot.id];
    if (!value) continue;

    if (slot.type !== "text" && slot.type !== "quote") continue;

    const text = typeof value === "string" ? value : value.text || "";
    if (!text) continue;

    // Check character budget
    if (slot.maxChars && text.length > slot.maxChars) {
      const { truncated, droppedChars } = truncateWithWarning(text, slot.maxChars);
      packed.content[slot.id] = truncated;
      warnings.push({
        slot: slot.id,
        kind: "truncated",
        droppedChars,
        original: text,
      });
    }

    // Check height fit (if slot has implied size from typeScale)
    // Phase 1: full implementation with actual token sizes + slot widths from template.autoLayout
  }

  return { packed, warnings };
}

/**
 * packDeck — run packSlide over every slide; aggregate warnings.
 * @param {object} deck - deck.json
 * @param {Array<object>} slides - array of slide.json
 * @param {object} templates - template registry (index.json + per-template data)
 * @param {object} tokens - typography.json
 */
function packDeck(deck, slides, templates, tokens) {
  const packedSlides = [];
  const allWarnings = [];

  for (const slide of slides) {
    const template = templates[slide.template];
    if (!template) {
      allWarnings.push({ slide: slide.id, kind: "missing-template", template: slide.template });
      packedSlides.push(slide);
      continue;
    }
    const { packed, warnings } = packSlide(slide, template, tokens);
    packedSlides.push(packed);
    for (const w of warnings) {
      allWarnings.push({ ...w, slide: slide.id });
    }
  }

  return { slides: packedSlides, warnings: allWarnings };
}

/**
 * reportFitIssues — human-readable summary of warnings for the build log.
 */
function reportFitIssues(warnings) {
  if (!warnings.length) return "No fit issues detected.";
  const lines = warnings.map((w) => {
    if (w.kind === "truncated") {
      return `- ${w.slide}.${w.slot}: truncated, dropped ${w.droppedChars} chars`;
    }
    if (w.kind === "missing-template") {
      return `- ${w.slide}: template '${w.template}' not in registry`;
    }
    return `- ${w.slide}.${w.slot}: ${w.kind}`;
  });
  return [`${warnings.length} fit issue(s):`, ...lines].join("\n");
}

module.exports = {
  packSlide,
  packDeck,
  reportFitIssues,
};
