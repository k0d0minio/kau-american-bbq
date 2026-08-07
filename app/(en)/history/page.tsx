import type { Metadata } from "next";
import { Nav } from "@/app/components/nav";
import { Footer } from "@/app/components/footer";
import {
  HistoryHero,
  HistoryLede,
  HistoryTimeline,
  HistoryFigures,
  HistoryScale,
  HistoryToday,
  HistorySources,
} from "./sections";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "How a bite of brisket in Paris became KAU Barbecue — Rui and Vera Matias' Texas-style smokehouse in Malveira, built around a smoker called Godzilla.",
  alternates: { canonical: "/history" },
  openGraph: {
    type: "article",
    title: "Our Story · KAU Barbecue",
    description:
      "From a bite of brisket in Paris to pop-ups, festivals and a permanent smokehouse in Malveira — the story of KAU Barbecue.",
  },
};

export default function HistoryPage() {
  return (
    <>
      <Nav />
      <main>
        <HistoryHero />
        <HistoryLede />
        <HistoryTimeline />
        <HistoryFigures />
        <HistoryScale />
        <HistoryToday />
        <HistorySources />
      </main>
      <Footer />
    </>
  );
}
