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
    <section data-cms="home.villas" className="bg-[#F7F2EA] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mb-16 max-w-3xl">
            <p className="eyebrow">{t("eyebrow")}</p>
            <h2 className="section-title mt-2">{t("title")}</h2>
            <p className="mt-6 max-w-2xl font-sans text-lg leading-relaxed text-forest-700 sm:text-xl">
              {t("subtitle")}
            </p>
          </div>
        </Reveal>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {villas.map((villa, index) => (
            <Reveal key={villa.slug} delay={index * 90}>
              <VillaCard villa={villa} locale={locale} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={160}>
          <div className="mt-14 flex justify-start border-t border-[color:var(--hairline)] pt-10">
            <Link href="/villas" className="btn-secondary">
              {t("cta")}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
