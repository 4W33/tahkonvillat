import { getTranslations } from "next-intl/server";
import type { GuestReview } from "@/types/review";
import { formatReviewDate } from "@/lib/format-review-date";
import { StarRating } from "./StarRating";

type Props = {
  locale: string;
  reviews: GuestReview[];
  ratingAverage?: number;
  ratingCount?: number;
  propertyName?: string;
  compact?: boolean;
};

export async function GuestReviews({
  locale,
  reviews: unsorted,
  ratingAverage,
  ratingCount,
  propertyName,
  compact = false,
}: Props) {
  if (!unsorted.length && ratingAverage == null) return null;
  // Parhaat arviot ensin (sort on vakaa: sama arvosana säilyttää alkuperäisen järjestyksen).
  const reviews = [...unsorted].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

  const t = await getTranslations({ locale, namespace: "reviews" });

  return (
    <section
      className={
        compact
          ? "border-t border-forest/10 pt-6"
          : "mt-12 border-t border-forest/10 pt-12"
      }
    >
      {propertyName && !compact && (
        <p className="eyebrow">{propertyName}</p>
      )}

      {!compact && (
        <div className="mt-3 flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-display text-4xl font-semibold text-forest sm:text-5xl">
            {t("title")}
          </h2>

          {ratingAverage != null && ratingCount != null && (
            <div className="flex items-center gap-4 rounded-sm bg-cream-50 px-5 py-4 shadow-soft ring-1 ring-forest/5">
              <span className="font-display text-4xl leading-none text-forest">
                {ratingAverage.toFixed(2)}
              </span>
              <div>
                <StarRating value={ratingAverage} size="md" />
                <p className="mt-1.5 font-sans text-[0.9375rem] text-forest-600">
                  {t("summary", { count: ratingCount })}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {compact && ratingAverage != null && ratingCount != null && (
        <div className="mb-5 space-y-1">
          <p className="font-sans text-base font-medium text-forest">
            {t("summary", { count: ratingCount })}
          </p>
          {ratingCount > reviews.length && reviews.length > 0 && (
            <p className="font-sans text-[0.9375rem] text-forest-500">
              {t("showingSubset", {
                total: ratingCount,
                shown: reviews.length,
              })}
            </p>
          )}
        </div>
      )}

      {reviews.length > 0 && (
        <ul
          className={`grid items-start gap-5 sm:grid-cols-2 ${compact ? "" : "mt-10"}`}
        >
          {reviews.map((review) => (
            <li
              key={`${review.author ?? "guest"}-${review.comment.slice(0, 48)}`}
              className="quote-card"
            >
              <div className="relative flex flex-wrap items-center gap-x-3 gap-y-1">
                {review.rating != null && (
                  <StarRating value={review.rating} size="sm" />
                )}
                {review.author && (
                  <span className="font-sans text-base font-semibold text-forest">
                    {review.author}
                  </span>
                )}
                {review.date && (
                  <span className="font-sans text-[0.9375rem] text-forest-500">
                    {formatReviewDate(review.date, locale)}
                  </span>
                )}
              </div>

              <p className="relative mt-5 flex-1 font-sans text-base leading-relaxed text-forest-700">
                {review.comment}
              </p>
            </li>
          ))}
        </ul>
      )}

      {locale !== "fi" && reviews.length > 0 && (
        <p className="mt-6 font-sans text-base text-forest-500">{t("originalLanguage")}</p>
      )}

      {!compact &&
        ratingCount != null &&
        reviews.length > 0 &&
        ratingCount > reviews.length && (
          <p className="mt-8 font-sans text-base text-forest-500">
            {t("showingSubset", {
              total: ratingCount,
              shown: reviews.length,
            })}
          </p>
        )}
    </section>
  );
}
