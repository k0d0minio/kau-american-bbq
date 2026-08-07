import type { Metadata } from "next";
import { SpaceDetailPage, spacePageMetadata } from "@/app/components/booking/space-page";

// Availability must always be live — never prerender or cache this page.
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  return spacePageMetadata((await params).slug, "en");
}

export default async function SpacePage({ params }: Params) {
  return <SpaceDetailPage slug={(await params).slug} locale="en" />;
}
