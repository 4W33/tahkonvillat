import { getTranslations } from "next-intl/server";
import { getPropertyPricing } from "@/lib/data/pricing";

type Props = {
  propertyId: string;
  locale: string;
  variant?: "inline" | "card" | "detail";
};

export async function PropertyPrice({
  propertyId,
  locale,
  variant = "inline",
}: Props) {
  const pricing = await getPropertyPricing(propertyId);
  if (!pricing) return null;

  const t = await getTranslations({ locale, namespace: "pricing" });
  const formatted = new Intl.NumberFormat(locale === "fi" ? "fi-FI" : "en-GB", {
    maximumFractionDigits: 0,
  }).format(pricing.fromPerNight);

  if (variant === "detail") {
    return (
      <div className="mt-4 rounded-xl bg-[#FAF7F3] px-5 py-4">
        <p className="font-display text-3xl font-semibold text-forest sm:text-3xl">
          {t("fromPerNight", { price: formatted })}
        </p>
        <p className="mt-1.5 font-sans text-base text-forest-500">
          {t("disclaimer")}
        </p>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <p className="mt-3 font-sans text-base font-semibold text-forest">
        {t("fromPerNight", { price: formatted })}
      </p>
    );
  }

  return (
    <span className="font-sans text-base font-semibold text-forest">
      {t("fromPerNight", { price: formatted })}
    </span>
  );
}
