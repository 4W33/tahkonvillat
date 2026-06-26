import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function VillaEmptyState() {
  const t = await getTranslations("villas.empty");

  return (
    <div className="rounded-sm bg-cream-50 px-6 py-12 text-center ring-1 ring-forest/5">
      <p className="font-display text-3xl font-semibold text-forest">{t("title")}</p>
      <p className="mx-auto mt-3 max-w-md font-sans text-base leading-relaxed text-forest-700">
        {t("subtitle")}
      </p>
      <Link
        href="/apartments"
        className="btn-primary mt-6"
      >
        {t("cta")}
      </Link>
    </div>
  );
}
