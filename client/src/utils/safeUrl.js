const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

// Returns a normalized http(s) URL string, or null for anything else. Used before every href and img src.
// The URL parser lowercases the scheme and strips embedded tabs and newlines, so tricks like
// "JaVaScRiPt:" or "java\nscript:" are still recognized and rejected. Relative URLs are rejected too.
export const getSafeUrl = (value) => {
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    return ALLOWED_PROTOCOLS.has(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
};