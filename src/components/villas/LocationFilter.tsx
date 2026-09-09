"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { LocationFilterValue } from "@/lib/villa-filters";

const locations = ["all", "tahko", "helsinki", "vantaa"] as const;

type Props = {
  active: LocationFilterValue;
};

export function LocationFilter({ active }: Props) {
  const t = useTranslations("villas.filters");
  const router = useRouter();

  function setLocation(location: LocationFilterValue) {
    router.push({
      pathname: "/villas",
      query: location === "all" ? undefined : { location },
    });
  }

  return (
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-label={t("label")}
    >
      {locations.map((location) => (
        <button
          key={location}
          type="button"
          onClick={() => setLocation(location)}
          className={`rounded-lg px-4 py-2.5 font-sans text-base font-medium transition-colors ${
            active === location
              ? "bg-forest text-cream"
              : "bg-cream-50 text-forest-700 ring-1 ring-forest/10 hover:bg-cream-100"
          }`}
        >
          {t(location)}
        </button>
      ))}
    </div>
  );
}
