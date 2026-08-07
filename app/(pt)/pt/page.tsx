import type { Metadata } from "next";
import { Landing } from "../../components/landing";
import { landingMetadata } from "@/lib/seo";

// Mirrors app/(en)/page.tsx — same content and revalidation, Portuguese copy.
export const revalidate = 300;

export const metadata: Metadata = landingMetadata("pt");

export default function HomePt() {
  return <Landing locale="pt" />;
}
