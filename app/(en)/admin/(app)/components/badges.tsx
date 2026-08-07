// Status chips shared across the admin. Server-safe (no hooks).
import { cn } from "@/lib/utils";
import type { Booking, Enquiry } from "@/lib/db/schema";

const chip =
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap";

const BOOKING_STYLES: Record<string, string> = {
  pending: "bg-ember/15 text-[#7c2d12]",
  approved: "bg-char-50 text-char-700",
  declined: "bg-parchment text-stone",
  cancelled: "bg-parchment text-stone line-through decoration-stone/50",
  completed: "bg-rust/10 text-rust",
};

export function BookingStatusBadge({
  status,
  completed = false,
}: {
  status: Booking["status"];
  completed?: boolean;
}) {
  const key = completed && status === "approved" ? "completed" : status;
  return <span className={cn(chip, BOOKING_STYLES[key])}>{key}</span>;
}

const PAYMENT_LABELS: Record<Booking["paymentStatus"], string> = {
  unpaid: "unpaid",
  deposit_paid: "deposit paid",
  paid: "paid",
  refunded: "refunded",
};

const PAYMENT_STYLES: Record<Booking["paymentStatus"], string> = {
  unpaid: "bg-parchment text-stone",
  deposit_paid: "bg-ember/15 text-[#7c2d12]",
  paid: "bg-char-50 text-char-700",
  refunded: "bg-rust/10 text-rust",
};

export function PaymentStatusBadge({ status }: { status: Booking["paymentStatus"] }) {
  return <span className={cn(chip, PAYMENT_STYLES[status])}>{PAYMENT_LABELS[status]}</span>;
}

const ENQUIRY_STYLES: Record<Enquiry["status"], string> = {
  new: "bg-ember/15 text-[#7c2d12]",
  replied: "bg-char-50 text-char-700",
  converted: "bg-rust/10 text-rust",
  archived: "bg-parchment text-stone",
};

export function EnquiryStatusBadge({ status }: { status: Enquiry["status"] }) {
  return <span className={cn(chip, ENQUIRY_STYLES[status])}>{status}</span>;
}

/** Small alert chip, e.g. "cancellation requested". */
export function AlertBadge({ children }: { children: React.ReactNode }) {
  return <span className={cn(chip, "bg-ember/15 text-[#7c2d12]")}>{children}</span>;
}
