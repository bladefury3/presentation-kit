# Benchmarks

Skill evaluation infrastructure for presentation-kit. Shipped as scaffolding in Phase 0; wired up by `/eval-skills` in v0.2.

## Structure

```
benchmarks/
├── test-cases/       # Canned briefs by skill + scenario
│   └── <skill-id>/<scenario-slug>.md
├── rubrics/          # Shared + per-skill scoring criteria
│   ├── shared.md
│   └── <skill-id>.md
└── results/          # Timestamped scores + baseline (.gitignored per .gitignore)
    └── <YYYY-MM-DD>/
        └── <skill-id>.json
```

## How it works (v0.2)

`/eval-skills` simulates a skill against a test case, captures the output, scores it against the rubric via LLM-as-judge, and writes the result to `results/<date>/<skill-id>.json`. A dashboard (`dashboard.html` — v0.2) visualizes trends across runs.

## Adding a test case

1. Create `benchmarks/test-cases/<skill-id>/<scenario-slug>.md`.
2. Include: context, canned input, expected artifacts, grading criteria.
3. Reference the rubric: `benchmarks/rubrics/<skill-id>.md`.

## Shipped test cases (Phase 0)

- `test-cases/smoke-test/lumen-series-b.md` — the canonical end-to-end smoke test case (10-slide Series B pitch via Strategic Narrative). Used by `TEST-CHECKLIST.md`.

More test cases will be added as skills ship in Phase 1-2.

## Rubrics (v0.2)

Shared scoring dimensions (0–10 each):
- **Narrative coherence** — arc beats map cleanly; ghost-deck test ≥ 7
- **Visual design** — template fidelity, token compliance, layout variety
- **Content quality** — action titles, no placeholder, voice-audit pass
- **Accessibility** — contrast, reading order, alt text, reduced-motion
- **Citations** — every claim has a source; research.json exists

Composite = weighted average. `/handoff` gates at composite ≥ 8/10.
