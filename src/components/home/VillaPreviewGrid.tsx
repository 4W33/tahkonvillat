import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getVillas } from "@/lib/content/villas";
import { Reveal } from "@/components/ui/Reveal";
import { VillaCard } from "@/components/villas/VillaCard";

type Props = {
  locale: "fi" | "en";
};

export async function VillaPreviewGrid({ locale }: Props) {
  const t = await getTranslations("home.villas");
  const villas = await getVillas();

  return (
    <section className="bg-paper-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <p className="eyebrow">{t("eyebrow")}</p>
              <h2 className="section-title mt-6">{t("title")}</h2>
            </div>
            <p className="max-w-sm font-sans text-sm leading-relaxed text-forest-700">
              {t("subtitle")}
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {villas.map((villa, index) => (
            <Reveal key={villa.slug} delay={index * 90}>
              <VillaCard villa={villa} locale={locale} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={160}>
          <div className="mt-12 flex justify-end border-t border-[color:var(--hairline)] pt-8">
            <Link href="/villas" className="btn-secondary">
              {t("cta")}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
