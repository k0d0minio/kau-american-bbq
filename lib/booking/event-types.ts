// Occasion options offered on the reservation form. Shared between the client
// form and the server action that validates it.
//
// `value` is what gets stored on the booking and shown in the admin, and is
// deliberately unchanged from before the site went bilingual so existing rows
// keep reading correctly. `id` keys the guest-facing label in
// lib/i18n/dictionaries.ts.
export const EVENT_TYPES = [
  { id: "birthday", value: "Birthday" },
  { id: "celebration", value: "Anniversary or celebration" },
  { id: "business", value: "Business lunch or dinner" },
  { id: "group", value: "Group or team meal" },
  { id: "privateEvent", value: "Full-venue private event" },
  { id: "other", value: "Other" },
] as const;

export type EventTypeId = (typeof EVENT_TYPES)[number]["id"];

/** The stored values, for validating what came back from the form. */
export const EVENT_TYPE_VALUES: readonly string[] = EVENT_TYPES.map((t) => t.value);
