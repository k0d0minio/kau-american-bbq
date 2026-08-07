"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { ChevronLeft, ChevronRight, Loader2, Send, Undo2 } from "lucide-react";
import {
  addDays,
  addMonths,
  diffDays,
  formatDate,
  formatMonth,
  parseISO,
  type ISODate,
} from "@/lib/booking/dates";
import {
  SERVICES,
  SERVICE_LABELS,
  bookingWindow,
  isDateBlocked,
  isDayAvailable,
  serviceHasRoom,
  type BookingBlock,
  type DateRange,
  type Service,
} from "@/lib/booking/availability";
import {
  DINING_FORMATS,
  DINING_FORMAT_LABELS,
  DINING_FORMAT_NOTES,
  type DiningFormat,
} from "@/lib/booking/dining-formats";
import { EVENT_TYPES } from "@/lib/booking/event-types";
import { buttonVariants } from "@/app/components/ui/button";
import { FormError, Input, Label, Select, Textarea } from "@/app/components/ui/field";
import { cn } from "@/lib/utils";
import { requestBooking, type BookingFormState } from "./actions";

export type PanelSpace = {
  id: string;
  slug: string;
  name: string;
  isEvent: boolean;
  blocksEstate: boolean;
  maxGuests: number;
  capacityCovers: number;
  minLeadDays: number;
  maxHorizonMonths: number;
};

function firstOfMonth(date: ISODate): ISODate {
  return `${date.slice(0, 7)}-01`;
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className={cn(buttonVariants({ variant: "amber", size: "lg" }), "w-full")}
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Sending your request…
        </>
      ) : (
        <>
          <Send className="size-4" />
          Request a table
        </>
      )}
    </button>
  );
}

export function BookingPanel({
  space,
  blocks,
  closures,
  today,
}: {
  space: PanelSpace;
  /** Approved bookings across every space — capacity is cross-space aware. */
  blocks: BookingBlock[];
  /** Closure ranges that apply to this space. */
  closures: DateRange[];
  today: ISODate;
}) {
  const window = useMemo(() => bookingWindow(space, today), [space, today]);
  const [month, setMonth] = useState<ISODate>(firstOfMonth(window.firstStart));
  const [date, setDate] = useState<ISODate | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [format, setFormat] = useState<DiningFormat>("table");
  const [partySize, setPartySize] = useState(2);
  const [state, formAction] = useActionState<BookingFormState, FormData>(
    requestBooking,
    {}
  );

  const canPrev = month > firstOfMonth(window.firstStart);
  const canNext = addMonths(month, 1) <= firstOfMonth(addDays(window.lastEnd, -1));

  const isSelectable = (day: ISODate) =>
    day >= window.firstStart &&
    day < window.lastEnd &&
    isDayAvailable(space, blocks, closures, day, 1);

  const pickDay = (day: ISODate) => {
    setDate(day);
    // A sitting that no longer fits the party is dropped rather than silently
    // carried over to the new day.
    if (service && !serviceHasRoom(space, blocks, day, service, partySize)) {
      setService(null);
    }
  };

  const clearDate = () => {
    setDate(null);
    setService(null);
  };

  // --- Month grid (Monday first) -------------------------------------------
  const monthDays = useMemo(() => {
    const count = diffDays(month, addMonths(month, 1));
    const lead = (parseISO(month).getUTCDay() + 6) % 7;
    return { count, lead };
  }, [month]);

  const dayLabels = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  return (
    <div className="rounded-3xl border border-pine-100 bg-cream-100 p-6 shadow-soft sm:p-7">
      <p className="eyebrow text-amber">Reserve a table</p>
      <h2 className="mt-2 font-display text-2xl text-pine-900">Pick your day</h2>
      <p className="mt-2 text-sm leading-relaxed text-stone">
        We&apos;re open Thursday to Sunday for lunch and dinner. Choose a day and a
        sitting — we review every request personally.
      </p>

      {/* Calendar */}
      <div className="mt-5 rounded-2xl border border-pine-100 bg-cream p-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => canPrev && setMonth(addMonths(month, -1))}
            disabled={!canPrev}
            className="flex size-8 items-center justify-center rounded-full text-pine-700 transition-colors hover:bg-pine-50 disabled:opacity-30"
          >
            <ChevronLeft className="size-4" />
          </button>
          <p className="text-sm font-medium text-ink">{formatMonth(month)}</p>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => canNext && setMonth(addMonths(month, 1))}
            disabled={!canNext}
            className="flex size-8 items-center justify-center rounded-full text-pine-700 transition-colors hover:bg-pine-50 disabled:opacity-30"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
        <div className="mt-3 grid grid-cols-7 text-center">
          {dayLabels.map((d) => (
            <span key={d} className="pb-1 text-[0.65rem] font-medium uppercase tracking-wider text-stone">
              {d}
            </span>
          ))}
          {Array.from({ length: monthDays.lead }).map((_, i) => (
            <span key={`lead-${i}`} />
          ))}
          {Array.from({ length: monthDays.count }).map((_, i) => {
            const day = addDays(month, i);
            const selectable = isSelectable(day);
            const selected = day === date;
            const closed = isDateBlocked(day, closures);
            return (
              <button
                key={day}
                type="button"
                disabled={!selectable}
                onClick={() => pickDay(day)}
                aria-label={formatDate(day)}
                aria-pressed={selected}
                className={cn(
                  "mx-auto flex size-9 items-center justify-center rounded-full text-sm transition-colors",
                  selected
                    ? "bg-pine-700 font-medium text-cream"
                    : selectable
                      ? "cursor-pointer text-ink hover:bg-pine-100"
                      : closed
                        ? "text-stone/40 line-through decoration-stone/40"
                        : "text-stone/35"
                )}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-pine-100 pt-3">
          <p className="text-xs text-stone">
            Thursday to Sunday · tables up to {space.maxGuests}
          </p>
          {date ? (
            <button
              type="button"
              onClick={clearDate}
              className="inline-flex items-center gap-1 text-xs font-medium text-pine-700 hover:text-amber"
            >
              <Undo2 className="size-3" />
              Clear
            </button>
          ) : null}
        </div>
      </div>

      {/* Sitting */}
      {date ? (
        <div className="mt-5 rounded-2xl bg-pine-50 p-4">
          <p className="text-sm font-medium text-pine-900">{formatDate(date)}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {SERVICES.map((option) => {
              const room = serviceHasRoom(space, blocks, date, option, partySize);
              return (
                <button
                  key={option}
                  type="button"
                  disabled={!room}
                  aria-pressed={service === option}
                  onClick={() => setService(option)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-sm transition-colors",
                    service === option
                      ? "border-pine-700 bg-pine-700 font-medium text-cream"
                      : room
                        ? "cursor-pointer border-pine-100 bg-cream text-ink hover:border-pine-400"
                        : "border-pine-100 bg-cream/50 text-stone/50 line-through"
                  )}
                >
                  {SERVICE_LABELS[option]}
                </button>
              );
            })}
          </div>
          {!service ? (
            <p className="mt-2 text-xs text-stone">
              Pick lunch or dinner to finish your request.
            </p>
          ) : null}
        </div>
      ) : null}

      {/* How you'd like to be served — same room, same covers, same smoke. */}
      <fieldset className="mt-5">
        <legend className="text-sm font-medium text-pine-900">How would you like to eat?</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {DINING_FORMATS.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={format === option}
              onClick={() => setFormat(option)}
              className={cn(
                "rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
                format === option
                  ? "border-pine-700 bg-pine-700 text-cream"
                  : "cursor-pointer border-pine-100 bg-cream text-ink hover:border-pine-400"
              )}
            >
              <span className="block font-medium">{DINING_FORMAT_LABELS[option]}</span>
              <span
                className={cn(
                  "mt-0.5 block text-xs leading-relaxed",
                  format === option ? "text-cream/80" : "text-stone"
                )}
              >
                {DINING_FORMAT_NOTES[option]}
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      {/* Details form */}
      <form action={formAction} className="mt-6 space-y-4">
        <input type="hidden" name="space" value={space.slug} />
        <input type="hidden" name="date" value={date ?? ""} />
        <input type="hidden" name="service" value={service ?? ""} />
        <input type="hidden" name="diningFormat" value={format} />
        {/* Honeypot — humans never see or fill this. */}
        <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
          <label>
            Website
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" name="firstName" autoComplete="given-name" required maxLength={80} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" name="lastName" autoComplete="family-name" required maxLength={80} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required maxLength={200} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone <span className="font-normal text-stone">(optional)</span></Label>
            <Input id="phone" name="phone" type="tel" autoComplete="tel" maxLength={40} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="partySize">How many people?</Label>
            <Input
              id="partySize"
              name="partySize"
              type="number"
              min={1}
              max={space.maxGuests}
              value={partySize}
              onChange={(e) => setPartySize(Number(e.target.value))}
              required
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="eventType">
            Occasion <span className="font-normal text-stone">(optional)</span>
          </Label>
          <Select id="eventType" name="eventType" defaultValue="">
            <option value="">No special occasion</option>
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="message">
            Anything else <span className="font-normal text-stone">(optional)</span>
          </Label>
          <Textarea
            id="message"
            name="message"
            maxLength={2000}
            placeholder="Allergies, highchairs, a birthday surprise — anything we should know?"
          />
        </div>

        <FormError message={state.error} />

        <SubmitButton disabled={!date || !service} />
        <p className="text-center text-xs leading-relaxed text-stone">
          Submitting sends a reservation request — nothing is charged online. We confirm
          by email.
        </p>
      </form>
    </div>
  );
}
