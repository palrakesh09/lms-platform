import { ALLOWED_FILE_SIGNATURES } from '../constants/media.js';

const matchesAt = (buffer, offset, bytes) => bytes.every((byte, i) => buffer[offset + i] === byte);

// Detects the REAL file type from its first bytes, ignoring whatever mimetype/extension/filename the
// client claimed. Returns the matching allowlist entry, or null if nothing matches — a null result is a
// hard rejection, never a fallback to the client's claim.
export const detectFileSignature = (buffer) =>
  ALLOWED_FILE_SIGNATURES.find((sig) => {
    if (!matchesAt(buffer, 0, sig.bytes)) return false;
    if (sig.secondCheck && !matchesAt(buffer, sig.secondCheck.offset, sig.secondCheck.bytes)) return false;
    return true;
  }) ?? null;