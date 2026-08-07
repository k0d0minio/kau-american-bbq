// Unit tests for the booking domain logic (dates, pricing, availability).
// Run with: npm test
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  addDays,
  addMonths,
  diffDays,
  isValidISODate,
  rangesOverlap,
} from "../lib/booking/dates";
import { computeQuote, formatMoney } from "../lib/booking/pricing";
import {
  blockedRanges,
  bookingWindow,
  dayHasRoom,
  isDateBlocked,
  isOpenDay,
  serviceHasRoom,
  validateRequest,
  type BlackoutBlock,
  type BookingBlock,
  type SpaceRules,
  type ValidationError,
  type ValidationResult,
} from "../lib/booking/availability";
import { DINING_FORMATS, isDiningFormat } from "../lib/booking/dining-formats";
import { locales } from "../lib/i18n/config";
import { getDictionary } from "../lib/i18n/dictionaries";
import { validationMessage } from "../lib/i18n/format";

describe("dates", () => {
  it("validates ISO dates including impossible calendar days", () => {
    assert.equal(isValidISODate("2026-06-05"), true);
    assert.equal(isValidISODate("2026-02-31"), false);
    assert.equal(isValidISODate("2026-6-5"), false);
    assert.equal(isValidISODate("nonsense"), false);
  });

  it("adds days across month and year boundaries", () => {
    assert.equal(addDays("2026-12-30", 3), "2027-01-02");
    assert.equal(addDays("2026-03-01", -1), "2026-02-28");
  });

  it("adds months with end-of-month clamping", () => {
    assert.equal(addMonths("2026-01-31", 1), "2026-02-28");
    assert.equal(addMonths("2026-07-15", 18), "2028-01-15");
  });

  it("counts whole days as half-open ranges", () => {
    assert.equal(diffDays("2026-06-05", "2026-06-08"), 3);
    assert.equal(diffDays("2026-06-05", "2026-06-06"), 1);
  });

  it("treats back-to-back half-open ranges as non-overlapping", () => {
    assert.equal(rangesOverlap("2026-06-05", "2026-06-06", "2026-06-06", "2026-06-07"), false);
    assert.equal(rangesOverlap("2026-06-05", "2026-06-08", "2026-06-07", "2026-06-10"), true);
  });
});

describe("pricing", () => {
  const dining = {
    isEvent: false,
    nightlyRateCents: 0,
    weeklyRateCents: null,
    cleaningFeeCents: 0,
  };

  const eventSpace = {
    isEvent: true,
    nightlyRateCents: 250000,
    weeklyRateCents: null,
    cleaningFeeCents: 0,
  };

  it("formats money in euros, dropping cents when whole", () => {
    assert.equal(formatMoney(4500), "€45");
    assert.equal(formatMoney(123456), "€1,234.56");
  });

  it("quotes reservations at nothing at all", () => {
    const quote = computeQuote(dining, "2026-06-05", "2026-06-06");
    assert.equal(quote.totalCents, 0);
    assert.deepEqual(quote.lines, []);
  });

  it("prices an event space per day", () => {
    const quote = computeQuote(eventSpace, "2026-09-04", "2026-09-06");
    assert.equal(quote.days, 2);
    assert.equal(quote.totalCents, 2 * 250000);
    assert.equal(quote.lines.length, 1);
    assert.match(quote.lines[0].label, /2 days × €2,500/);
  });

  it("treats a zero rate as price-on-request, not a free event", () => {
    const quote = computeQuote({ ...eventSpace, nightlyRateCents: 0 }, "2026-09-04", "2026-09-05");
    assert.equal(quote.totalCents, 0);
    assert.deepEqual(quote.lines, []);
  });
});

// KAU books one room, but the engine stays multi-space: these fixtures cover
// the cross-space rules the schema still supports.
// 2026-06-05 is a Friday; 2026-06-09 a Tuesday.
const diningRoom: SpaceRules = {
  id: "dining-room-id",
  isEvent: false,
  blocksEstate: false,
  maxGuests: 8,
  capacityCovers: 60,
  minLeadDays: 0,
  maxHorizonMonths: 3,
};

const wholeVenue: SpaceRules = {
  id: "whole-venue-id",
  isEvent: true,
  blocksEstate: true,
  maxGuests: 120,
  capacityCovers: 120,
  minLeadDays: 14,
  maxHorizonMonths: 6,
};

function lunchBooking(
  spaceId: string,
  partySize: number,
  overrides: Partial<BookingBlock> = {}
): BookingBlock {
  return {
    spaceId,
    startDate: "2026-06-05",
    endDate: "2026-06-06",
    blocksEstate: false,
    service: "lunch",
    partySize,
    ...overrides,
  };
}

describe("dining formats", () => {
  it("accepts only the two ways of being served", () => {
    assert.deepEqual([...DINING_FORMATS], ["table", "counter"]);
    assert.equal(isDiningFormat("table"), true);
    assert.equal(isDiningFormat("counter"), true);
    assert.equal(isDiningFormat("takeaway"), false);
    assert.equal(isDiningFormat(null), false);
  });

  it("labels both formats in every language", () => {
    for (const locale of locales) {
      const labels = getDictionary(locale).booking.formats;
      for (const format of DINING_FORMATS) {
        assert.ok(labels[format].label.length > 0);
        assert.ok(labels[format].note.length > 0);
      }
    }
  });
});

describe("opening days", () => {
  it("opens Thursday through Sunday only", () => {
    assert.equal(isOpenDay("2026-06-04"), true); // Thursday
    assert.equal(isOpenDay("2026-06-05"), true); // Friday
    assert.equal(isOpenDay("2026-06-07"), true); // Sunday
    assert.equal(isOpenDay("2026-06-08"), false); // Monday
    assert.equal(isOpenDay("2026-06-09"), false); // Tuesday
    assert.equal(isOpenDay("2026-06-10"), false); // Wednesday
  });
});

describe("availability", () => {
  it("sums approved covers per sitting", () => {
    const blocks = [
      lunchBooking("dining-room-id", 4),
      lunchBooking("dining-room-id", 4),
      lunchBooking("dining-room-id", 6, { service: "dinner" }),
    ];
    assert.equal(serviceHasRoom(diningRoom, blocks, "2026-06-05", "lunch", 52), true);
    assert.equal(serviceHasRoom(diningRoom, blocks, "2026-06-05", "lunch", 53), false);
    // The dinner sitting keeps its own capacity.
    assert.equal(serviceHasRoom(diningRoom, blocks, "2026-06-05", "dinner", 54), true);
  });

  it("ignores covers booked in other spaces", () => {
    const blocks = [lunchBooking("other-room-id", 20)];
    assert.equal(serviceHasRoom(diningRoom, blocks, "2026-06-05", "lunch", 60), true);
  });

  it("lets a full-venue booking close that sitting everywhere", () => {
    const blocks = [
      lunchBooking("whole-venue-id", 80, { blocksEstate: true }),
    ];
    assert.equal(serviceHasRoom(diningRoom, blocks, "2026-06-05", "lunch", 2), false);
    assert.equal(serviceHasRoom(diningRoom, blocks, "2026-06-05", "dinner", 2), true);
    assert.equal(dayHasRoom(diningRoom, blocks, "2026-06-05", 2), true);
  });

  it("needs the sitting completely empty for full-venue hire", () => {
    const blocks = [lunchBooking("dining-room-id", 2)];
    assert.equal(serviceHasRoom(wholeVenue, blocks, "2026-06-05", "lunch", 80), false);
    assert.equal(serviceHasRoom(wholeVenue, blocks, "2026-06-05", "dinner", 80), true);
  });

  it("applies closures to their space, restaurant-wide when spaceId is null", () => {
    const own: BlackoutBlock = {
      spaceId: "dining-room-id",
      startDate: "2026-08-01",
      endDate: "2026-08-05",
    };
    const wholeRestaurant: BlackoutBlock = {
      spaceId: null,
      startDate: "2026-11-01",
      endDate: "2026-11-08",
    };
    const other: BlackoutBlock = {
      spaceId: "other-room-id",
      startDate: "2026-09-01",
      endDate: "2026-09-03",
    };
    const ranges = blockedRanges(diningRoom, [own, wholeRestaurant, other]);
    assert.equal(ranges.length, 2);
    assert.equal(isDateBlocked("2026-08-04", ranges), true);
    assert.equal(isDateBlocked("2026-08-05", ranges), false);
    // ...but a full-venue space is closed by any single space's closure.
    assert.equal(blockedRanges(wholeVenue, [other]).length, 1);
  });

  it("computes the bookable window from lead time and horizon", () => {
    const window = bookingWindow(diningRoom, "2026-06-01");
    assert.equal(window.firstStart, "2026-06-01");
    assert.equal(window.lastEnd, "2026-09-01");
  });
});

/**
 * `validateRequest` deals in error codes so the wording can live in the
 * dictionary; these read the code, and the English message where a test cares
 * about the number a rule quotes back.
 */
function errorCode(result: ValidationResult): string | undefined {
  return result.ok ? undefined : result.error.code;
}

function message(result: ValidationResult): string {
  assert.equal(result.ok, false);
  return validationMessage(
    (result as { ok: false; error: ValidationError }).error,
    getDictionary("en").booking.errors
  );
}

describe("validateRequest", () => {
  const today = "2026-06-01";
  const request = { date: "2026-06-05", service: "lunch" as const, partySize: 4 };

  it("accepts a clean request", () => {
    assert.deepEqual(validateRequest(diningRoom, request, today, [], []), { ok: true });
  });

  it("rejects an invalid date and a missing sitting", () => {
    const badDate = validateRequest(
      diningRoom,
      { ...request, date: "2026-02-31" },
      today,
      [],
      []
    );
    assert.equal(badDate.ok, false);
    assert.equal(errorCode(badDate), "invalid_date");

    const noService = validateRequest(diningRoom, { ...request, service: null }, today, [], []);
    assert.equal(noService.ok, false);
    assert.equal(errorCode(noService), "no_service");
  });

  it("rejects closed weekdays", () => {
    // 2026-06-09 is a Tuesday.
    const result = validateRequest(diningRoom, { ...request, date: "2026-06-09" }, today, [], []);
    assert.equal(result.ok, false);
    assert.equal(errorCode(result), "closed_weekday");
  });

  it("rejects past dates and anything beyond the horizon", () => {
    const past = validateRequest(diningRoom, { ...request, date: "2026-05-29" }, today, [], []);
    assert.equal(past.ok, false);
    const far = validateRequest(diningRoom, { ...request, date: "2026-10-02" }, today, [], []);
    assert.equal(far.ok, false);
    assert.equal(errorCode(far), "out_of_window");
    // The horizon the guest is told about is the space's own limit.
    assert.match(message(far), /3 months/);
  });

  it("caps the party size a single online booking may request", () => {
    const result = validateRequest(diningRoom, { ...request, partySize: 9 }, today, [], []);
    assert.equal(result.ok, false);
    assert.equal(errorCode(result), "party_too_large");
    assert.match(message(result), /larger than 8/);

    const none = validateRequest(diningRoom, { ...request, partySize: 0 }, today, [], []);
    assert.equal(none.ok, false);
    assert.equal(errorCode(none), "no_party_size");
  });

  it("rejects closure days", () => {
    const closed: BlackoutBlock[] = [
      { spaceId: null, startDate: "2026-06-05", endDate: "2026-06-07" },
    ];
    const result = validateRequest(diningRoom, request, today, [], closed);
    assert.equal(result.ok, false);
    assert.equal(errorCode(result), "closed_day");
  });

  it("rejects a party that would push the sitting past capacity", () => {
    const blocks = [
      lunchBooking("dining-room-id", 4),
      lunchBooking("dining-room-id", 4),
    ];
    const tight: SpaceRules = { ...diningRoom, capacityCovers: 12 };
    const overflow = validateRequest(tight, { ...request, partySize: 5 }, today, blocks, []);
    assert.equal(overflow.ok, false);
    assert.equal(errorCode(overflow), "sitting_full");

    const roomier: SpaceRules = { ...diningRoom, capacityCovers: 13 };
    assert.deepEqual(
      validateRequest(roomier, { ...request, partySize: 5 }, today, blocks, []),
      { ok: true }
    );
  });

  it("keeps full-venue exclusivity in both directions", () => {
    const buyout = lunchBooking("whole-venue-id", 80, { blocksEstate: true });
    const dinnerTable = lunchBooking("dining-room-id", 2, { service: "dinner" });

    // A buyout blocks an ordinary reservation for that sitting...
    const blocked = validateRequest(diningRoom, request, today, [buyout], []);
    assert.equal(blocked.ok, false);
    assert.equal(errorCode(blocked), "sitting_full");

    // ...and any booking blocks a buyout for that sitting.
    const hireRequest = { date: "2026-07-03", service: "dinner" as const, partySize: 80 };
    const taken = validateRequest(
      wholeVenue,
      hireRequest,
      today,
      [{ ...dinnerTable, startDate: "2026-07-03", endDate: "2026-07-04" }],
      []
    );
    assert.equal(taken.ok, false);
    assert.deepEqual(validateRequest(wholeVenue, hireRequest, today, [], []), { ok: true });
  });
});
