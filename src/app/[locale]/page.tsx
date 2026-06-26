import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/home/Hero";
import { VillaPreviewGrid } from "@/components/home/VillaPreviewGrid";
import { TrustStrip } from "@/components/home/TrustStrip";
import { HighlightsStrip } from "@/components/home/HighlightsStrip";
import { ApartmentPreviewGrid } from "@/components/home/ApartmentPreviewGrid";
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
      <VillaPreviewGrid locale={locale as "fi" | "en"} />
      <BrandStory />
      <TrustStrip />
      <HighlightsStrip />
      <ApartmentPreviewGrid locale={locale as "fi" | "en"} />
      <HomeEditorialBand />
      <HomeReviews />
      <CtaSection />
    </>
  );
}
