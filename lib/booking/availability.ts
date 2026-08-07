// The availability engine — pure functions, no database access, so the same
// rules run in server actions, route handlers, unit tests and (for calendar
// rendering) client components.
//
// The model: a reservation is one date + one sitting (lunch or dinner) + a
// party size. A space seats `capacityCovers` guests per sitting, so many
// bookings share a date until those covers run out. A sitting is unavailable
// when:
//
//   1. The restaurant is closed that weekday (Thursday–Sunday only), or a
//      blackout covers the date. A blackout closes its own space, or every
//      space when its spaceId is null; full-venue spaces are closed by any
//      blackout — you can't promise the whole restaurant while a room is shut.
//   2. Approved covers for (space, date, sitting) plus the requested party
//      would exceed the space's capacity.
//   3. Full-venue private hire is involved: an approved booking that closes
//      the venue takes that date+sitting away from every space, and a
//      full-venue request needs the sitting completely empty.
//
// Pending requests never consume covers; only approval claims them.
import { addDays, addMonths, isValidISODate, parseISO, type ISODate } from "./dates";

export const SERVICES = ["lunch", "dinner"] as const;
export type Service = (typeof SERVICES)[number];

export const SERVICE_LABELS: Record<Service, string> = {
  lunch: "Lunch · 12:00–15:00",
  dinner: "Dinner · 19:00–22:00",
};

/** Thursday(4) through Sunday(0), matching `getUTCDay()` on a parsed date. */
export const OPEN_WEEKDAYS = new Set([0, 4, 5, 6]);

export function isService(value: unknown): value is Service {
  return (SERVICES as readonly unknown[]).includes(value);
}

/** Is the restaurant open on this calendar date at all? */
export function isOpenDay(date: ISODate): boolean {
  return OPEN_WEEKDAYS.has(parseISO(date).getUTCDay());
}

export type SpaceRules = {
  id: string;
  isEvent: boolean;
  /** True for full-venue private hire: bookings here close the restaurant. */
  blocksEstate: boolean;
  /** Largest party a single online booking may request. */
  maxGuests: number;
  /** Total covers this space seats per sitting. */
  capacityCovers: number;
  minLeadDays: number;
  maxHorizonMonths: number;
};

export type BookingBlock = {
  spaceId: string;
  startDate: ISODate;
  /** Exclusive — always startDate + 1 for reservations. */
  endDate: ISODate;
  blocksEstate: boolean;
  /** Null (legacy or whole-day private hire) counts against every sitting. */
  service: Service | null;
  partySize: number;
};

export type BlackoutBlock = {
  /** null = closes every space. */
  spaceId: string | null;
  startDate: ISODate;
  endDate: ISODate;
};

export type DateRange = { startDate: ISODate; endDate: ISODate };

export type BookingRequest = {
  date: ISODate;
  service: Service | null;
  partySize: number;
};

/** Closure ranges that apply to `space` — bookings are handled per sitting. */
export function blockedRanges(
  space: Pick<SpaceRules, "id" | "blocksEstate">,
  blackouts: BlackoutBlock[]
): DateRange[] {
  return blackouts
    .filter(
      (blackout) =>
        blackout.spaceId === null ||
        blackout.spaceId === space.id ||
        space.blocksEstate
    )
    .map((blackout) => ({
      startDate: blackout.startDate,
      endDate: blackout.endDate,
    }));
}

export function isDateBlocked(date: ISODate, ranges: DateRange[]): boolean {
  return ranges.some((r) => date >= r.startDate && date < r.endDate);
}

function coversDate(block: BookingBlock, date: ISODate): boolean {
  return date >= block.startDate && date < block.endDate;
}

function coversService(block: BookingBlock, service: Service): boolean {
  return block.service === null || block.service === service;
}

/** Approved covers already committed for this space, date and sitting. */
export function bookedCovers(
  space: Pick<SpaceRules, "id">,
  blocks: BookingBlock[],
  date: ISODate,
  service: Service
): number {
  return blocks
    .filter(
      (b) => b.spaceId === space.id && coversDate(b, date) && coversService(b, service)
    )
    .reduce((sum, b) => sum + b.partySize, 0);
}

/**
 * Covers booked anywhere else that make this sitting unavailable: a venue-
 * closing booking blocks every space, and a full-venue space needs the whole
 * sitting empty.
 */
function conflictingCoversElsewhere(
  space: Pick<SpaceRules, "id" | "blocksEstate">,
  blocks: BookingBlock[],
  date: ISODate,
  service: Service
): number {
  return blocks
    .filter(
      (b) =>
        b.spaceId !== space.id &&
        coversDate(b, date) &&
        coversService(b, service) &&
        (b.blocksEstate || space.blocksEstate)
    )
    .reduce((sum, b) => sum + b.partySize, 0);
}

/** Can this sitting still take `partySize` more covers? */
export function serviceHasRoom(
  space: SpaceRules,
  blocks: BookingBlock[],
  date: ISODate,
  service: Service,
  partySize = 1
): boolean {
  if (conflictingCoversElsewhere(space, blocks, date, service) > 0) return false;
  return bookedCovers(space, blocks, date, service) + partySize <= space.capacityCovers;
}

/** True when the day can still take a booking in at least one sitting. */
export function dayHasRoom(
  space: SpaceRules,
  blocks: BookingBlock[],
  date: ISODate,
  partySize = 1
): boolean {
  return SERVICES.some((service) =>
    serviceHasRoom(space, blocks, date, service, partySize)
  );
}

/**
 * Everything a calendar needs to know about one day: closed weekdays and
 * closure dates first, then per-sitting capacity.
 */
export function isDayAvailable(
  space: SpaceRules,
  blocks: BookingBlock[],
  closures: DateRange[],
  date: ISODate,
  partySize = 1
): boolean {
  if (!isOpenDay(date)) return false;
  if (isDateBlocked(date, closures)) return false;
  return dayHasRoom(space, blocks, date, partySize);
}

/**
 * The window of bookable days given lead time and horizon. `firstStart` is the
 * earliest bookable day; `lastEnd` the exclusive far edge of the window.
 */
export function bookingWindow(
  space: Pick<SpaceRules, "minLeadDays" | "maxHorizonMonths">,
  today: ISODate
): { firstStart: ISODate; lastEnd: ISODate } {
  return {
    firstStart: addDays(today, space.minLeadDays),
    lastEnd: addMonths(today, space.maxHorizonMonths),
  };
}

export type ValidationResult = { ok: true } | { ok: false; error: string };

/**
 * Full server-side validation of a reservation request. The client enforces
 * the same rules for UX, but this is the authority — it runs again inside the
 * server action with fresh data before anything is written.
 */
export function validateRequest(
  space: SpaceRules,
  request: BookingRequest,
  today: ISODate,
  blocks: BookingBlock[],
  blackouts: BlackoutBlock[]
): ValidationResult {
  const { date, service, partySize } = request;

  if (!isValidISODate(date)) {
    return { ok: false, error: "Please pick a valid date." };
  }
  if (!isService(service)) {
    return { ok: false, error: "Please choose lunch or dinner." };
  }
  if (!isOpenDay(date)) {
    return {
      ok: false,
      error: "We're open Thursday to Sunday — please pick another day.",
    };
  }

  const window = bookingWindow(space, today);
  if (date < window.firstStart || date >= window.lastEnd) {
    return {
      ok: false,
      error: `Reservations are open up to ${space.maxHorizonMonths} months ahead for now.`,
    };
  }

  if (!Number.isInteger(partySize) || partySize < 1) {
    return { ok: false, error: "Please tell us how many people are coming." };
  }
  if (partySize > space.maxGuests) {
    return {
      ok: false,
      error: `For groups larger than ${space.maxGuests}, call us or send an enquiry — we'll sort something out.`,
    };
  }

  if (isDateBlocked(date, blockedRanges(space, blackouts))) {
    return {
      ok: false,
      error: "We're closed that day — please pick another date.",
    };
  }

  if (!serviceHasRoom(space, blocks, date, service, partySize)) {
    return {
      ok: false,
      error: "That sitting is fully booked — try the other sitting or another day.",
    };
  }

  return { ok: true };
}

/** The exclusive end date stored for a single-day reservation. */
export function reservationEndDate(date: ISODate): ISODate {
  return addDays(date, 1);
}
