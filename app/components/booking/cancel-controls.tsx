"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/app/components/ui/button";
import { FormError } from "@/app/components/ui/field";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import {
  requestCancellation,
  withdrawRequest,
  type ManageBookingState,
} from "./manage-actions";

function ConfirmButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(buttonVariants({ variant: "primary", size: "sm" }))}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : null}
      {label}
    </button>
  );
}

export function CancelControls({
  token,
  mode,
  locale,
}: {
  token: string;
  /** "withdraw" cancels a pending request; "request" flags a confirmed reservation. */
  mode: "withdraw" | "request";
  locale: Locale;
}) {
  const dict = getDictionary(locale).bookingStatus;
  const t = mode === "withdraw" ? dict.withdraw : dict.cancel;
  const [confirming, setConfirming] = useState(false);
  const [state, formAction] = useActionState<ManageBookingState, FormData>(
    mode === "withdraw" ? withdrawRequest : requestCancellation,
    {}
  );

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        {t.cta}
      </button>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="locale" value={locale} />
      <p className="text-sm text-ink-soft">{t.confirm}</p>
      <div className="flex flex-wrap gap-3">
        <ConfirmButton label={t.yes} />
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          {dict.keep}
        </button>
      </div>
      <FormError message={state.error} />
    </form>
  );
}
