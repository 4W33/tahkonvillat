import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PropertyPrice } from "@/components/pricing/PropertyPrice";
import { GuestReviews } from "@/components/reviews/GuestReviews";
import { StarRating } from "@/components/reviews/StarRating";
import { VillaGallery } from "@/components/villas/VillaGallery";
import { formatImageAlt } from "@/lib/format-image-alt";
import { resolveGallery } from "@/lib/resolve-gallery";
import type { Apartment } from "@/types/apartment";
import { ApartmentReviewsAccordion } from "./ApartmentReviewsAccordion";

type Props = {
  apartment: Apartment;
  locale: "fi" | "en";
};

export async function ApartmentListingItem({ apartment, locale }: Props) {
  const t = await getTranslations("apartments");
  const alt = formatImageAlt(apartment.imageAlt[locale]);
  const gallery = resolveGallery(apartment.image, apartment.gallery);
  const hasReviews =
    (apartment.reviews?.length ?? 0) > 0 || apartment.ratingAverage != null;

  return (
    <section
      id={apartment.id}
      className="card-interactive scroll-mt-24 overflow-hidden"
    >
      {/* minmax(0,…) myös mobiilissa: muuten sarake venyy pikkukuvarivin (overflow-x) leveyteen
          ja kuva + tekstit leikkautuvat kortin ulkopuolelle. */}
      <div className="grid grid-cols-[minmax(0,1fr)] md:grid-cols-[minmax(0,1.05fr)_minmax(0,1.45fr)]">
        <div className="relative min-w-0 p-4 sm:p-5 md:min-h-[300px]">
          <span className="absolute left-7 top-7 z-20 rounded-full bg-white/85 px-3 py-1 font-sans text-sm font-medium text-ink backdrop-blur-sm">
            {t(`locations.${apartment.location}`)}
          </span>
          <VillaGallery images={gallery} alt={alt} variant="card" />
        </div>

        <div className="flex min-w-0 flex-col p-5 sm:p-6 md:p-8">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-[2rem]">
            {apartment.name[locale]}
          </h2>
          <p className="mt-1.5 font-sans text-base text-forest-500">
            {apartment.area[locale]}
          </p>

          <PropertyPrice
            propertyId={apartment.id}
            locale={locale}
            variant="card"
          />

          {apartment.ratingAverage != null && apartment.ratingCount != null && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StarRating value={apartment.ratingAverage} size="sm" />
              <span className="font-sans text-base text-forest-600">
                {apartment.ratingAverage.toFixed(2)} ({apartment.ratingCount}{" "}
                {t("reviewCount")})
              </span>
            </div>
          )}

          {apartment.description?.[locale] && (
            <p className="mt-4 flex-1 font-sans text-base leading-relaxed text-forest-700">
              {apartment.description[locale]}
            </p>
          )}

          <Link
            href={{
              pathname: "/contact",
              query: {
                topic: "apartment",
                property: apartment.id,
              },
            }}
            className="btn-primary mt-6 w-fit"
          >
            {t("inquire")}
          </Link>
        </div>
      </div>

      {hasReviews && (
        <ApartmentReviewsAccordion
          reviewCount={apartment.ratingCount ?? apartment.reviews?.length ?? 0}
          shownCount={apartment.reviews?.length ?? 0}
          ratingAverage={apartment.ratingAverage}
        >
          <GuestReviews
            locale={locale}
            reviews={apartment.reviews ?? []}
            ratingAverage={apartment.ratingAverage}
            ratingCount={apartment.ratingCount}
            compact
          />
        </ApartmentReviewsAccordion>
      )}
    </section>
  );
}
