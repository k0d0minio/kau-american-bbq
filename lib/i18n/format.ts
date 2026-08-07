// Turning translated templates and domain values into finished strings.
import type { ValidationError } from "@/lib/booking/availability";
import type { Dictionary } from "./dictionaries";

/** Substitute `{name}` placeholders in a translated string. */
export function fill(
  template: string,
  vars: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match
  );
}

/**
 * Render a rejection from the availability engine in the visitor's language.
 * The engine deals in codes so it can stay shared between both languages; this
 * is the single place they become prose.
 */
export function validationMessage(
  error: ValidationError,
  t: Dictionary["booking"]["errors"]
): string {
  switch (error.code) {
    case "out_of_window":
    case "party_too_large":
      return fill(t[error.code], { max: error.max });
    default:
      return t[error.code];
  }
}
