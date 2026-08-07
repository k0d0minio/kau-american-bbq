import type { Metadata } from "next";
import { BookingStatus } from "@/app/components/booking/status-page";
import { getDictionary } from "@/lib/i18n/dictionaries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: getDictionary("en").bookingStatus.title,
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ submitted?: string }>;
};

export default async function BookingStatusPage({ params, searchParams }: Props) {
  const [{ token }, { submitted }] = await Promise.all([params, searchParams]);
  return <BookingStatus token={token} submitted={Boolean(submitted)} locale="en" />;
}
