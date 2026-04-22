# Build Tasks Template

Template for `plans/<deck>/tasks.md`. `/plan-deck` produces this; `/build` executes it with zero runtime decisions. Every task is pre-resolved, flat, and phase-ordered.

## Header

```markdown
# Deck Build Tasks: <DECK TITLE>

Slides: N · Arc: <arc-type> · Aesthetic: <aesthetic-name> · Duration: <target>

Source: plans/<deck-slug>/deck.json
Templates: design-system/templates/index.json
```

## Phase 0 — Pre-flight (one-time)

```markdown
## Phase 0 — Pre-flight

- [ ] P0-01 [SEARCH] figma_search_components for template masters: title, section-divider, stat-callout, ...
- [ ] P0-02 [READ] design-system/{tokens.json, typography.json, motion.json, color-modes.json}
- [ ] P0-03 [FONT] Pre-flight fonts: "<family-1>" <styles>, "<family-2>" <styles>
- [ ] P0-04 [VERIFY] figma_list_slides — confirm deck is a Slides file, not Design
```

## Phase 1 — Scaffold

```markdown
## Phase 1 — Scaffold (N slides)

- [ ] P1-01 [CREATE] figma_create_slide → slide-1
- [ ] P1-02 [CREATE] figma_create_slide → slide-2
- [ ] P1-NN [CREATE] figma_create_slide → slide-N
```

## Phase 2 — Per-slide build (repeat for each)

```markdown
### Slide N — <action title>

Template: <template-id> · Beat: <beat-id> · Tokens mode: <dark|light>

- [ ] PN-L1 [BG] figma_set_slide_background(slide-N, <color-token>)
- [ ] PN-L1 [SCREENSHOT] scale:1 → check bg applied
- [ ] PN-L2 [STRUCT] figma_instantiate_component(<variantKey>) → slot-fill per <template>.slots
- [ ] PN-L2 [SCREENSHOT] scale:1 → check structure placed
- [ ] PN-L3 [GFX] <image | chart | icon actions>
- [ ] PN-L3 [SCREENSHOT] scale:1 → check graphics render
- [ ] PN-L4 [TYPE] figma_add_text_to_slide for each slot
- [ ] PN-L4 [RANGE] figma_execute for range styles (text-mastery dance)
- [ ] PN-L4 [SCREENSHOT] scale:1 → check typography
- [ ] PN-L5 [POLISH] <alignment + spacing + accent actions>
- [ ] PN-L5 [SCREENSHOT] scale:1 → final; write to screenshots/N.png
```

## Phase 3 — Transitions

```markdown
## Phase 3 — Transitions

- [ ] P3-01 [TRANS] figma_set_slide_transition(slide-1, {type, direction, duration, easing})
- [ ] P3-02 [TRANS] figma_set_slide_transition(slide-2, ...)
- [ ] P3-NN [TRANS] figma_set_slide_transition(slide-N, ...)
- [ ] P3-V  [VERIFY] figma_set_slides_view_mode("grid") → spot-check
```

## Phase 4 — Speaker notes

```markdown
## Phase 4 — Speaker notes

- [ ] P4-01 [NOTES] figma_execute batch (≤ 20 slides per batch): slide.speakerNotes = <text>
- [ ] P4-NN [NOTES] ...additional batches
- [ ] P4-V  [VERIFY] Read back slide.speakerNotes.length for each slide; all > 0
```

## Phase 5 — Validation

```markdown
## Phase 5 — Validation

- [ ] P5-01 [AUDIT] Design audit: token compliance, hierarchy, layout variety, placeholder scan
- [ ] P5-02 [A11Y] Contrast, reading order, alt text, reduced-motion
- [ ] P5-03 [QA] parallel-qa: dispatch 4 subagents → aggregate score
- [ ] P5-04 [HEAL] If composite < 8/10, dispatch revise-deck (max 3 iterations)
- [ ] P5-05 [HANDOFF] Bundle: deck link + screenshots + notes + bibliography + QA report
```

## Task ID convention

`<phase>-<sequence>` or `<slide>-<layer>`. Examples:

- `P0-01` — Phase 0, first task
- `P2-L3` — slide 2, Layer 3
- `P3-NN` — Phase 3, task NN
- `P4-V` — Phase 4, verification step

## Execution contract

- Zero runtime decisions. Every `<variantKey>`, `<color-token>`, `<text>` is pre-resolved by `/plan-deck`.
- Each task is atomic: either completes or fails (never partial).
- Max 3 fix iterations per screenshot failure. Then flag + move on.
- Strict phase ordering. Phase N+1 cannot start until Phase N completes.
