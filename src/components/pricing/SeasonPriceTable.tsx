import { getTranslations } from "next-intl/server";
import { formatSeasonRange, getUpcomingSeasons } from "@/lib/pricing/seasons";
import type { PropertyPricing } from "@/types/pricing";

type Props = { pricing: PropertyPricing; locale: string; today: string };

/** Tulevat kaudet + "Muut ajat" -perushinta. Ei renderöidy ilman kausia. */
export async function SeasonPriceTable({ pricing, locale, today }: Props) {
  const seasons = getUpcomingSeasons(pricing, today);
  if (seasons.length === 0) return null;

  const t = await getTranslations({ locale, namespace: "pricing" });
  const lang = locale === "en" ? "en" : "fi";
  const money = new Intl.NumberFormat(locale === "fi" ? "fi-FI" : "en-GB", {
    maximumFractionDigits: 0,
  });

  return (
    <div className="mt-4 border-t border-[color:var(--hairline)] pt-4">
      <p className="mono-label">{t("seasonsTitle")}</p>
      <table className="mt-2 w-full font-sans text-[0.9375rem] text-forest-700">
        <tbody>
          {seasons.map((season) => (
            <tr
              key={season.id}
              className="border-b border-[color:var(--hairline)] last:border-b-0"
            >
              <td className="py-2 pr-3">
                {formatSeasonRange(season.start, season.end, locale)}
                {season.label?.[lang] ? (
                  <span className="ml-2 text-forest-500">{season.label[lang]}</span>
                ) : null}
              </td>
              <td className="py-2 text-right font-semibold text-ink">
                {t("perNight", { price: money.format(season.pricePerNight) })}
              </td>
            </tr>
          ))}
          {(pricing.fromPerNight ?? 0) > 0 && (
            <tr>
              <td className="py-2 pr-3">{t("otherTimes")}</td>
              <td className="py-2 text-right font-semibold text-ink">
                {t("perNight", { price: money.format(pricing.fromPerNight as number) })}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
