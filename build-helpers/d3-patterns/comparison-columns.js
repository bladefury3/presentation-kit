// comparison-columns.js — D3 pattern for side-by-side comparison panels.
// Two panels with parallel structure; one panel visually emphasized (accent bar).
//
// Data shape: { left: { header, items: [] }, right: { header, items: [] }, emphasis: "left" | "right" }

function renderComparisonColumns({ left, right, emphasis = "right", width = 1690, rowHeight = 48, tokens = {} }) {
  const panelWidth = (width - 48) / 2;
  const height = Math.max(left.items.length, right.items.length) * rowHeight + 120;

  const textPrimary = tokens["chart.fg"] || "#fafafa";
  const textSecondary = tokens["chart.muted"] || "#999999";
  const accent = tokens["chart.accent"] || "#ff4d00";
  const emphasisBg = tokens["emphasisPanel.bg"] || "rgba(255,77,0,0.05)";
  const emphasisStroke = accent;
  const regularBg = tokens["panel.bg"] || "rgba(255,255,255,0.02)";
  const regularStroke = tokens["chart.muted"] || "rgba(255,255,255,0.08)";

  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;

  // Left panel
  const leftX = 0;
  const leftBg = emphasis === "left" ? emphasisBg : regularBg;
  const leftStroke = emphasis === "left" ? emphasisStroke : regularStroke;
  svg += `<rect x="${leftX}" y="0" width="${panelWidth}" height="${height}" rx="12" fill="${leftBg}" stroke="${leftStroke}" stroke-width="${emphasis === "left" ? 2 : 1}"/>`;
  svg += `<text x="${leftX + 32}" y="56" font-family="Inter" font-size="24" font-weight="600" fill="${textPrimary}">${escapeXml(left.header)}</text>`;
  left.items.forEach((item, i) => {
    svg += `<text x="${leftX + 32}" y="${96 + i * rowHeight}" font-family="Inter" font-size="16" fill="${emphasis === "left" ? textPrimary : textSecondary}">• ${escapeXml(item)}</text>`;
  });

  // Right panel
  const rightX = panelWidth + 48;
  const rightBg = emphasis === "right" ? emphasisBg : regularBg;
  const rightStroke = emphasis === "right" ? emphasisStroke : regularStroke;
  svg += `<rect x="${rightX}" y="0" width="${panelWidth}" height="${height}" rx="12" fill="${rightBg}" stroke="${rightStroke}" stroke-width="${emphasis === "right" ? 2 : 1}"/>`;
  svg += `<text x="${rightX + 32}" y="56" font-family="Inter" font-size="24" font-weight="600" fill="${textPrimary}">${escapeXml(right.header)}</text>`;
  right.items.forEach((item, i) => {
    svg += `<text x="${rightX + 32}" y="${96 + i * rowHeight}" font-family="Inter" font-size="16" fill="${emphasis === "right" ? textPrimary : textSecondary}">• ${escapeXml(item)}</text>`;
  });

  svg += `</svg>`;
  return svg;
}

function escapeXml(s) {
  return String(s).replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]));
}

module.exports = { renderComparisonColumns };
