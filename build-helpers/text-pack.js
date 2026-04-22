// text-pack.js — Pre-compute text wrapping and line counts BEFORE applying to Figma.
// Avoids round-trip latency and prevents overflow surprises at render time.
//
// Used by /layout-pack and /plan-deck to solve for fit before the build phase.
// Phase 0: stubs. Phase 1: real implementation.

/**
 * estimateLines — guess how many lines a string will wrap to at a given width + font size.
 * Rough heuristic based on avg char width per font family.
 *
 * @param {string} text
 * @param {object} opts - { width, fontSize, family, style }
 * @returns {number} estimated line count
 */
function estimateLines(text, { width, fontSize, family = "Inter", style = "Regular" }) {
  // Avg char width as fraction of fontSize (empirical per family)
  const charWidthMap = {
    "Inter": 0.52,
    "DM Sans": 0.54,
    "IBM Plex Sans": 0.55,
    "Playfair Display": 0.50,
    "Fraunces": 0.51,
    "JetBrains Mono": 0.60, // monospace runs wider
    "IBM Plex Mono": 0.60,
  };
  const charW = (charWidthMap[family] || 0.55) * fontSize;
  const charsPerLine = Math.floor(width / charW);

  // Split on spaces + newlines, accumulate
  const words = text.split(/\s+/);
  let lines = 1;
  let col = 0;
  for (const word of words) {
    if (col + word.length + 1 > charsPerLine) {
      lines++;
      col = word.length;
    } else {
      col += word.length + 1;
    }
  }
  return lines;
}

/**
 * estimateHeight — estimated rendered height for a text node.
 * @param {string} text
 * @param {object} opts - { width, fontSize, lineHeight }
 */
function estimateHeight(text, { width, fontSize, lineHeight = 1.4, family, style }) {
  const lines = estimateLines(text, { width, fontSize, family, style });
  return Math.ceil(lines * fontSize * lineHeight);
}

/**
 * fitCheck — does the text fit within the given height budget?
 * @returns {{ fits: boolean, estimatedHeight: number, lines: number }}
 */
function fitCheck(text, { width, fontSize, maxHeight, lineHeight = 1.4, family, style }) {
  const lines = estimateLines(text, { width, fontSize, family, style });
  const estimatedHeight = Math.ceil(lines * fontSize * lineHeight);
  return {
    fits: estimatedHeight <= maxHeight,
    estimatedHeight,
    lines,
  };
}

/**
 * shrinkToFit — given overflow, recommend a smaller font size that fits.
 * @returns {{ fontSize: number, fits: boolean, lines: number }}
 */
function shrinkToFit(text, { width, startFontSize, maxHeight, minFontSize = 10, lineHeight = 1.4, family, style }) {
  let size = startFontSize;
  while (size >= minFontSize) {
    const check = fitCheck(text, { width, fontSize: size, maxHeight, lineHeight, family, style });
    if (check.fits) return { fontSize: size, fits: true, lines: check.lines };
    size -= 1;
  }
  return { fontSize: minFontSize, fits: false, lines: estimateLines(text, { width, fontSize: minFontSize, family, style }) };
}

/**
 * truncateWithWarning — hard truncate the text with ellipsis and flag for user review.
 * @returns {{ truncated: string, originalLength: number, droppedChars: number }}
 */
function truncateWithWarning(text, maxChars) {
  if (text.length <= maxChars) {
    return { truncated: text, originalLength: text.length, droppedChars: 0 };
  }
  // Truncate at word boundary if possible
  const cut = text.slice(0, maxChars - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const truncated = (lastSpace > maxChars * 0.7 ? cut.slice(0, lastSpace) : cut) + "…";
  return {
    truncated,
    originalLength: text.length,
    droppedChars: text.length - truncated.length + 1,
  };
}

module.exports = {
  estimateLines,
  estimateHeight,
  fitCheck,
  shrinkToFit,
  truncateWithWarning,
};
