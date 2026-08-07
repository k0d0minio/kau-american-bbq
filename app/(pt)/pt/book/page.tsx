import { redirect } from "next/navigation";
import { bookableSlug } from "@/lib/booking/entry";
import { localeHref } from "@/lib/i18n/config";

// Mirrors app/(en)/book — forwards to the Portuguese reservation page.
export const dynamic = "force-dynamic";

export default async function BookPagePt() {
  redirect(localeHref("pt", `/spaces/${await bookableSlug()}`));
}
