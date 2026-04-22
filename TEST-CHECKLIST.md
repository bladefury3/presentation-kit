# Test Checklist

End-to-end smoke tests for presentation-kit. Run these before shipping any release that touches core skills or architecture.

Canned brief: **"10-slide Series B pitch for Lumen, a fictional enterprise time-tracking startup raising a $40M round. Audience: tier-1 VCs. Duration: 15 min. Arc: Strategic Narrative. Brand: editorial-serif, warm neutrals."**

## Phase 0 — Scaffolding (checked on first install)

- [ ] 1. `./setup --help` prints usage and exits 0.
- [ ] 2. `./lint-skills.sh` exits 0 (empty is fine during Phase 0).
- [ ] 3. All 11 `shared/*.md` files exist and are referenced somewhere.
- [ ] 4. All 5 JSON schemas parse as valid JSON Schema draft 2020-12.
- [ ] 5. `design-system/templates/index.json` references all 13 template files and each file parses.
- [ ] 6. `build-helpers/d3-patterns/` contains 6 pattern files (data-table, flow-diagram, comparison-columns, bar-chart, gantt-timeline, donut-chart).
- [ ] 7. Speaker-notes escape-hatch smoke test passes: `slide.speakerNotes` is writable via `figma_execute` on a throwaway slide.

## Phase 1 — Foundation → Skeleton Deck (after Phase 1 ships)

- [ ] 8. `/setup` — Interviews brand, writes `design-system/{brand,tokens,typography,motion,color-modes}.json` + `content-voice.md` + `slide-file-structure.md`. Figma file has title / section-divider / closing scaffolds.
- [ ] 9. `/setup-templates` — `design-system/templates/index.json` lists ≥13 templates. Each template JSON has slot definitions, auto-layout config, token bindings.
- [ ] 10. `/brief` — `plans/lumen/brief.md` has HMW, audience, single CTA, duration, tone.
- [ ] 11. `/research` — `plans/lumen/research.json` has ≥20 claim entries with URL/quote/retrievedAt per claim.
- [ ] 12. `/outline` — `plans/lumen/outline.md` has 10 action-titled slides (no topic-label titles). `ghost-deck.md` score ≥ 7/10.
- [ ] 13. `/arc --type=narrative` — `plans/lumen/arc.json` maps all 10 slides to Raskin beats (enemy / promised-land / obstacles / magic-gifts / proof). `narrative-audit.md` confirms beat completeness + emphasis curve.
- [ ] 14. `/style-preview` — 3 aesthetic directions rendered as Figma frames on a sample slide. User picks one → `aesthetic.json` written.
- [ ] 15. `/plan-deck` — `deck.json` + 10 `slides/<nn>.json` + `tasks.md`. Every slide has: action title, template, beat, tokens, `sources[]`. Template coverage ≥ 70%. No two consecutive slides share a template.
- [ ] 16. `/build` — 10 slides rendered in Figma Slides. Per-layer screenshot saved for each (5 layers × 10 slides = 50 screenshots). No phantom heights, no placeholder text, no overlapping content.

## Phase 2 — Rich + Ship (after Phase 2 ships)

- [ ] 17. `/image --layered` — Each slide that needs an image gets bg + mid + fg PNGs applied via `figma_set_image_fill` on separate Figma layers. Text above images remains editable.
- [ ] 18. `/motion --transitions` — Every slide has a `transition` applied (dissolve, smart-animate, or push). `/motion --choreograph` produces cross-slide smart-animate sequences for key beats.
- [ ] 19. `/notes --generate --timing --qa-prep --coach` — Every slide's `slide.notes` populated via `figma_execute` escape hatch. Notes include `[~XXs]` timing markers that sum to the target duration (±10%). Q&A prep has ≥3 anticipated questions per key slide.
- [ ] 20. `/rehearse` — Reads notes aloud via `say` / TTS, times delivery per slide, flags sentences > 25 words, unpronounceable acronyms, pacing deviations > 20% from target.
- [ ] 21. `/handoff` — Audits design + a11y. Parallel QA scores ≥ 8/10 composite (narrative / design / content / a11y). Healing loop iterates until threshold or 3 tries. `handoff/` bundle contains: deck link, `screenshots/*.png`, notes markdown, bibliography from `research.json`, QA report, export checklist.

## Regression gates (run on every release)

- [ ] R1. No claim in any `slide.notes` or body copy lacks a `sources[]` entry.
- [ ] R2. No slide has a topic-label title (regex check: `^[A-Z][a-z ]+$` with no verb).
- [ ] R3. `parallel-qa` composite score on the canned brief stays ≥ 8/10 across releases.
- [ ] R4. Speaker-notes escape hatch still works (Plugin API contract check).
- [ ] R5. `lint-skills.sh` passes on all shipped SKILL.md files.
