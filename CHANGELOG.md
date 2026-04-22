# Changelog

All notable changes to presentation-kit are documented here.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.1.0] — 2026-04-22

### Added — Phase 0 scaffolding

- Repository scaffolded with gstack-pattern conventions (mirrors sibling `design-kit`).
- Top-level docs: `CLAUDE.md`, `ETHOS.md`, `PRINCIPLES.md`, `README.md`, `TEST-CHECKLIST.md`.
- `setup` installer + `lint-skills.sh` validator.
- 5 JSON schemas: `deck`, `slide`, `arc`, `template`, `research`.
- 11 shared helpers covering design-system loading, tool selection, 5-layer build model, slide grid, text mastery, speaker-notes escape hatch, visualization chooser, anti-patterns, asset sources, screenshot validation, and decision capture.
- 13 slide templates (registry data, not skills) + index.
- 6 D3 chart patterns from `luan007/figma-slides-mcp` (data-table, flow-diagram, comparison-columns, bar-chart, gantt-timeline, donut-chart).
- Build helpers: `slide-helpers.js`, `text-pack.js`, `layout-pack.js`, `template-instantiate.js`, `image-provider.js` (stubs).
- Speaker-notes escape-hatch smoke test to validate architecture decision D3.
- `decisions/RESEARCH.md` seeded with architecture rationale.

### Added — Phase 1 (Foundation → Skeleton Deck)

9 skills covering the full pipeline from brief to rendered skeleton deck in Figma Slides:

- **`/brief`** — Define problem / audience / single CTA / duration / tone. Folds in gather-context (files, URLs, pasted text). Outputs `plans/<deck>/brief.md` + `discovery.md`.
- **`/research`** — Researcher agent. WebSearch + WebFetch + user docs → cited claim map with confidence levels. Outputs `plans/<deck>/research.json`.
- **`/outline`** — Action-titled outline with in-pass action-title-lint, ghost-deck-test gate (≥ 7/10 to proceed), voice audit. Outputs `outline.md` + `ghost-deck.md`.
- **`/arc`** — Four arcs via `--type=scqa|narrative|sparkline|10-20-30`. Maps every slide to a beat, computes emphasis curve, runs narrative-auditor in-pass. Outputs `arc.json` + `narrative-audit.md`.
- **`/setup-deck`** — One-time brand + tokens + motion + color-modes + file scaffold. Five modes: `--brand`, `--tokens`, `--motion`, `--file`, `--all`. Writes all `design-system/*` artifacts.
- **`/setup-templates`** — Builds 13 Figma template masters on a dedicated Templates page. Wires variantKeys into the template registry.
- **`/style-preview`** — 3-direction aesthetic preview gate (zarazhangrui pattern). Renders variants on a sample slide; user picks; writes `aesthetic.json`.
- **`/plan-deck`** — Compiler. Maps slides → templates, resolves content + tokens + claim citations, produces `deck.json` + per-slide specs + flat `tasks.md` execution contract.
- **`/build`** — Executor. Runs `tasks.md` via the 5-layer build model (Background → Structure → Graphics → Typography → Polish) with screenshot validation between each layer. Serial, 3-fix-iteration limit, append-only `build-log.md`.

### Fixed

- **lint-skills.sh:** awk tool-extraction bug that caused `sub()` to mutate `$0`, letting the subsequent reset rule fire on the mutated line — only the first tool in `allowed-tools` was being validated. Now captures the full list honestly. Added `Glob` + `Grep` to the valid-tool allowlist (both are standard Claude Code tools).

### Planned — Phase 2 (Rich + Ship)

5 skills: `image`, `motion`, `notes`, `rehearse`, `handoff`.
