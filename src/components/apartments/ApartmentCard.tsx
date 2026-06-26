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
    <article className="card-interactive overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={apartment.image}
          alt={apartment.imageAlt[locale]}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 font-sans text-sm font-medium text-ink backdrop-blur-sm">
          {t(`locations.${apartment.location}`)}
        </span>
      </div>

      <div className="p-6 sm:p-7">
        <h3 className="font-display text-3xl font-semibold tracking-tight text-ink">
          {apartment.name[locale]}
        </h3>
        <p className="mt-1.5 font-sans text-base text-forest-500">
          {apartment.area[locale]}
        </p>
        {apartment.ratingAverage != null && apartment.ratingCount != null && (
          <p className="mt-2 font-sans text-base text-forest-600">
            ★ {apartment.ratingAverage.toFixed(2)} ({apartment.ratingCount}{" "}
            {t("reviewCount")})
          </p>
        )}
        {apartment.description?.[locale] && (
          <p className="mt-3 font-sans text-base leading-relaxed text-forest-700">
            {apartment.description[locale]}
          </p>
        )}
      </div>
    </article>
  );
}
