/** Shared input validation helpers for route handlers. */

/** C0/C1 control characters other than tab, newline, carriage return. */
export function hasControlChars(s: string): boolean {
  return /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]/.test(s);
}

/** For single-line fields (names, sound names, report reasons). */
export function hasLineBreaks(s: string): boolean {
  return /[\r\n]/.test(s);
}

/** Coerce an unknown JSON field to a trimmed string, or null if it is not a string. */
export function optString(v: unknown): string | null {
  return typeof v === "string" ? v.trim() : null;
}
