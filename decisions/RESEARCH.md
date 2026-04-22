# Architecture Decisions — presentation-kit

Append-only log of meaningful architectural decisions for presentation-kit. Separate from `design-system/decisions.md` (which logs per-deck content decisions). This file captures *why the project is the way it is*.

## 2026-04-22 — Initial scaffolding

### Context

The user (author of sibling project `design-kit`) asked for a new skill system focused on presentations targeting Figma Slides via the `figma-console` MCP server. Research surfaced that this is an open lane:
- Only one mature community skill targets Figma Slides (`luan007/figma-slides-mcp`, 6 stars)
- Official Figma MCP does not support Slides yet
- No AI presentation tool (Gamma, Beautiful.ai, Copilot, Canva) ships a first-class narrative arc picker

### Decisions

**D1. gstack-pattern project shape, mirroring design-kit.**
Why: the user authored design-kit; conventions are proven (SKILL.md per skill, `shared/`, `schemas/`, `plans/`, `lint-skills.sh`, `package.json`, `VERSION`, `CHANGELOG.md`). Lowest-risk way to ship a new system in their ecosystem.

**D2. 14-skill MVP, 2 phases, not 43 skills, 4 phases.**
Why: user explicitly pushed back on over-engineering; consolidated with `--mode` flags where logic shares ≥50%. Foundation → Skeleton (9 skills); Rich + Ship (5 skills). Deferred: `eval-skills`, `presentation-kit-upgrade`, `slide-from-notes`, `capture-url`, `brainstorm-arcs`, `stress-test`, `cleanup`.

**D3. Four arcs as modes of one `/arc` skill.**
Why: SCQA, Strategic Narrative, Sparkline, 10/20/30 share ~80% of logic (validate outline against beats). Single skill with `--type=<arc>` is cleaner than four separate skills.

**D4. Slides-first authoring (not Design-mode-commit).**
Why: Figma Slides has native transition + speaker-notes affordances that raw Design-mode frames can't express. Committing directly to Slides preserves these. Design mode is used only for template masters (authored once, instantiated many).

**D5. Two-layer source of truth: `outline.md` (human) + `deck.json` (machine).**
Why: Mirrors design-kit's `plan.md` + `build.json` split. User edits `outline.md`; `/plan-deck` compiles to `deck.json`. User never hand-edits compiled form.

**D6. Speaker-notes via `figma_execute` escape hatch (Plugin API), one shared helper.**
Why: `figma-console` has no typed tool for `slide.speakerNotes`. `shared/speaker-notes-helper.md` owns the canonical snippet; every skill reads it. One place to fix if Plugin API changes.

**D7. Image generation: external provider via Bash → `figma_set_image_fill`.**
Why: No native image generation in `figma-console`. Shelling out to OpenAI / Gemini / Replicate via Bash, then applying via `figma_set_image_fill` (accepts URL or base64). Provider config pluggable via `design-system/image-provider.json`.

**D8. Template library as data, not code.**
Why: Extensibility. A user drops `templates/<new>.json` and it's auto-wired into `/plan-deck` via `index.json`. Slot-fill engine in `build-helpers/template-instantiate.js` is generic. No per-template code.

**D9. 5-layer build model from `luan007/figma-slides-mcp`.**
Why: Background → Structure → Graphics → Typography → Polish with screenshot-between-layers is the cleanest abstraction for slide authoring. Proven in a prior art skill. Shared as `shared/build-layers.md`.

**D10. Parallel QA with healing threshold ≥ 8/10.**
Why: Four QA dimensions (narrative / design / content / a11y) dispatched as subagents; composite below threshold triggers a healing loop (max 3 iterations). Pattern from `agentic-slides` + `SlideSmith`.

**D11. Ghost-deck test as gate between `/outline` and `/plan-deck`.**
Why: Academic-pptx-skill's "titles alone tell the story" test is cheap and catches muddled narrative before expensive visual work. ≥ 7/10 score required to proceed.

**D12. Figma-console MCP, not official Figma MCP.**
Why: Official Figma MCP does not support Slides (as of 2026-04). `figma-console` is the only viable server. Any "works on both" claim is false today.

### What we rejected

- **One skill per arc (4 separate skills).** Rejected for code duplication and clutter.
- **Separate `audit` / `review-deck` / `handoff` skills.** Rejected; folded into unified `/handoff` with modes.
- **Design-mode-first authoring + Slides commit.** Rejected — loses native transitions and speaker notes.
- **Claude.ai Project (web UI) as primary shape.** Rejected — user confirmed they want a local Claude Code skill system.
- **Building on luan007's MCP directly.** Rejected — `figma-console` is what the user has installed; tool-name translation layer documented in `shared/slides-tool-selection.md`.

### Open questions (resolve during Phase 1-2)

- **Default image provider:** OpenAI `gpt-image-1` vs. Gemini Imagen. Pluggable; picks one at `/setup`.
- **GitHub repo visibility:** private (default until MVP) vs. public (like design-kit).
- **Exact font defaults:** currently spec'd as Inter + Playfair Display; confirm with user at first `/setup`.
- **gstack integration depth:** design-kit has `.gstack/` logs; should presentation-kit wire gstack skills (e.g. `/browse` for sourcing images, `/checkpoint`) into its dev loop? Probably yes, confirm during usage.

### References

- Plan file: `/Users/sidharathchhatani/.claude/plans/claude-project-not-a-curried-meerkat.md`
- Research cited in plan: `luan007/figma-slides-mcp`, `Julianlapis/agentic-slides`, `Gabberflast/academic-pptx-skill`, `zarazhangrui/frontend-slides` (15.2k ⭐), `aryankumawat/SlideSmith`, Gamma, Beautiful.ai, Decktopus, Copilot Speaker Coach, Canva Magic Layers.
- Arc frameworks: Minto (McKinsey), Duarte (Resonate), Raskin (strategic narrative), Kawasaki (10/20/30).
