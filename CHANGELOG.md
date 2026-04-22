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

### Planned — Phase 1 (Foundation → Skeleton Deck)

9 skills: `setup`, `setup-templates`, `brief`, `research`, `outline`, `arc`, `style-preview`, `plan-deck`, `build`.

### Planned — Phase 2 (Rich + Ship)

5 skills: `image`, `motion`, `notes`, `rehearse`, `handoff`.
