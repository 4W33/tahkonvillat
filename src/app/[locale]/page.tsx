import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/home/Hero";
import { TrustStrip } from "@/components/home/TrustStrip";
import { StatsBand } from "@/components/home/StatsBand";
import { ApartmentPreviewGrid } from "@/components/home/ApartmentPreviewGrid";
import { VillaPreviewGrid } from "@/components/home/VillaPreviewGrid";
import { HighlightsStrip } from "@/components/home/HighlightsStrip";
import { HomeEditorialBand } from "@/components/home/HomeEditorialBand";
import { HomeReviews } from "@/components/home/HomeReviews";
import { BrandStory } from "@/components/home/BrandStory";
import { CtaSection } from "@/components/home/CtaSection";

type Props = {
  params: { locale: string };
};

export default async function HomePage({ params: { locale } }: Props) {
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <TrustStrip />
      <StatsBand />
      <VillaPreviewGrid locale={locale as "fi" | "en"} />
      <HighlightsStrip />
      <ApartmentPreviewGrid locale={locale as "fi" | "en"} />
      <HomeEditorialBand />
      <HomeReviews />
      <BrandStory />
      <CtaSection />
    </>
  );
}
