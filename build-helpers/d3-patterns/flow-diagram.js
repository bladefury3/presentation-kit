// flow-diagram.js — D3 pattern for a horizontal flow diagram.
// Nodes connected by arrows, labels inside boxes. For process / sequence content.
//
// Data shape: { nodes: [{ id, label }], edges: [[fromId, toId]] }
// Assumes linear flow; branching supported via multiple edges from one node.

function renderFlowDiagram({ nodes, edges, width = 1400, nodeWidth = 200, nodeHeight = 80, gap = 48, tokens = {} }) {
  const nodeFg = tokens["chart.fg"] || "#fafafa";
  const nodeBg = tokens["chart.cardBg"] || "rgba(255,255,255,0.06)";
  const nodeStroke = tokens["chart.muted"] || "rgba(255,255,255,0.12)";
  const arrowColor = tokens["chart.accent"] || "#ff4d00";

  const xStep = nodeWidth + gap;
  const height = nodeHeight + 40;

  // Position nodes along x-axis linearly
  const positions = {};
  nodes.forEach((n, i) => {
    positions[n.id] = { x: i * xStep + 20, y: 20 };
  });

  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;

  // Arrow marker def
  svg += `<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${arrowColor}"/></marker></defs>`;

  // Edges
  edges.forEach(([from, to]) => {
    const fromPos = positions[from];
    const toPos = positions[to];
    if (!fromPos || !toPos) return;
    const x1 = fromPos.x + nodeWidth;
    const y1 = fromPos.y + nodeHeight / 2;
    const x2 = toPos.x;
    const y2 = toPos.y + nodeHeight / 2;
    svg += `<line x1="${x1}" y1="${y1}" x2="${x2 - 6}" y2="${y2}" stroke="${arrowColor}" stroke-width="2" marker-end="url(#arrow)"/>`;
  });

  // Nodes
  nodes.forEach((n) => {
    const { x, y } = positions[n.id];
    svg += `<rect x="${x}" y="${y}" width="${nodeWidth}" height="${nodeHeight}" rx="8" fill="${nodeBg}" stroke="${nodeStroke}" stroke-width="1"/>`;
    svg += `<text x="${x + nodeWidth / 2}" y="${y + nodeHeight / 2 + 6}" text-anchor="middle" font-family="Inter" font-size="16" font-weight="500" fill="${nodeFg}">${escapeXml(n.label)}</text>`;
  });

  svg += `</svg>`;
  return svg;
}

function escapeXml(s) {
  return String(s).replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]));
}

module.exports = { renderFlowDiagram };
