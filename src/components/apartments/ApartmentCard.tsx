import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { Apartment } from "@/types/apartment";

type Props = {
  apartment: Apartment;
  locale: "fi" | "en";
};

export async function ApartmentCard({ apartment, locale }: Props) {
  const t = await getTranslations("apartments");

  return (
    <article className="overflow-hidden rounded-sm bg-cream-50 shadow-sm ring-1 ring-forest/5">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={apartment.image}
          alt={apartment.imageAlt[locale]}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
        <span className="absolute left-3 top-3 rounded-sm bg-forest/90 px-2.5 py-1 font-sans text-xs font-medium text-cream">
          {t(`locations.${apartment.location}`)}
        </span>
      </div>

      <div className="p-5 sm:p-6">
        <h3 className="font-display text-xl text-forest">
          {apartment.name[locale]}
        </h3>
        <p className="mt-2 font-sans text-sm text-forest-600">
          {apartment.area[locale]}
        </p>
        {apartment.ratingAverage != null && apartment.ratingCount != null && (
          <p className="mt-2 font-sans text-xs text-forest-500">
            ★ {apartment.ratingAverage.toFixed(2)} ({apartment.ratingCount}{" "}
            {t("reviewCount")})
          </p>
        )}
        {apartment.description?.[locale] && (
          <p className="mt-3 font-sans text-sm leading-relaxed text-forest-700">
            {apartment.description[locale]}
          </p>
        )}
      </div>
    </article>
  );
}
