// slide-helpers.js — Figma Plugin API helpers for presentation-kit.
// Run via figma_execute. Helpers return nodes/IDs for composition.
//
// Port patterns from design-kit/build-helpers/figma-helpers.js where applicable.
// Phase 0: stubs with real signatures. Phase 1: fleshed out when /build ships.

/**
 * mkSlide — create a new slide and return its nodeId.
 * Wraps figma.root.appendChild(figma.createSlide()) semantics.
 */
async function mkSlide() {
  const slide = figma.createSlide();
  figma.root.appendChild(slide);
  return slide;
}

/**
 * setBg — set the slide background to a token-bound color.
 * @param {SlideNode} slide
 * @param {string} tokenKey - Figma variable key (40-char hex)
 */
async function setBg(slide, tokenKey) {
  const variable = await figma.variables.importVariableByKeyAsync(tokenKey);
  slide.backgrounds = [
    figma.variables.setBoundVariableForPaint(
      { type: "SOLID", color: { r: 0, g: 0, b: 0 } },
      "color",
      variable
    ),
  ];
}

/**
 * mkF — create an auto-layout frame with common defaults.
 * @param {object} opts - { x, y, w, h, direction, padding, gap, align, parent }
 */
async function mkF({ x = 0, y = 0, w = 800, h = 600, direction = "VERTICAL", padding = 24, gap = 16, align = "MIN", parent = null }) {
  const frame = figma.createFrame();
  frame.x = x;
  frame.y = y;
  frame.resize(w, h);
  frame.layoutMode = direction;
  frame.paddingTop = padding;
  frame.paddingRight = padding;
  frame.paddingBottom = padding;
  frame.paddingLeft = padding;
  frame.itemSpacing = gap;
  frame.primaryAxisAlignItems = align;
  frame.clipsContent = false;
  if (parent) parent.appendChild(frame);
  return frame;
}

/**
 * mkT — create a text node with font pre-flight.
 * @param {object} opts - { text, family, style, size, x, y, w, align, color, parent }
 */
async function mkT({ text, family = "Inter", style = "Regular", size = 16, x = 0, y = 0, w = 800, align = "LEFT", color = { r: 1, g: 1, b: 1 }, parent = null }) {
  await figma.loadFontAsync({ family, style });
  const node = figma.createText();
  node.fontName = { family, style };
  node.fontSize = size;
  node.characters = text;
  node.x = x;
  node.y = y;
  node.resize(w, node.height);
  node.textAutoResize = "HEIGHT";
  node.textAlignHorizontal = align;
  node.fills = [{ type: "SOLID", color }];
  if (parent) parent.appendChild(node);
  return node;
}

/**
 * bf — helper for SOLID fill with opacity.
 */
function bf(color, opacity = 1.0) {
  return [{ type: "SOLID", color, opacity }];
}

/**
 * bs — helper for SOLID stroke.
 */
function bs(color, weight = 1, opacity = 1.0) {
  return {
    strokes: [{ type: "SOLID", color, opacity }],
    strokeWeight: weight,
    strokeAlign: "INSIDE",
  };
}

/**
 * setNotes — canonical speaker-notes helper. See shared/speaker-notes-helper.md.
 * @param {SlideNode} slide
 * @param {string} notes
 */
async function setNotes(slide, notes) {
  if (!slide || slide.type !== "SLIDE") {
    throw new Error(`setNotes: expected SLIDE, got ${slide?.type}`);
  }
  slide.speakerNotes = notes;
  return { ok: true, noteLength: notes.length };
}

/**
 * fontsMatching — filter available fonts by family substring.
 * @param {string} query
 */
async function fontsMatching(query) {
  const fonts = await figma.listAvailableFontsAsync();
  const q = query.toLowerCase();
  return fonts
    .filter((f) => f.fontName.family.toLowerCase().includes(q))
    .map((f) => ({ family: f.fontName.family, style: f.fontName.style }));
}

/**
 * canvasScan — enumerate slide children and their bounds (for positioning).
 */
async function canvasScan(slide) {
  return slide.children.map((c) => ({
    id: c.id,
    name: c.name,
    x: c.x,
    y: c.y,
    width: c.width,
    height: c.height,
  }));
}

/**
 * sweepText — recursively replace placeholder text throughout a node tree.
 * @param {SceneNode} node
 * @param {Record<string, string>} replacements - e.g. { "Olivia Rhye": "Jane Smith" }
 */
async function sweepText(node, replacements) {
  if (node.type === "TEXT") {
    const current = node.characters;
    for (const [from, to] of Object.entries(replacements)) {
      if (current.includes(from)) {
        await figma.loadFontAsync(node.fontName);
        node.characters = current.replaceAll(from, to);
      }
    }
  }
  if ("children" in node) {
    for (const child of node.children) {
      await sweepText(child, replacements);
    }
  }
}

// Export surface for figma_execute invocations
// (figma_execute evaluates the script in-context; these helpers are available for inline use.)
