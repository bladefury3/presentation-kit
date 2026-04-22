// bar-chart.js — D3 pattern for horizontal or vertical bar chart.
// Data-driven; accent color picks out emphasized bars.
//
// Data shape: { bars: [{ label, value, emphasized?: boolean }], orientation: "horizontal" | "vertical", valueFormatter?: (v) => string }

function renderBarChart({ bars, width = 1200, height = 480, orientation = "vertical", valueFormatter = (v) => String(v), tokens = {} }) {
  if (!bars || bars.length === 0) return "";

  const values = bars.map((b) => b.value);
  const maxValue = Math.max(...values);

  const textPrimary = tokens["chart.fg"] || "#fafafa";
  const textSecondary = tokens["chart.muted"] || "#999999";
  const barColor = tokens["chart.bar"] || "rgba(255,255,255,0.15)";
  const emphasizedColor = tokens["chart.accent"] || "#ff4d00";

  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;

  if (orientation === "vertical") {
    const barSpace = width / bars.length;
    const barWidth = barSpace * 0.6;
    const labelHeight = 40;
    const valueHeight = 32;
    const plotHeight = height - labelHeight - valueHeight;

    bars.forEach((b, i) => {
      const x = barSpace * i + (barSpace - barWidth) / 2;
      const barH = (b.value / maxValue) * plotHeight;
      const y = valueHeight + (plotHeight - barH);
      const color = b.emphasized ? emphasizedColor : barColor;

      // Value label above bar
      svg += `<text x="${x + barWidth / 2}" y="${valueHeight - 8}" text-anchor="middle" font-family="Inter" font-size="18" font-weight="600" fill="${b.emphasized ? emphasizedColor : textPrimary}">${escapeXml(valueFormatter(b.value))}</text>`;
      // Bar
      svg += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" rx="4" fill="${color}"/>`;
      // X-axis label
      svg += `<text x="${x + barWidth / 2}" y="${height - 12}" text-anchor="middle" font-family="Inter" font-size="14" fill="${textSecondary}">${escapeXml(b.label)}</text>`;
    });
  } else {
    // Horizontal bars
    const rowHeight = height / bars.length;
    const labelWidth = 200;
    const valueWidth = 80;
    const plotWidth = width - labelWidth - valueWidth - 32;

    bars.forEach((b, i) => {
      const y = rowHeight * i + rowHeight * 0.5;
      const barY = y - 18;
      const barH = 28;
      const barW = (b.value / maxValue) * plotWidth;
      const color = b.emphasized ? emphasizedColor : barColor;

      svg += `<text x="0" y="${y + 6}" font-family="Inter" font-size="16" fill="${textPrimary}">${escapeXml(b.label)}</text>`;
      svg += `<rect x="${labelWidth}" y="${barY}" width="${barW}" height="${barH}" rx="4" fill="${color}"/>`;
      svg += `<text x="${labelWidth + barW + 12}" y="${y + 6}" font-family="Inter" font-size="16" font-weight="600" fill="${b.emphasized ? emphasizedColor : textPrimary}">${escapeXml(valueFormatter(b.value))}</text>`;
    });
  }

  svg += `</svg>`;
  return svg;
}

function escapeXml(s) {
  return String(s).replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]));
}

module.exports = { renderBarChart };
