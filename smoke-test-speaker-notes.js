// smoke-test-speaker-notes.js
// ---------------------------
// Validates architecture decision D6: slide.speakerNotes is writable via
// figma_execute + Plugin API. Run via `figma_execute` in the figma-console MCP
// on any Figma Slides file. If this passes, every skill that sets speaker notes
// works. If it fails, /notes is broken — fix this helper first.
//
// Usage (via Claude Code):
//   1. Open a Figma Slides file with the Desktop Bridge running.
//   2. Run this script via `mcp__figma-console__figma_execute`
//      (copy the body into the `code` parameter).
//   3. Check the returned JSON — expect { ok: true } across all phases.
//
// What it does:
//   Phase 1: creates a throwaway slide
//   Phase 2: writes 3 different notes strings (short, multiline, unicode)
//   Phase 3: reads each back and verifies the value persisted
//   Phase 4: cleans up the throwaway slide
//
// Leave-no-trace: The throwaway slide is always deleted even on failure.

const results = {
  phase1_createSlide: null,
  phase2_writeNotes: [],
  phase3_readNotes: [],
  phase4_cleanup: null,
  ok: false,
  errors: [],
};

let throwawaySlide = null;

try {
  // ─── Phase 1: create throwaway slide ───
  throwawaySlide = figma.createSlide();
  figma.root.appendChild(throwawaySlide);
  throwawaySlide.name = "SMOKE-TEST-speaker-notes";

  if (throwawaySlide.type !== "SLIDE") {
    throw new Error(`Expected type SLIDE, got ${throwawaySlide.type}`);
  }
  results.phase1_createSlide = { ok: true, slideId: throwawaySlide.id, type: throwawaySlide.type };

  // ─── Phase 2: write 3 different notes strings ───
  const testCases = [
    { label: "short", text: "Hello." },
    {
      label: "multiline",
      text: "[~45s] Open with the enemy.\n\nPause here.\n\nTransition: 'So what if we kill the trial?'",
    },
    {
      label: "unicode",
      text: "Churn fell 40%. 📉 日本語テスト. Emoji → 👍 → OK.",
    },
  ];

  for (const tc of testCases) {
    try {
      throwawaySlide.speakerNotes = tc.text;
      results.phase2_writeNotes.push({ label: tc.label, ok: true, wroteLength: tc.text.length });
    } catch (e) {
      results.phase2_writeNotes.push({ label: tc.label, ok: false, error: String(e) });
      results.errors.push(`phase2:${tc.label}: ${e}`);
    }

    // ─── Phase 3: read back and verify ───
    try {
      const readBack = throwawaySlide.speakerNotes;
      const match = readBack === tc.text;
      results.phase3_readNotes.push({
        label: tc.label,
        ok: match,
        wroteLength: tc.text.length,
        readLength: readBack?.length ?? 0,
        match,
      });
      if (!match) {
        results.errors.push(
          `phase3:${tc.label}: readback mismatch — wrote ${tc.text.length} chars, read ${readBack?.length ?? 0}`
        );
      }
    } catch (e) {
      results.phase3_readNotes.push({ label: tc.label, ok: false, error: String(e) });
      results.errors.push(`phase3:${tc.label}: ${e}`);
    }
  }
} catch (fatal) {
  results.errors.push(`fatal: ${fatal}`);
}

// ─── Phase 4: cleanup (always) ───
try {
  if (throwawaySlide) {
    throwawaySlide.remove();
    results.phase4_cleanup = { ok: true };
  } else {
    results.phase4_cleanup = { ok: true, note: "no slide to remove" };
  }
} catch (e) {
  results.phase4_cleanup = { ok: false, error: String(e) };
  results.errors.push(`phase4_cleanup: ${e}`);
}

// ─── Summary ───
const allPhasesOK =
  results.phase1_createSlide?.ok &&
  results.phase2_writeNotes.every((r) => r.ok) &&
  results.phase3_readNotes.every((r) => r.ok) &&
  results.phase4_cleanup?.ok;

results.ok = allPhasesOK && results.errors.length === 0;

return results;
