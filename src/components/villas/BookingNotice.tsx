import { getTranslations } from "next-intl/server";
import { StarRating } from "@/components/reviews/StarRating";
import type { Villa } from "@/types/villa";

type Props = {
  locale: string;
  villa: Villa;
};

export async function BookingNotice({ locale, villa }: Props) {
  const t = await getTranslations({ locale, namespace: "villas.detail.booking" });

  return (
    <div className="card p-6 sm:p-8">
      <h3 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-3xl">
        {t("title")}
      </h3>

      {villa.ratingAverage != null && villa.ratingCount != null && (
        <div className="mt-4 flex items-center gap-3">
          <StarRating value={villa.ratingAverage} size="sm" />
          <p className="font-sans text-base text-forest-600">
            {t("rating", {
              rating: villa.ratingAverage.toFixed(2),
              count: villa.ratingCount,
            })}
          </p>
        </div>
      )}

      <p className="mt-5 font-sans text-base leading-relaxed text-forest-700">
        {t("body")}
      </p>
      <p className="mt-3 font-sans text-base leading-relaxed text-forest-600">
        {t("direct")}
      </p>
    </div>
  );
}
