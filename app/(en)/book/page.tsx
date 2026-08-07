import { redirect } from "next/navigation";
import { bookableSlug } from "@/lib/booking/entry";
import { localeHref } from "@/lib/i18n/config";

// Every "Book a table" CTA points here so a guest reaches the reservation form
// in one click.
export const dynamic = "force-dynamic";

export default async function BookPage() {
  redirect(localeHref("en", `/spaces/${await bookableSlug()}`));
}
