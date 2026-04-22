# Presentation Kit

AI-powered presentation skills for Claude Code, Cursor, and other MCP-compatible AI tools. Targets **Figma Slides** via the `figma-console` MCP server.

Turn a brief into a defensible deck: research → outline → narrative arc → visual design → slides → motion → speaker notes → rehearsal → handoff. No generic templates, no stock slop.

## What makes this different

**Narrative arc as a first-class choice.** Pick SCQA, Strategic Narrative, Sparkline, or 10/20/30 up front. Outlines are validated against arc beats before a pixel is drawn. No incumbent presentation tool does this.

**Action titles enforced.** Every slide's title is a full-sentence takeaway, not a topic label. "Market Size" is rejected; "The market is growing 40% year over year" is accepted. A ghost-deck test scores your titles as a standalone essay before the deck is built.

**Visual > verbal.** A visualization chooser at plan time picks charts, diagrams, or grids over bullet lists whenever possible.

**Cited speaker notes.** Every claim on a slide traces to a source in `research.json`. Notes include citations. Your deck is defensible.

**Rehearsal coach.** An interactive rehearse skill times your delivery, flags long sentences, unpronounceable acronyms, and pacing drift. Parity with Copilot Speaker Coach — shipped as a Claude skill.

## What you get (v0.1 — MVP, 14 skills, 2 phases)

### Phase 1 — Foundation → Skeleton Deck

| Command | What it does |
|---|---|
| `/setup-deck` | Interviews brand identity → writes tokens, typography, motion, color-modes, file structure |
| `/setup-templates` | Profiles existing Figma slide-masters + registers 13 built-in templates |
| `/brief` | Defines problem, audience, single CTA, duration, tone |
| `/research` | Researcher agent (WebSearch + your docs) → cited claim map in `research.json` |
| `/outline` | Action-titled outline + ghost-deck test + voice audit |
| `/arc` | Picks narrative arc: `--type=scqa\|narrative\|sparkline\|10-20-30` + beat mapping |
| `/style-preview` | 3 aesthetic directions rendered on a sample slide — you pick one |
| `/plan-deck` | Compiles outline + arc + aesthetic + research → `deck.json` + per-slide specs |
| `/build` | Executes deck.json in Figma Slides via the 5-layer build model |

### Phase 2 — Rich + Ship

| Command | What it does |
|---|---|
| `/image` | Per-slide image generation via external provider; `--layered` produces bg/mid/fg as editable Figma layers |
| `/motion` | Transitions + cross-slide Smart Animate + audit for missing / excessive motion |
| `/notes` | Speaker notes: `--generate` / `--timing` (`[~45s]` markers) / `--qa-prep` / `--coach` |
| `/rehearse` | Interactive rehearsal: reads aloud via TTS, times you, flags pacing and clarity issues |
| `/handoff` | Audits + parallel QA (4 subagents) + healing loop (≥ 8/10 score gate) + shareable bundle |

## Deferred to v0.2

`eval-skills`, `presentation-kit-upgrade`, `slide-from-notes`, `capture-url`, `brainstorm-arcs`, `stress-test`, `cleanup`.

---

## Prerequisites

1. **An AI tool with MCP support** — [Claude Code](https://docs.anthropic.com/en/docs/claude-code), [Cursor](https://cursor.com), [Windsurf](https://windsurf.com).
2. **Figma Desktop** with a Slides file open.
3. **[Figma Console MCP](https://github.com/nichochar/figma-console-mcp)** — the Desktop Bridge plugin running in your Figma file.

## Installation

### Option A: Claude Code (global)

```bash
git clone https://github.com/bladefury3/presentation-kit.git ~/.presentation-kit
cd ~/.presentation-kit && ./setup
```

### Option B: Project-local

```bash
git clone https://github.com/bladefury3/presentation-kit.git
cd presentation-kit && ./setup --local
```

### Option C: Cursor

```bash
git clone https://github.com/bladefury3/presentation-kit.git ~/.presentation-kit
cd ~/.presentation-kit && ./setup --cursor=/path/to/your/project
```

### Figma Console MCP configuration

Add to `~/.claude/settings.json` (Claude Code) or `.cursor/mcp.json` (Cursor):

```json
{
  "mcpServers": {
    "figma-console": {
      "command": "npx",
      "args": ["-y", "figma-console-mcp"]
    }
  }
}
```

Then open your Figma Slides file and run the **Desktop Bridge** plugin (Plugins → Development → Figma Desktop Bridge).

---

## Your first 15 minutes

```
Step 1:  Open a Figma Slides file. Run the Desktop Bridge plugin.
Step 2:  /setup-deck
         → Interviews brand identity, writes design-system/*,
           scaffolds title / section / closing slides.
Step 3:  /setup-templates
         → Registers 13 shipped templates in the registry.
Step 4:  /brief
         → HMW, audience, CTA, duration, tone. 3-4 questions.
Step 5:  /research
         → Cites claims into research.json.
Step 6:  /outline → /arc → /style-preview → /plan-deck → /build
         → Skeleton deck in Figma Slides.
Step 7:  /image → /motion → /notes → /rehearse → /handoff
         → Rich, rehearsed, audited, shipped.
```

## Common workflows

### "I need a 10-minute pitch by tomorrow"

```
/brief                     → 10-min, VC audience, single ask
/research                  → cited claims
/outline                   → action titles; ghost-deck gate
/arc --type=narrative      → Raskin strategic narrative
/style-preview             → pick aesthetic
/plan-deck → /build        → skeleton in Figma Slides
/image --layered           → per-slide images
/notes --generate --timing → speaker notes with pacing markers
/handoff                   → audit + bundle
```

### "I have a 30-page research doc — make it a 20-min exec update"

```
/brief                       → "leadership review, 20 min, decision needed"
/research --source=doc.pdf
/outline
/arc --type=scqa             → Minto: front-load the answer
/plan-deck → /build
/notes --timing              → 20-min budget
/rehearse                    → catch pacing drift
```

### "Make my deck not look generic"

```
/style-preview   → commit to one of 3 distinct aesthetic directions before any slide
/plan-deck       → enforces layout variety (no two consecutive same-template slides)
/handoff         → parallel QA catches AI slop patterns
```

### "I'm nervous about speaker notes"

```
/notes --generate --qa-prep  → claim + evidence + transition + anticipated Q&A per slide
/notes --timing              → [~45s] markers
/rehearse                    → times you, flags long sentences, unpronounceable acronyms
```

---

## How it works

```
Phase 1: FOUNDATION → SKELETON DECK
  /setup-deck → /setup-templates → /brief → /research → /outline → /arc → /style-preview
    → /plan-deck → /build
  End state: structurally complete skeleton deck in Figma Slides
             (action titles, arc beats, brand tokens, template-correct layouts)

Phase 2: RICH + SHIP
  /image → /motion → /notes → /rehearse → /handoff
  End state: rich, rehearsed, audited, score-≥8/10 deck + shareable bundle
```

Skills read from and write to three local directories:

| Directory | What's in it | Created by |
|---|---|---|
| `design-system/` | Brand, tokens, typography, motion, color-modes, templates, decisions | `/setup-deck`, `/setup-templates` + all skills (decisions log) |
| `plans/<deck-slug>/` | Per-deck: brief, research, outline, arc, deck.json, slides/, notes, qa, handoff bundle | `/brief`, `/research`, `/outline`, `/arc`, `/plan-deck`, `/build`, `/notes`, `/handoff` |
| `benchmarks/` | Test cases, rubrics, results | `/eval-skills` (v0.2) |

---

## Architecture

See [`CLAUDE.md`](CLAUDE.md) for the full project structure, the 15 core directives, and skill-developer conventions. See [`PRINCIPLES.md`](PRINCIPLES.md) for storytelling frameworks, typography, coordinate grid, color system, cognitive load laws, and the AI Slop Check. See [`ETHOS.md`](ETHOS.md) for the design philosophy.

Some of the key architectural decisions:

- **Slides-first authoring.** Skills commit directly to Figma Slides — not to Design-mode frames we later export. Templates are authored once as slide-masters in Design mode; instances are placed on slides.
- **Outline (human) + deck.json (machine) two-layer.** You edit `outline.md`. `/plan-deck` compiles to `deck.json`. You never hand-edit the compiled form.
- **Speaker notes via escape hatch.** `figma-console` has no typed tool for speaker notes; we use `figma_execute` + Plugin API (`slide.speakerNotes = "..."`). One shared helper. Validated on day-one smoke test.
- **Image generation external → `figma_set_image_fill`.** `/image` shells out to configurable provider (OpenAI / Gemini / Replicate) via Bash, then applies via `figma_set_image_fill`. Provider lives in `design-system/image-provider.json`.

---

## Design principles

Presentation Kit embeds established frameworks into every skill:

- **Storytelling arcs** — SCQA (Minto), Strategic Narrative (Raskin), Sparkline (Duarte), 10/20/30 (Kawasaki)
- **Visual > Verbal** — visualization chooser enforced at plan time
- **Gestalt + Cognitive Load** — Hick's, Miller's, Fitts's, Von Restorff applied to slide density
- **5-layer build model** — Background → Structure → Graphics → Typography → Polish (from `luan007/figma-slides-mcp`)
- **Ghost-deck test** — titles alone must tell the story (from `academic-pptx-skill`)
- **AI Slop Check** — catches generic card grids, stock hero images, bullet-list defaults

See [PRINCIPLES.md](PRINCIPLES.md).

---

## Credits & prior art

Presentation Kit stands on work from:

- **[luan007/figma-slides-mcp](https://github.com/luan007/figma-slides-mcp)** — 5-layer build model, typography role mapping, coordinate grid, 6 D3 chart patterns, anti-patterns format, text-mastery dance.
- **[Gabberflast/academic-pptx-skill](https://github.com/Gabberflast/academic-pptx-skill)** — action-title enforcement, ghost-deck test.
- **[Julianlapis/agentic-slides](https://github.com/Julianlapis/agentic-slides)** — parallel QA subagents with healing threshold.
- **[zarazhangrui/frontend-slides](https://github.com/zarazhangrui/frontend-slides)** — 3-style preview gate pattern.
- **Nancy Duarte**, **Andy Raskin**, **Barbara Minto**, **Guy Kawasaki** — the arc frameworks.
- **Canva Magic Layers** — layered AI image pattern.
- **Microsoft Copilot Speaker Coach** — the rehearsal-coach inspiration.

---

## Uninstall

```bash
cd ~/.presentation-kit && ./setup --uninstall
```

## License

MIT — see [LICENSE](LICENSE).

## Author

Sidharath Chhatani
