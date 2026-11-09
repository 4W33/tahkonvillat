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
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mb-14 max-w-3xl">
            <p className="eyebrow">{t("eyebrow")}</p>
            <h2 className="section-title mt-2">{t("title")}</h2>
            <p className="mt-6 max-w-2xl font-sans text-lg leading-relaxed text-forest-700 sm:text-xl">
              {t("subtitle")}
            </p>
          </div>
        </Reveal>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {apartments.slice(0, 3).map((apartment, index) => (
            <Reveal key={apartment.id} delay={index * 80}>
              <ApartmentHomeCard apartment={apartment} locale={locale} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={160}>
          <div className="mt-14 flex justify-start border-t border-[color:var(--hairline)] pt-10">
            <Link href="/apartments" className="btn-secondary">
              {t("cta")}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
