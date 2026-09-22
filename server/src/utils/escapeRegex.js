// Escapes regex metacharacters so search text is always matched literally (no injection, no ReDoS).
export const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');