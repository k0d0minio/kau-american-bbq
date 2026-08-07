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
  weekdayInitials,
  type ISODate,
} from "@/lib/booking/dates";
import {
  SERVICES,
  bookingWindow,
  isDateBlocked,
  isDayAvailable,
  serviceHasRoom,
  type BookingBlock,
  type DateRange,
  type Service,
} from "@/lib/booking/availability";
import { DINING_FORMATS, type DiningFormat } from "@/lib/booking/dining-formats";
import { EVENT_TYPES } from "@/lib/booking/event-types";
import { buttonVariants } from "@/app/components/ui/button";
import { FormError, Input, Label, Select, Textarea } from "@/app/components/ui/field";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { fill } from "@/lib/i18n/format";
import type { Locale } from "@/lib/i18n/config";
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

function SubmitButton({
  disabled,
  idle,
  busy,
}: {
  disabled: boolean;
  idle: string;
  busy: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className={cn(buttonVariants({ variant: "ember", size: "lg" }), "w-full")}
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          {busy}
        </>
      ) : (
        <>
          <Send className="size-4" />
          {idle}
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
  locale,
}: {
  space: PanelSpace;
  /** Approved bookings across every space — capacity is cross-space aware. */
  blocks: BookingBlock[];
  /** Closure ranges that apply to this space. */
  closures: DateRange[];
  today: ISODate;
  locale: Locale;
}) {
  const dict = getDictionary(locale);
  const t = dict.bookingForm;
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

  const dayLabels = useMemo(() => weekdayInitials(locale), [locale]);

  return (
    <div className="rounded-3xl border border-char-100 bg-bone-100 p-6 shadow-soft sm:p-7">
      <p className="eyebrow text-ember">{t.eyebrow}</p>
      <h2 className="mt-2 font-display text-2xl text-char-900">{t.heading}</h2>
      <p className="mt-2 text-sm leading-relaxed text-stone">{t.intro}</p>

      {/* Calendar */}
      <div className="mt-5 rounded-2xl border border-char-100 bg-bone p-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            aria-label={t.prevMonth}
            onClick={() => canPrev && setMonth(addMonths(month, -1))}
            disabled={!canPrev}
            className="flex size-8 items-center justify-center rounded-full text-char-700 transition-colors hover:bg-char-50 disabled:opacity-30"
          >
            <ChevronLeft className="size-4" />
          </button>
          <p className="text-sm font-medium text-ink">{formatMonth(month, locale)}</p>
          <button
            type="button"
            aria-label={t.nextMonth}
            onClick={() => canNext && setMonth(addMonths(month, 1))}
            disabled={!canNext}
            className="flex size-8 items-center justify-center rounded-full text-char-700 transition-colors hover:bg-char-50 disabled:opacity-30"
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
                aria-label={formatDate(day, locale)}
                aria-pressed={selected}
                className={cn(
                  "mx-auto flex size-9 items-center justify-center rounded-full text-sm transition-colors",
                  selected
                    ? "bg-char-700 font-medium text-bone"
                    : selectable
                      ? "cursor-pointer text-ink hover:bg-char-100"
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
        <div className="mt-3 flex items-center justify-between border-t border-char-100 pt-3">
          <p className="text-xs text-stone">
            {fill(t.calendarNote, { max: space.maxGuests })}
          </p>
          {date ? (
            <button
              type="button"
              onClick={clearDate}
              className="inline-flex items-center gap-1 text-xs font-medium text-char-700 hover:text-ember"
            >
              <Undo2 className="size-3" />
              {t.clear}
            </button>
          ) : null}
        </div>
      </div>

      {/* Sitting */}
      {date ? (
        <div className="mt-5 rounded-2xl bg-char-50 p-4">
          <p className="text-sm font-medium text-char-900">{formatDate(date, locale)}</p>
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
                      ? "border-char-700 bg-char-700 font-medium text-bone"
                      : room
                        ? "cursor-pointer border-char-100 bg-bone text-ink hover:border-char-400"
                        : "border-char-100 bg-bone/50 text-stone/50 line-through"
                  )}
                >
                  {dict.booking.services[option]}
                </button>
              );
            })}
          </div>
          {!service ? (
            <p className="mt-2 text-xs text-stone">{t.pickSitting}</p>
          ) : null}
        </div>
      ) : null}

      {/* How you'd like to be served — same room, same covers, same smoke. */}
      <fieldset className="mt-5">
        <legend className="text-sm font-medium text-char-900">{t.formatLegend}</legend>
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
                  ? "border-char-700 bg-char-700 text-bone"
                  : "cursor-pointer border-char-100 bg-bone text-ink hover:border-char-400"
              )}
            >
              <span className="block font-medium">{dict.booking.formats[option].label}</span>
              <span
                className={cn(
                  "mt-0.5 block text-xs leading-relaxed",
                  format === option ? "text-bone/80" : "text-stone"
                )}
              >
                {dict.booking.formats[option].note}
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
        <input type="hidden" name="locale" value={locale} />
        {/* Honeypot — humans never see or fill this. */}
        <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
          <label>
            Website
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="firstName">{t.firstName}</Label>
            <Input id="firstName" name="firstName" autoComplete="given-name" required maxLength={80} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName">{t.lastName}</Label>
            <Input id="lastName" name="lastName" autoComplete="family-name" required maxLength={80} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">{t.email}</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required maxLength={200} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="phone">{t.phone} <span className="font-normal text-stone">{t.optional}</span></Label>
            <Input id="phone" name="phone" type="tel" autoComplete="tel" maxLength={40} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="partySize">{t.partySize}</Label>
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
            {t.occasion} <span className="font-normal text-stone">{t.optional}</span>
          </Label>
          <Select id="eventType" name="eventType" defaultValue="">
            <option value="">{t.noOccasion}</option>
            {EVENT_TYPES.map((option) => (
              <option key={option.id} value={option.value}>
                {dict.booking.eventTypes[option.id]}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="message">
            {t.anythingElse} <span className="font-normal text-stone">{t.optional}</span>
          </Label>
          <Textarea
            id="message"
            name="message"
            maxLength={2000}
            placeholder={t.messagePlaceholder}
          />
        </div>

        <FormError message={state.error} />

        <SubmitButton disabled={!date || !service} idle={t.submit} busy={t.submitting} />
        <p className="text-center text-xs leading-relaxed text-stone">{t.disclaimer}</p>
      </form>
    </div>
  );
}
