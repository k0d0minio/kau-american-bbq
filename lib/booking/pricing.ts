// Quote calculation. Money is integer cents throughout; formatting happens at
// the edge. Reservations are free — only event-priced spaces carry a price,
// charged per day.
import { diffDays, type ISODate } from "./dates";

export type SpacePricing = {
  isEvent: boolean;
  /** Per event day for event spaces; 0 for reservation spaces. */
  nightlyRateCents: number;
  weeklyRateCents: number | null;
  cleaningFeeCents: number;
};

export type QuoteLine = { label: string; amountCents: number };

export type Quote = {
  /** Event days for private hire; 1 for a single reservation. */
  days: number;
  lines: QuoteLine[];
  totalCents: number;
};

export function formatMoney(cents: number): string {
  const euros = cents / 100;
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: Number.isInteger(euros) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(euros);
}

/** "day" / "days" — the only unit left now that stays are gone. */
export function unitLabel(count: number): string {
  return count === 1 ? "day" : "days";
}

export function computeQuote(
  space: SpacePricing,
  startDate: ISODate,
  endDate: ISODate
): Quote {
  const days = Math.max(0, diffDays(startDate, endDate));

  // Reservations cost nothing — the guest never sees a price.
  if (!space.isEvent || days === 0 || space.nightlyRateCents <= 0) {
    return { days, lines: [], totalCents: 0 };
  }

  const lines: QuoteLine[] = [
    {
      label: `${days} ${unitLabel(days)} × ${formatMoney(space.nightlyRateCents)}`,
      amountCents: days * space.nightlyRateCents,
    },
  ];

  return {
    days,
    lines,
    totalCents: lines.reduce((sum, line) => sum + line.amountCents, 0),
  };
}
