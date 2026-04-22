// gantt-timeline.js — D3 pattern for Gantt-style or milestone timeline.
// Data shape: { milestones: [{ date, label, isCurrent?, duration? }], mode: "milestone" | "gantt" }

function renderGanttTimeline({ milestones, width = 1600, mode = "milestone", tokens = {} }) {
  if (!milestones || milestones.length === 0) return "";

  const height = mode === "gantt" ? milestones.length * 48 + 80 : 200;
  const paddingX = 60;
  const plotWidth = width - paddingX * 2;

  const lineColor = tokens["timeline.line"] || "rgba(255,255,255,0.12)";
  const dotColor = tokens["timeline.dot"] || "#999999";
  const dotCurrent = tokens["timeline.dotCurrent"] || "#ff4d00";
  const dateColor = tokens["milestoneDate.fg"] || "#999999";
  const labelColor = tokens["milestoneLabel.fg"] || "#fafafa";

  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;

  if (mode === "milestone") {
    // Horizontal line + dots
    const y = 100;
    svg += `<line x1="${paddingX}" y1="${y}" x2="${width - paddingX}" y2="${y}" stroke="${lineColor}" stroke-width="2"/>`;

    milestones.forEach((m, i) => {
      const x = paddingX + (i / (milestones.length - 1 || 1)) * plotWidth;
      const color = m.isCurrent ? dotCurrent : dotColor;
      const radius = m.isCurrent ? 12 : 8;

      svg += `<circle cx="${x}" cy="${y}" r="${radius}" fill="${color}"/>`;
      svg += `<text x="${x}" y="${y - 30}" text-anchor="middle" font-family="Inter" font-size="12" letter-spacing="0.08em" fill="${dateColor}">${escapeXml(String(m.date).toUpperCase())}</text>`;
      svg += `<text x="${x}" y="${y + 40}" text-anchor="middle" font-family="Inter" font-size="16" font-weight="500" fill="${labelColor}">${escapeXml(m.label)}</text>`;
    });
  } else {
    // Gantt bars — phase 1 implementation
    svg += `<!-- gantt mode — stub, phase 1 -->`;
  }

  svg += `</svg>`;
  return svg;
}

function escapeXml(s) {
  return String(s).replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]));
}

module.exports = { renderGanttTimeline };
