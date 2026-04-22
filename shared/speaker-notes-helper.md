# Speaker Notes Helper

**This is the ONE canonical helper for writing speaker notes.** Every skill that writes speaker notes MUST use this snippet. Do not re-derive. Do not inline. One contract, one place to fix if the Plugin API changes.

## Why this is a separate helper

`figma-console` MCP has **no typed tool** for slide speaker notes. The Figma Plugin API exposes `slide.speakerNotes` as a simple string property. We set it via `figma_execute`.

This is architecture decision **D3** in the project plan. Validated on day one via the smoke test in `smoke-test-speaker-notes.js`.

## The canonical snippet

Use this exact shape. Substitute `<slideId>` and escape the notes string.

```javascript
// Run via figma_execute with documentAccess: "dynamic-page"
// Returns { ok: true, noteLength: <number> } on success.
const slide = await figma.getNodeByIdAsync('<slideId>');
if (!slide) {
  throw new Error(`Slide not found: <slideId>`);
}
if (slide.type !== 'SLIDE') {
  throw new Error(`Expected SLIDE, got ${slide.type} for <slideId>`);
}

// The notes string. Keep under ~500 chars per slide — ~120 words, ~45–60s at speaking pace.
const notes = `<notes-string-here>`;

slide.speakerNotes = notes;

return { ok: true, noteLength: notes.length };
```

## Escaping the notes string

Notes often contain quotes, newlines, and Unicode. Always:

1. **Backtick-quoted** in the Plugin API snippet (template literal — supports newlines natively).
2. **Escape backticks in content** by replacing ` with \` before embedding.
3. **Preserve `\n` as actual newlines** — the backtick string supports them. Figma renders them as paragraph breaks in the presenter-notes panel.

Example:
```javascript
const notes = `[~45s] Open with the enemy.

The enemy is the trial-sign-up pattern. Every SaaS company thinks it's giving users a chance to try — really it's training users to evaluate and leave.

Pause here. Let it land.

Transition: "So what happens if we kill the trial?"`;
```

## Batch writing (for /notes over the whole deck)

```javascript
// Run via figma_execute — writes notes to multiple slides in one round trip
const assignments = /* array of { slideId, notes } */;
const results = [];

for (const { slideId, notes } of assignments) {
  const slide = await figma.getNodeByIdAsync(slideId);
  if (!slide || slide.type !== 'SLIDE') {
    results.push({ slideId, ok: false, error: `not a slide: ${slide?.type}` });
    continue;
  }
  slide.speakerNotes = notes;
  results.push({ slideId, ok: true, noteLength: notes.length });
}

return results;
```

**Limits:**
- Keep batch under 20 slides per `figma_execute` call (30s timeout).
- Do not combine note-writing with other slide mutations in the same script — isolate for clean error boundaries.

## Reading existing notes

```javascript
const slide = await figma.getNodeByIdAsync('<slideId>');
return { notes: slide.speakerNotes || "", length: slide.speakerNotes?.length || 0 };
```

## Smoke test (required on day one)

A throwaway smoke-test script validates the escape hatch before any skill depends on it. Located at `smoke-test-speaker-notes.js` in the repo root. Run via `figma_execute` on any Slides file.

If the smoke test fails (Plugin API changed, property renamed, etc.), every skill that writes notes is broken. Update this helper first, then all skills will work.

## Failure modes

| Symptom | Cause | Fix |
|---|---|---|
| `slide.speakerNotes` is `undefined` after setting | Node was not a SLIDE type | Check `node.type === 'SLIDE'` before setting |
| Silent no-op | documentAccess not set to `"dynamic-page"` | Add to `figma_execute` options |
| Notes panel blank in presenter | Notes set on wrong nodeId (e.g. component instance, not slide) | Use `figma_list_slides` to get valid slide IDs |
| Newlines collapsed | Escaped `\n` instead of literal newline in template string | Use backtick template literals, not escaped string |

## Out of scope

This helper only handles the `slide.speakerNotes = "..."` escape hatch. For:
- **Generating note content** — see `/notes --generate` in `notes/SKILL.md`
- **Timing markers** — see `/notes --timing`
- **Q&A prep** — see `/notes --qa-prep`
- **Rehearsal pacing** — see `rehearse/SKILL.md`

This helper is the write layer. Content generation happens upstream.
