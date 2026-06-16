"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { StarRating } from "@/components/reviews/StarRating";

type Props = {
  reviewCount: number;
  shownCount: number;
  ratingAverage?: number;
  children: ReactNode;
};

export function ApartmentReviewsAccordion({
  reviewCount,
  shownCount,
  ratingAverage,
  children,
}: Props) {
  const t = useTranslations("apartments");
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-forest/10">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors duration-200 hover:bg-forest/[0.03] sm:px-6"
      >
        <span className="flex flex-wrap items-center gap-3">
          <span className="font-sans text-sm font-semibold text-forest">
            {open
              ? t("hideReviews")
              : t("showReviews", { shown: shownCount, total: reviewCount })}
          </span>
          {ratingAverage != null && (
            <span className="flex items-center gap-2 font-sans text-xs text-forest-500">
              <StarRating value={ratingAverage} size="sm" />
              {ratingAverage.toFixed(2)}
            </span>
          )}
        </span>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest/5 font-sans text-lg text-forest transition-transform duration-300 ease-out-expo ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        >
          ▾
        </span>
      </button>

      <div
        className={`grid transition-all duration-300 ease-out-expo ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-6 sm:px-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
