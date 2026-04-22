// donut-chart.js — D3 pattern for donut chart. Parts-of-a-whole visualization.
// Data shape: { slices: [{ label, value, color? }], centerLabel?: string, centerValue?: string }

function renderDonutChart({ slices, width = 480, height = 480, innerRadiusRatio = 0.65, centerLabel, centerValue, tokens = {} }) {
  if (!slices || slices.length === 0) return "";

  const cx = width / 2;
  const cy = height / 2;
  const outerR = Math.min(cx, cy) - 40;
  const innerR = outerR * innerRadiusRatio;

  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const textPrimary = tokens["chart.fg"] || "#fafafa";
  const textSecondary = tokens["chart.muted"] || "#999999";
  const accent = tokens["chart.accent"] || "#ff4d00";

  // Default palette (override per slice via slice.color)
  const palette = [accent, "rgba(255,255,255,0.4)", "rgba(255,255,255,0.2)", "rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"];

  let angle = -Math.PI / 2; // start at top
  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;

  slices.forEach((slice, i) => {
    const sliceAngle = (slice.value / total) * 2 * Math.PI;
    const endAngle = angle + sliceAngle;
    const largeArc = sliceAngle > Math.PI ? 1 : 0;
    const color = slice.color || palette[i % palette.length];

    const x1 = cx + outerR * Math.cos(angle);
    const y1 = cy + outerR * Math.sin(angle);
    const x2 = cx + outerR * Math.cos(endAngle);
    const y2 = cy + outerR * Math.sin(endAngle);
    const x3 = cx + innerR * Math.cos(endAngle);
    const y3 = cy + innerR * Math.sin(endAngle);
    const x4 = cx + innerR * Math.cos(angle);
    const y4 = cy + innerR * Math.sin(angle);

    const path = `M${x1},${y1} A${outerR},${outerR} 0 ${largeArc} 1 ${x2},${y2} L${x3},${y3} A${innerR},${innerR} 0 ${largeArc} 0 ${x4},${y4} Z`;
    svg += `<path d="${path}" fill="${color}"/>`;

    // Label on the arc's bisector
    const midAngle = angle + sliceAngle / 2;
    const labelR = (outerR + innerR) / 2;
    const labelX = cx + (outerR + 28) * Math.cos(midAngle);
    const labelY = cy + (outerR + 28) * Math.sin(midAngle);
    const anchor = Math.cos(midAngle) < -0.1 ? "end" : Math.cos(midAngle) > 0.1 ? "start" : "middle";
    svg += `<text x="${labelX}" y="${labelY}" text-anchor="${anchor}" font-family="Inter" font-size="14" fill="${textSecondary}">${escapeXml(slice.label)}</text>`;

    angle = endAngle;
  });

  // Center label
  if (centerValue) {
    svg += `<text x="${cx}" y="${cy - 4}" text-anchor="middle" font-family="Inter" font-size="48" font-weight="600" fill="${textPrimary}">${escapeXml(centerValue)}</text>`;
  }
  if (centerLabel) {
    svg += `<text x="${cx}" y="${cy + 32}" text-anchor="middle" font-family="Inter" font-size="14" fill="${textSecondary}">${escapeXml(centerLabel)}</text>`;
  }

  svg += `</svg>`;
  return svg;
}

function escapeXml(s) {
  return String(s).replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]));
}

module.exports = { renderDonutChart };
