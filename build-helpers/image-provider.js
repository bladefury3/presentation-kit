// image-provider.js — Adapter layer for external image generation providers.
// /image shells out via Bash to the configured provider; this module abstracts the call shape.
//
// Config lives in design-system/image-provider.json.
// Phase 0: stubs + stub config shape. Phase 1: real provider calls.

/**
 * Provider config shape (design-system/image-provider.json):
 * {
 *   "default": "openai",
 *   "providers": {
 *     "openai": {
 *       "model": "gpt-image-1",
 *       "envVar": "OPENAI_API_KEY",
 *       "endpoint": "https://api.openai.com/v1/images/generations",
 *       "sizeOptions": ["1024x1024", "1024x1536", "1536x1024"],
 *       "qualityDefault": "high"
 *     },
 *     "gemini": {
 *       "model": "imagen-3.0-generate-001",
 *       "envVar": "GEMINI_API_KEY",
 *       "endpoint": "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0:generateContent",
 *       "sizeOptions": ["1024x1024", "1024x1792", "1792x1024"]
 *     },
 *     "replicate": {
 *       "model": "stability-ai/sdxl",
 *       "envVar": "REPLICATE_API_TOKEN",
 *       "endpoint": "https://api.replicate.com/v1/predictions"
 *     }
 *   },
 *   "brandStyleSuffix": "in warm editorial-serif brand style, muted neutrals, no text"
 * }
 */

/**
 * resolveProvider — read config, return active provider.
 */
function resolveProvider(config, overrideName = null) {
  const name = overrideName || config.default;
  const provider = config.providers?.[name];
  if (!provider) throw new Error(`Provider '${name}' not configured in image-provider.json`);
  return { name, ...provider };
}

/**
 * buildPrompt — compose per-slide image prompt with brand style suffix.
 * @param {string} basePrompt - per-slide concept (e.g. "a lone lighthouse on a cliff at dusk")
 * @param {object} config - image-provider.json
 * @param {object} slide - slide.json for context
 */
function buildPrompt(basePrompt, config, slide) {
  const brand = config.brandStyleSuffix || "";
  const role = slide?.template === "image-full-bleed" ? "ambient scene, wide composition" : "subject framed center";
  return [basePrompt, role, brand].filter(Boolean).join(". ");
}

/**
 * decomposeLayeredPrompt — split a single prompt into bg / mid / fg variants.
 * Each variant isolates one compositional layer so the output is editable.
 *
 * @param {string} basePrompt
 * @returns {{ bg: string, mid: string, fg: string }}
 */
function decomposeLayeredPrompt(basePrompt) {
  return {
    bg: `${basePrompt}, background elements only (atmosphere, sky, ambient texture), no subject, no foreground elements`,
    mid: `${basePrompt}, mid-ground subject only (primary figure or object), transparent background, clean silhouette`,
    fg: `${basePrompt}, foreground overlay elements only (vignette, grain, subtle lighting), transparent background, minimal`,
  };
}

/**
 * emitShellCommand — produce the Bash command string for the chosen provider.
 * /image skill shells out via Bash tool; this returns the shell snippet.
 */
function emitShellCommand(provider, prompt, outputPath, opts = {}) {
  const { size = "1024x1024", quality = "high" } = opts;

  if (provider.name === "openai") {
    return `curl -sS ${provider.endpoint} \\
  -H "Authorization: Bearer $${provider.envVar}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify({ model: provider.model, prompt, size, quality, n: 1 })}' \\
  | jq -r '.data[0].b64_json' | base64 -d > "${outputPath}"`;
  }

  if (provider.name === "gemini") {
    // Gemini / Imagen — placeholder shape; adapt to the real endpoint contract at Phase 1
    return `# Gemini image gen — Phase 1 implementation`;
  }

  if (provider.name === "replicate") {
    return `# Replicate — Phase 1 implementation (predictions endpoint + polling)`;
  }

  throw new Error(`Unknown provider: ${provider.name}`);
}

module.exports = {
  resolveProvider,
  buildPrompt,
  decomposeLayeredPrompt,
  emitShellCommand,
};
