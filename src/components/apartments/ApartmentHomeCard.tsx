import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { PropertyPrice } from "@/components/pricing/PropertyPrice";
import { StarRating } from "@/components/reviews/StarRating";
import { formatImageAlt } from "@/lib/format-image-alt";
import type { Apartment } from "@/types/apartment";

type Props = {
  apartment: Apartment;
  locale: "fi" | "en";
};

export async function ApartmentHomeCard({ apartment, locale }: Props) {
  const t = await getTranslations("apartments");
  const name = apartment.name[locale];

  return (
    <article className="card-interactive group relative flex flex-col overflow-hidden">
      <Link
        href={{
          pathname: "/contact",
          query: { topic: "apartment", property: apartment.id },
        }}
        className="absolute inset-0 z-10"
        aria-label={`${t("inquire")}: ${name}`}
      />

      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={apartment.image}
          alt={formatImageAlt(apartment.imageAlt[locale])}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-[1.1s] ease-out-expo group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 font-sans text-sm font-medium text-ink backdrop-blur-sm">
          {t(`locations.${apartment.location}`)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <h3 className="font-display text-3xl font-semibold tracking-tight text-ink">
          {name}
        </h3>
        <p className="mt-1.5 font-sans text-base text-forest-500">
          {apartment.area[locale]}
        </p>
        <PropertyPrice propertyId={apartment.id} locale={locale} variant="card" />
        {apartment.ratingAverage != null && apartment.ratingCount != null && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StarRating value={apartment.ratingAverage} size="sm" />
            <span className="font-sans text-base text-forest-600">
              {apartment.ratingAverage.toFixed(2)} ({apartment.ratingCount})
            </span>
          </div>
        )}
        {apartment.description?.[locale] && (
          <p className="mt-4 flex-1 font-sans text-base leading-relaxed text-forest-700">
            {apartment.description[locale]}
          </p>
        )}
        <span className="mt-6 inline-flex items-center gap-2 font-sans text-base font-semibold text-ink transition-all duration-300 group-hover:gap-3.5">
          {t("inquire")}
          <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </article>
  );
}
