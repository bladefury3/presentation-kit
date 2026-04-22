# Visualization Chooser

Heuristic table for picking the right visual form for content. Enforced at plan time by `/outline` and `/plan-deck`. "Visual > Verbal" is principle #6 of presentation-kit. Borrowed from `luan007/figma-slides-mcp`.

## The table

| You have… | Use this | Template | NOT this |
|---|---|---|---|
| Two things to compare | Side-by-side panels with parallel structure | `comparison`, `2-column` | Paragraph describing differences |
| A process / sequence | Flow diagram with arrows | `chart` + `d3-flow-diagram` | Numbered list |
| Parts of a whole | Donut or stacked bar | `chart` + `d3-donut-chart` | Table of percentages |
| Change over time | Line chart, bar chart, Gantt | `chart` + `d3-bar-chart` / `d3-gantt-timeline` | Text describing timeline |
| Categories / taxonomy | Card grid or tag pills | `3-column`, `team` | Bullet list |
| Hierarchy / layers | Stack diagram or nested cards | `2-column` (left label, right stack) | Indented list |
| Relationships | Radial or network diagram | `chart` + custom SVG | Text describing connections |
| A key metric | Giant number + small label | `stat-callout` | Sentence with number embedded |
| Pros vs cons | Check/X comparison columns | `comparison` | Two bullet lists |
| A timeline | Horizontal timeline with milestones | `timeline`, `chart` + `d3-gantt-timeline` | "First… then… then…" paragraph |
| Agenda / TOC | Numbered section list | `agenda` | Dense paragraph introduction |
| Opening | Oversized title + ambient image | `title`, `image-full-bleed` | Title slide with bullets |
| Closing / CTA | Single action with whitespace | `closing-cta` | List of "next steps" |
| Pull quote | Large quote with attribution | `quote` | Quote embedded in body |
| A tabular matrix | Data table with role-based text color | `chart` + `d3-data-table` | Bulleted list of rows |
| Raw data (rare) | Compact table inside a card | `chart` + `d3-data-table` | Spreadsheet screenshot |

## Decision rule

**Before building any slide with body content, ask:**

1. What is the relationship between the elements? (Comparison / sequence / parts-of-whole / change / category / hierarchy / relationship / metric / timeline)
2. Does a visual form in the table above carry that relationship?

**If yes, use the visual form.** Text is the fallback, not the default.

## When text IS the answer

Use text (bullets, paragraphs) only when:
- The content is genuinely a **quote** (single authoritative statement)
- The content is a **declarative claim** that needs no supporting structure ("Churn fell 40%.")
- The slide is a **section divider** (1-2 words)
- The content is **speaker guidance** that doesn't belong on-screen (move to notes)

**If you find yourself about to write > 2 bullets, check the table. Most lists hide a visualization.**

## Anti-patterns (flagged at audit)

- ✗ 5 bullets on one slide — should be a card grid, stat row, or 5 slides
- ✗ Table of percentages — should be a donut or stacked bar
- ✗ Paragraph describing a process — should be a flow diagram
- ✗ "First, Second, Third" in a bulleted list — should be numbered cards or steps
- ✗ Two paragraphs contrasting options — should be a comparison template
- ✗ Numbered list of events with dates — should be a timeline

## When the data is genuinely messy

Some content resists clean visualization (philosophical arguments, subjective assessments, legal text). In that case:

1. **Reduce to a single pull quote.** One sentence on a mostly-empty slide.
2. **Split across multiple slides.** One idea per slide.
3. **Move to speaker notes.** If it's context the audience doesn't need to read, the presenter delivers it verbally.

Do NOT force a dense text slide. Every slide must have ONE takeaway visible in 3 seconds.
