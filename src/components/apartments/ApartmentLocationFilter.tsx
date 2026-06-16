"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { ApartmentFilterValue } from "@/lib/apartment-filters";

const locations = ["all", "vantaa", "helsinki"] as const;

type Props = {
  active: ApartmentFilterValue;
  variant?: "light" | "dark";
};

export function ApartmentLocationFilter({
  active,
  variant = "light",
}: Props) {
  const t = useTranslations("apartments.filters");
  const router = useRouter();
  const isDark = variant === "dark";

  function setLocation(location: ApartmentFilterValue) {
    router.push({
      pathname: "/apartments",
      query: location === "all" ? undefined : { location },
    });
  }

  return (
    <div
      className="flex flex-wrap gap-2.5"
      role="group"
      aria-label={t("label")}
    >
      {locations.map((location) => {
        const isActive = active === location;

        return (
          <button
            key={location}
            type="button"
            onClick={() => setLocation(location)}
            className={
              isActive
                ? isDark
                  ? "filter-pill border-paper bg-paper text-ink"
                  : "filter-pill-active"
                : isDark
                  ? "filter-pill border-paper/25 text-paper hover:border-paper hover:bg-paper/10"
                  : "filter-pill-inactive"
            }
          >
            {t(location)}
          </button>
        );
      })}
    </div>
  );
}
