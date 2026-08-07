import type { Metadata } from "next";
import { Landing } from "../components/landing";
import { landingMetadata } from "@/lib/seo";

// Refresh the landing page every few minutes so admin edits to spaces and
// rates show up without a redeploy.
export const revalidate = 300;

export const metadata: Metadata = landingMetadata("en");

export default function Home() {
  return <Landing locale="en" />;
}
