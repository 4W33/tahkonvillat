import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildPageMetadata } from "@/lib/seo";
import { Hero } from "@/components/home/Hero";
import { VillaPreviewGrid } from "@/components/home/VillaPreviewGrid";
import { TrustStrip } from "@/components/home/TrustStrip";
import { ApartmentPreviewGrid } from "@/components/home/ApartmentPreviewGrid";
import { HomeEditorialBand } from "@/components/home/HomeEditorialBand";
import { HomeReviews } from "@/components/home/HomeReviews";
import { BrandStory } from "@/components/home/BrandStory";
import { CtaSection } from "@/components/home/CtaSection";
import { requireLocale } from "@/i18n/locale";

/** Kausihinnat vanhenevat ajan myötä → uudelleenvalidoi 3 h välein (sama kuin villas/page.tsx). */
export const revalidate = 10800;

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: Props) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return buildPageMetadata({
    locale,
    title: t("title"),
    description: t("description"),
    path: "/",
    absoluteTitle: t("title"),
  });
}

export default async function HomePage(props: Props) {
  const params = await props.params;

  const {
    locale
  } = params;

  const lang = requireLocale(locale);
  setRequestLocale(lang);

  return (
    <>
      <Hero />
      <VillaPreviewGrid locale={lang} />
      <BrandStory />
      <TrustStrip />
      <ApartmentPreviewGrid locale={lang} />
      <HomeEditorialBand />
      <HomeReviews />
      <CtaSection />
    </>
  );
}
