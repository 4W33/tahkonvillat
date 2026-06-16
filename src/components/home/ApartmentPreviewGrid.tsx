import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getApartments } from "@/lib/content/apartments";
import { Reveal } from "@/components/ui/Reveal";
import { ApartmentHomeCard } from "@/components/apartments/ApartmentHomeCard";

type Props = {
  locale: "fi" | "en";
};

export async function ApartmentPreviewGrid({ locale }: Props) {
  const t = await getTranslations("home.apartments");
  const apartments = await getApartments();

  return (
    <section className="bg-paper py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col gap-6 border-t border-[color:var(--hairline)] pt-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow">{t("eyebrow")}</p>
              <h2 className="section-title mt-5">{t("title")}</h2>
            </div>
            <p className="max-w-sm font-sans text-sm leading-relaxed text-forest-700">
              {t("subtitle")}
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {apartments.map((apartment, index) => (
            <Reveal key={apartment.id} delay={index * 80}>
              <ApartmentHomeCard apartment={apartment} locale={locale} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={160}>
          <div className="mt-10 text-center">
            <Link href="/apartments" className="btn-secondary">
              {t("cta")}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
