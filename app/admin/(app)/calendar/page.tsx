import Link from "next/link";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getActiveSpaces, getCalendarData, listUpcomingBlackouts } from "@/lib/db/queries";
import {
  addDays,
  addMonths,
  diffDays,
  formatDayMonth,
  formatMonth,
  parseISO,
  todayAtRestaurant,
  type ISODate,
} from "@/lib/booking/dates";
import { PageHeader, Card } from "../components/page-shell";
import { BlackoutForm } from "./blackout-form";
import { deleteBlackout } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Calendar" };

// One colour per space, assigned by sort order.
const SPACE_COLORS = [
  "bg-char-600 text-bone",
  "bg-ember text-bone-100",
  "bg-rust text-bone-100",
  "bg-stone text-bone-100",
  "bg-char-900 text-bone",
];

// Monday-first: KAU opens Thursday–Sunday, so the weekend reads as one block.
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type Props = { searchParams: Promise<{ month?: string }> };

export default async function CalendarPage({ searchParams }: Props) {
  const params = await searchParams;
  const today = todayAtRestaurant();
  const monthFirst: ISODate = /^\d{4}-(0[1-9]|1[0-2])$/.test(params.month ?? "")
    ? `${params.month}-01`
    : `${today.slice(0, 7)}-01`;
  const monthEnd = addMonths(monthFirst, 1);

  const [spaces, calendar, upcomingBlackouts] = await Promise.all([
    getActiveSpaces(),
    getCalendarData(monthFirst, monthEnd),
    listUpcomingBlackouts(today),
  ]);

  const colorBySpace = new Map(
    spaces.map((s, i) => [s.id, SPACE_COLORS[i % SPACE_COLORS.length]])
  );
  const shortName = (name: string) => name.replace(/^The /, "");

  const lead = (parseISO(monthFirst).getUTCDay() + 6) % 7;
  const dayCount = diffDays(monthFirst, monthEnd);
  const prevMonth = addMonths(monthFirst, -1).slice(0, 7);
  const nextMonth = addMonths(monthFirst, 1).slice(0, 7);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        description="Confirmed reservations and closure dates across every space. Pending requests don't block capacity and aren't shown here."
      />

      <Card className="overflow-x-auto p-4 sm:p-5">
        <div className="min-w-[680px]">
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-1">
              <Link
                href={`/admin/calendar?month=${prevMonth}`}
                aria-label="Previous month"
                className="flex size-8 items-center justify-center rounded-full text-char-700 hover:bg-char-50"
              >
                <ChevronLeft className="size-4" />
              </Link>
              <Link
                href={`/admin/calendar?month=${nextMonth}`}
                aria-label="Next month"
                className="flex size-8 items-center justify-center rounded-full text-char-700 hover:bg-char-50"
              >
                <ChevronRight className="size-4" />
              </Link>
              <Link
                href="/admin/calendar"
                className="ml-2 rounded-full px-3 py-1 text-xs font-medium text-char-700 hover:bg-char-50"
              >
                Today
              </Link>
            </div>
            <h2 className="font-display text-xl text-ink">{formatMonth(monthFirst)}</h2>
            <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1">
              {spaces.map((s) => (
                <span key={s.id} className="flex items-center gap-1.5 text-xs text-ink-soft">
                  <span
                    className={cn("size-2.5 rounded-full", colorBySpace.get(s.id)?.split(" ")[0])}
                  />
                  {shortName(s.name)}
                </span>
              ))}
              <span className="flex items-center gap-1.5 text-xs text-ink-soft">
                <span className="size-2.5 rounded-full border border-stone/50 bg-parchment" />
                Closed
              </span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl bg-char-100">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="bg-bone px-2 py-1.5 text-center text-[0.65rem] font-medium uppercase tracking-wider text-stone"
              >
                {d}
              </div>
            ))}
            {Array.from({ length: lead }).map((_, i) => (
              <div key={`lead-${i}`} className="min-h-24 bg-bone/60" />
            ))}
            {Array.from({ length: dayCount }).map((_, i) => {
              const day = addDays(monthFirst, i);
              const isToday = day === today;
              const dayBookings = calendar.bookings.filter(
                ({ booking }) => booking.startDate <= day && day < booking.endDate
              );
              const dayBlackouts = calendar.blackouts.filter(
                ({ blackout }) => blackout.startDate <= day && day < blackout.endDate
              );
              return (
                <div key={day} className="min-h-24 space-y-1 bg-bone-100 p-1.5">
                  <p
                    className={cn(
                      "text-right text-xs",
                      isToday
                        ? "ml-auto flex size-5 items-center justify-center rounded-full bg-char-700 font-semibold text-bone"
                        : "text-stone"
                    )}
                  >
                    {i + 1}
                  </p>
                  {dayBookings.map(({ booking, space, guest }) => {
                    const isStart = booking.startDate === day || day === monthFirst;
                    return (
                      <Link
                        key={booking.id}
                        href={`/admin/bookings/${booking.id}`}
                        title={`${booking.reference} · ${guest.firstName} ${guest.lastName} · ${space.name}`}
                        className={cn(
                          "block truncate rounded px-1.5 text-[0.68rem] leading-5",
                          colorBySpace.get(space.id),
                          !isStart && "h-1.5 rounded-full p-0 opacity-70"
                        )}
                      >
                        {isStart ? `${shortName(space.name)} · ${guest.lastName}` : null}
                      </Link>
                    );
                  })}
                  {dayBlackouts.map(({ blackout, spaceName }) => {
                    const isStart = blackout.startDate === day || day === monthFirst;
                    return (
                      <div
                        key={blackout.id}
                        title={`${spaceName ?? "Whole restaurant"}${blackout.reason ? ` — ${blackout.reason}` : ""}`}
                        className={cn(
                          "truncate rounded border border-stone/30 bg-parchment px-1.5 text-[0.68rem] leading-5 text-stone",
                          !isStart && "h-1.5 rounded-full border-dashed p-0"
                        )}
                      >
                        {isStart
                          ? `✕ ${spaceName ? shortName(spaceName) : "All"}${blackout.reason ? ` · ${blackout.reason}` : ""}`
                          : null}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-lg text-ink">Closure dates</h2>
          <p className="mb-4 mt-1 text-sm text-ink-soft">
            Close the restaurant (or one space) for holidays, private events or maintenance —
            guests can&apos;t book closed dates.
          </p>
          <BlackoutForm spaceOptions={spaces.map((s) => ({ id: s.id, name: s.name }))} />
        </Card>

        <Card>
          <h2 className="font-display text-lg text-ink">Upcoming closures</h2>
          {upcomingBlackouts.length === 0 ? (
            <p className="mt-3 text-sm text-stone">Nothing closed ahead.</p>
          ) : (
            <ul className="mt-3 divide-y divide-char-100">
              {upcomingBlackouts.map(({ blackout, spaceName }) => (
                <li key={blackout.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {spaceName ?? "Whole restaurant"}
                      {blackout.reason ? (
                        <span className="font-normal text-stone"> · {blackout.reason}</span>
                      ) : null}
                    </p>
                    <p className="text-xs text-stone">
                      {formatDayMonth(blackout.startDate)} →{" "}
                      {formatDayMonth(addDays(blackout.endDate, -1))} (reopens{" "}
                      {formatDayMonth(blackout.endDate)})
                    </p>
                  </div>
                  <form action={deleteBlackout}>
                    <input type="hidden" name="blackoutId" value={blackout.id} />
                    <button
                      type="submit"
                      aria-label="Delete closure"
                      className="flex size-8 items-center justify-center rounded-full text-stone transition-colors hover:bg-ember/10 hover:text-[#7c2d12]"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
