// data-table.js — D3 pattern for rendering a tabular data view inside a slide.
// Produces SVG with editable text if font family matches a Figma-available font.
//
// Data shape: { headers: [string], rows: [[any]], roleMap?: { headerText, bodyText, divider } }
// Borrowed from luan007/figma-slides-mcp.

function renderDataTable({ headers, rows, width = 1200, rowHeight = 48, tokens = {} }) {
  const colCount = headers.length;
  const colWidth = width / colCount;
  const height = rowHeight * (rows.length + 1);

  const headerFg = tokens["chart.accent"] || "#ff4d00";
  const bodyFg = tokens["chart.fg"] || "#fafafa";
  const dividerColor = tokens["chart.muted"] || "rgba(255,255,255,0.12)";

  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;

  // Header row
  headers.forEach((h, i) => {
    svg += `<text x="${i * colWidth + 16}" y="${rowHeight * 0.7}" font-family="Inter" font-size="13" font-weight="600" fill="${headerFg}" letter-spacing="0.08em">${escapeXml(String(h).toUpperCase())}</text>`;
  });

  // Divider below header
  svg += `<line x1="0" y1="${rowHeight}" x2="${width}" y2="${rowHeight}" stroke="${dividerColor}" stroke-width="1"/>`;

  // Body rows
  rows.forEach((row, r) => {
    const y = rowHeight * (r + 1) + rowHeight * 0.65;
    row.forEach((cell, c) => {
      svg += `<text x="${c * colWidth + 16}" y="${y}" font-family="Inter" font-size="16" fill="${bodyFg}">${escapeXml(String(cell))}</text>`;
    });
    // Row divider (skip last)
    if (r < rows.length - 1) {
      svg += `<line x1="0" y1="${rowHeight * (r + 2)}" x2="${width}" y2="${rowHeight * (r + 2)}" stroke="${dividerColor}" stroke-width="1" opacity="0.5"/>`;
    }
  });

  svg += `</svg>`;
  return svg;
}

function escapeXml(s) {
  return String(s).replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]));
}

module.exports = { renderDataTable };
