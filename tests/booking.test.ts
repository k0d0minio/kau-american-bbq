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
} from "../lib/booking/availability";

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

  const privateHire = {
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

  it("prices private hire per event day", () => {
    const quote = computeQuote(privateHire, "2026-09-04", "2026-09-06");
    assert.equal(quote.days, 2);
    assert.equal(quote.totalCents, 2 * 250000);
    assert.equal(quote.lines.length, 1);
    assert.match(quote.lines[0].label, /2 days × €2,500/);
  });

  it("treats a zero rate as price-on-request, not a free event", () => {
    const quote = computeQuote({ ...privateHire, nightlyRateCents: 0 }, "2026-09-04", "2026-09-05");
    assert.equal(quote.totalCents, 0);
    assert.deepEqual(quote.lines, []);
  });
});

// 2026-06-05 is a Friday; 2026-06-09 a Tuesday.
const tableService: SpaceRules = {
  id: "table-service-id",
  isEvent: false,
  blocksEstate: false,
  maxGuests: 8,
  capacityCovers: 60,
  minLeadDays: 0,
  maxHorizonMonths: 3,
};

const privateHire: SpaceRules = {
  id: "private-hire-id",
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
      lunchBooking("table-service-id", 4),
      lunchBooking("table-service-id", 4),
      lunchBooking("table-service-id", 6, { service: "dinner" }),
    ];
    assert.equal(serviceHasRoom(tableService, blocks, "2026-06-05", "lunch", 52), true);
    assert.equal(serviceHasRoom(tableService, blocks, "2026-06-05", "lunch", 53), false);
    // The dinner sitting keeps its own capacity.
    assert.equal(serviceHasRoom(tableService, blocks, "2026-06-05", "dinner", 54), true);
  });

  it("ignores covers booked in other spaces", () => {
    const blocks = [lunchBooking("texan-counter-id", 20)];
    assert.equal(serviceHasRoom(tableService, blocks, "2026-06-05", "lunch", 60), true);
  });

  it("lets a full-venue booking close that sitting everywhere", () => {
    const blocks = [
      lunchBooking("private-hire-id", 80, { blocksEstate: true }),
    ];
    assert.equal(serviceHasRoom(tableService, blocks, "2026-06-05", "lunch", 2), false);
    assert.equal(serviceHasRoom(tableService, blocks, "2026-06-05", "dinner", 2), true);
    assert.equal(dayHasRoom(tableService, blocks, "2026-06-05", 2), true);
  });

  it("needs the sitting completely empty for full-venue hire", () => {
    const blocks = [lunchBooking("table-service-id", 2)];
    assert.equal(serviceHasRoom(privateHire, blocks, "2026-06-05", "lunch", 80), false);
    assert.equal(serviceHasRoom(privateHire, blocks, "2026-06-05", "dinner", 80), true);
  });

  it("applies closures to their space, restaurant-wide when spaceId is null", () => {
    const own: BlackoutBlock = {
      spaceId: "table-service-id",
      startDate: "2026-08-01",
      endDate: "2026-08-05",
    };
    const wholeRestaurant: BlackoutBlock = {
      spaceId: null,
      startDate: "2026-11-01",
      endDate: "2026-11-08",
    };
    const other: BlackoutBlock = {
      spaceId: "texan-counter-id",
      startDate: "2026-09-01",
      endDate: "2026-09-03",
    };
    const ranges = blockedRanges(tableService, [own, wholeRestaurant, other]);
    assert.equal(ranges.length, 2);
    assert.equal(isDateBlocked("2026-08-04", ranges), true);
    assert.equal(isDateBlocked("2026-08-05", ranges), false);
    // ...but a full-venue space is closed by any single space's closure.
    assert.equal(blockedRanges(privateHire, [other]).length, 1);
  });

  it("computes the bookable window from lead time and horizon", () => {
    const window = bookingWindow(tableService, "2026-06-01");
    assert.equal(window.firstStart, "2026-06-01");
    assert.equal(window.lastEnd, "2026-09-01");
  });
});

describe("validateRequest", () => {
  const today = "2026-06-01";
  const request = { date: "2026-06-05", service: "lunch" as const, partySize: 4 };

  it("accepts a clean request", () => {
    assert.deepEqual(validateRequest(tableService, request, today, [], []), { ok: true });
  });

  it("rejects an invalid date and a missing sitting", () => {
    const badDate = validateRequest(
      tableService,
      { ...request, date: "2026-02-31" },
      today,
      [],
      []
    );
    assert.equal(badDate.ok, false);
    assert.match((badDate as { error: string }).error, /valid date/);

    const noService = validateRequest(tableService, { ...request, service: null }, today, [], []);
    assert.equal(noService.ok, false);
    assert.match((noService as { error: string }).error, /lunch or dinner/);
  });

  it("rejects closed weekdays", () => {
    // 2026-06-09 is a Tuesday.
    const result = validateRequest(tableService, { ...request, date: "2026-06-09" }, today, [], []);
    assert.equal(result.ok, false);
    assert.match((result as { error: string }).error, /Thursday to Sunday/);
  });

  it("rejects past dates and anything beyond the horizon", () => {
    const past = validateRequest(tableService, { ...request, date: "2026-05-29" }, today, [], []);
    assert.equal(past.ok, false);
    const far = validateRequest(tableService, { ...request, date: "2026-10-02" }, today, [], []);
    assert.equal(far.ok, false);
    assert.match((far as { error: string }).error, /3 months ahead/);
  });

  it("caps the party size a single online booking may request", () => {
    const result = validateRequest(tableService, { ...request, partySize: 9 }, today, [], []);
    assert.equal(result.ok, false);
    assert.match((result as { error: string }).error, /larger than 8/);

    const none = validateRequest(tableService, { ...request, partySize: 0 }, today, [], []);
    assert.equal(none.ok, false);
    assert.match((none as { error: string }).error, /how many people/);
  });

  it("rejects closure days", () => {
    const closed: BlackoutBlock[] = [
      { spaceId: null, startDate: "2026-06-05", endDate: "2026-06-07" },
    ];
    const result = validateRequest(tableService, request, today, [], closed);
    assert.equal(result.ok, false);
    assert.match((result as { error: string }).error, /closed that day/);
  });

  it("rejects a party that would push the sitting past capacity", () => {
    const blocks = [
      lunchBooking("table-service-id", 4),
      lunchBooking("table-service-id", 4),
    ];
    const tight: SpaceRules = { ...tableService, capacityCovers: 12 };
    const overflow = validateRequest(tight, { ...request, partySize: 5 }, today, blocks, []);
    assert.equal(overflow.ok, false);
    assert.match((overflow as { error: string }).error, /fully booked/);

    const roomier: SpaceRules = { ...tableService, capacityCovers: 13 };
    assert.deepEqual(
      validateRequest(roomier, { ...request, partySize: 5 }, today, blocks, []),
      { ok: true }
    );
  });

  it("keeps full-venue exclusivity in both directions", () => {
    const buyout = lunchBooking("private-hire-id", 80, { blocksEstate: true });
    const dinnerTable = lunchBooking("table-service-id", 2, { service: "dinner" });

    // A buyout blocks an ordinary reservation for that sitting...
    const blocked = validateRequest(tableService, request, today, [buyout], []);
    assert.equal(blocked.ok, false);
    assert.match((blocked as { error: string }).error, /fully booked/);

    // ...and any booking blocks a buyout for that sitting.
    const hireRequest = { date: "2026-07-03", service: "dinner" as const, partySize: 80 };
    const taken = validateRequest(
      privateHire,
      hireRequest,
      today,
      [{ ...dinnerTable, startDate: "2026-07-03", endDate: "2026-07-04" }],
      []
    );
    assert.equal(taken.ok, false);
    assert.deepEqual(validateRequest(privateHire, hireRequest, today, [], []), { ok: true });
  });
});
