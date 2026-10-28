import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BackLink } from "@/components/ui/BackLink";
import { Reveal } from "@/components/ui/Reveal";
import { VillaMobileCta } from "@/components/villas/VillaMobileCta";
import { VillaGallery } from "@/components/villas/VillaGallery";
import { AmenityGrid } from "@/components/villas/AmenityGrid";
import { VillaUnits } from "@/components/villas/VillaUnits";
import { PropertyPrice } from "@/components/pricing/PropertyPrice";
import { GuestReviews } from "@/components/reviews/GuestReviews";
import { StarRating } from "@/components/reviews/StarRating";
import { BookingNotice } from "@/components/villas/BookingNotice";
import { VillaInquiryForm } from "@/components/villas/VillaInquiryForm";
import { PropertyAvailability } from "@/components/villas/PropertyAvailability";
import { VillaJsonLd } from "@/components/seo/VillaJsonLd";
import { getVillaBySlug, getVillaSlugs } from "@/lib/content/villas";
import { buildPageMetadata } from "@/lib/seo";
import { requireLocale } from "@/i18n/locale";

/** Saatavuus (iCal) ja kausihinnat vanhenevat ajan myötä → uudelleenvalidoi 3 h välein. */
export const revalidate = 10800;

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getVillaSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(props: Props) {
  const params = await props.params;

  const {
    locale,
    slug
  } = params;

  const villa = await getVillaBySlug(slug);
  if (!villa) return {};

  const lang = requireLocale(locale);
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const pageTitle = `${villa.name[lang]} | ${tCommon("brand")}`;

  return buildPageMetadata({
    locale,
    title: villa.name[lang],
    description: villa.description[lang],
    path: `/villas/${slug}`,
    absoluteTitle: pageTitle,
  });
}

export default async function VillaDetailPage(props: Props) {
  const params = await props.params;

  const {
    locale,
    slug
  } = params;

  const lang = requireLocale(locale);
  setRequestLocale(lang);
  const villa = await getVillaBySlug(slug);

  if (!villa) {
    notFound();
  }

  const t = await getTranslations("villas");
  const tDetail = await getTranslations("villas.detail");

  return (
    <main className="pb-24 lg:pb-0">
      <VillaJsonLd villa={villa} locale={lang} />
      <VillaMobileCta />
      <section className="page-header !py-10 sm:!py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <BackLink href="/villas" label={tDetail("back")} />
            <p className="eyebrow mt-6">{t(`locations.${villa.location}`)}</p>
            <h1 className="section-title mt-3">{villa.name[lang]}</h1>
            <p className="mt-4 font-sans text-base text-forest-600">
              {t("meta", { guests: villa.guests, bedrooms: villa.bedrooms })}
            </p>
            <PropertyPrice
              propertyId={villa.slug}
              locale={locale}
              variant="detail"
            />
            {villa.ratingAverage != null && villa.ratingCount != null && (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <StarRating value={villa.ratingAverage} size="sm" />
                <span className="font-sans text-base text-forest-600">
                  {tDetail("booking.rating", {
                    rating: villa.ratingAverage.toFixed(2),
                    count: villa.ratingCount,
                  })}
                </span>
              </div>
            )}
          </Reveal>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-12">
            <div>
              <Reveal>
                <VillaGallery
                  images={villa.gallery}
                  alt={villa.imageAlt[lang]}
                />
              </Reveal>

              <Reveal delay={80}>
                <div className="mt-10 space-y-4">
                  {villa.longDescription[lang].map((paragraph) => (
                    <p
                      key={paragraph.slice(0, 24)}
                      className="font-sans text-base leading-relaxed text-forest-700"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </Reveal>

              <Reveal delay={100}>
                <PropertyAvailability villa={villa} locale={lang} />
              </Reveal>

              {villa.units && villa.units.length > 0 && (
                <Reveal delay={120}>
                  <VillaUnits locale={locale} units={villa.units} />
                </Reveal>
              )}

              <Reveal delay={160}>
                <div className="mt-10">
                  <h2 className="font-display text-4xl font-semibold text-forest sm:text-5xl">
                    {tDetail("amenitiesTitle")}
                  </h2>
                  <div className="mt-4">
                    <AmenityGrid amenities={villa.amenities} />
                  </div>
                </div>
              </Reveal>

              {(villa.reviews?.length || villa.ratingAverage != null) && (
                <Reveal delay={200}>
                  <GuestReviews
                    locale={locale}
                    reviews={villa.reviews ?? []}
                    ratingAverage={villa.ratingAverage}
                    ratingCount={villa.ratingCount}
                  />
                </Reveal>
              )}
            </div>

            <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
              <Reveal delay={60}>
                <BookingNotice locale={locale} villa={villa} />
              </Reveal>
              <Reveal delay={140}>
                <VillaInquiryForm
                  villaSlug={villa.slug}
                  villaName={villa.name[lang]}
                  maxGuests={villa.guests}
                  locale={locale}
                />
              </Reveal>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
