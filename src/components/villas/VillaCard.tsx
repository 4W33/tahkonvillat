import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { PropertyPrice } from "@/components/pricing/PropertyPrice";
import { StarRating } from "@/components/reviews/StarRating";
import { formatImageAlt } from "@/lib/format-image-alt";
import type { Villa } from "@/types/villa";

type Props = {
  villa: Villa;
  locale: "fi" | "en";
};

export async function VillaCard({ villa, locale }: Props) {
  const t = await getTranslations("villas");
  const name = villa.name[locale];

  return (
    <article className="card-interactive group relative flex flex-col overflow-hidden">
      <Link
        href={{ pathname: "/villas/[slug]", params: { slug: villa.slug } }}
        className="absolute inset-0 z-10"
        aria-label={`${t("explore")}: ${name}`}
      />

      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={villa.image}
          alt={formatImageAlt(villa.imageAlt[locale])}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-[1.1s] ease-out-expo group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <span className="absolute left-4 top-4 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-paper mix-blend-difference">
          {t(`locations.${villa.location}`)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <h3 className="font-display text-2xl font-extrabold tracking-tightest text-ink sm:text-[1.6rem]">
          {name}
        </h3>
        <p className="mt-2 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-forest-500">
          {t("meta", { guests: villa.guests, bedrooms: villa.bedrooms })}
        </p>
        <PropertyPrice propertyId={villa.slug} locale={locale} variant="card" />
        {villa.ratingAverage != null && villa.ratingCount != null && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StarRating value={villa.ratingAverage} size="sm" />
            <span className="font-mono text-xs text-forest-600">
              {villa.ratingAverage.toFixed(2)} ({villa.ratingCount})
            </span>
          </div>
        )}
        <p className="mt-4 flex-1 font-sans text-sm leading-relaxed text-forest-700">
          {villa.description[locale]}
        </p>
        <span className="mt-6 inline-flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.16em] font-medium text-ink transition-all duration-300 group-hover:gap-3.5">
          {t("explore")}
          <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </article>
  );
}
