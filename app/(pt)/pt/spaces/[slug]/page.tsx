import type { Metadata } from "next";
import { SpaceDetailPage, spacePageMetadata } from "@/app/components/booking/space-page";

// Mirrors app/(en)/spaces/[slug] — same page, Portuguese copy.
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  return spacePageMetadata((await params).slug, "pt");
}

export default async function SpacePagePt({ params }: Params) {
  return <SpaceDetailPage slug={(await params).slug} locale="pt" />;
}
