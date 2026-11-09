import { getTranslations } from "next-intl/server";
import type { VillaUnit } from "@/types/villa";

type Props = {
  locale: string;
  units: VillaUnit[];
};

export async function VillaUnits({ locale, units }: Props) {
  if (!units.length) return null;

  const t = await getTranslations({ locale, namespace: "villas.detail" });
  const lang = locale as "fi" | "en";

  return (
    <div className="mt-12">
      <h2 className="font-display text-4xl font-semibold text-forest sm:text-5xl">
        {t("unitsTitle")}
      </h2>
      <p className="mt-3 font-sans text-[0.9375rem] text-forest-600 sm:text-base">
        {t("unitsSubtitle")}
      </p>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {units.map((unit) => (
          <li key={unit.id} className="card p-5 transition-colors hover:bg-cream">
            <p className="font-display text-xl font-semibold text-forest">{unit.name[lang]}</p>
            <p className="mt-2 font-sans text-[0.9375rem] text-forest-600">
              {t("unitMeta", {
                guests: unit.guests,
                bedrooms: unit.bedrooms,
              })}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
