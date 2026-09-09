import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ApartmentListingItem } from "@/components/apartments/ApartmentListingItem";
import { ApartmentEmptyState } from "@/components/apartments/ApartmentEmptyState";
import { ApartmentLocationFilter } from "@/components/apartments/ApartmentLocationFilter";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { RevealList } from "@/components/ui/RevealList";
import {
  filterApartmentsByLocation,
  parseApartmentFilter,
} from "@/lib/apartment-filters";
import { getApartments } from "@/lib/content/apartments";
import { getPageHeaderImage } from "@/lib/page-header-images";
import { buildPageMetadata } from "@/lib/seo";
import { requireLocale } from "@/i18n/locale";

type Props = {
  params: { locale: string };
  searchParams: { location?: string };
};

export async function generateMetadata({ params: { locale } }: Props) {
  const t = await getTranslations({ locale, namespace: "apartments.metadata" });
  return buildPageMetadata({
    locale,
    title: t("title"),
    description: t("description"),
    path: "/apartments",
    absoluteTitle: t("title"),
  });
}

export default async function ApartmentsPage({
  params: { locale },
  searchParams,
}: Props) {
  const lang = requireLocale(locale);
  setRequestLocale(lang);
  const t = await getTranslations("apartments");
  const activeFilter = parseApartmentFilter(searchParams.location);
  const apartments = filterApartmentsByLocation(
    await getApartments(),
    activeFilter,
  );
  const headerImage = getPageHeaderImage("apartments", lang);

  return (
    <main>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
        narrow
        image={headerImage.src}
        imageAlt={headerImage.alt}
      />

      <section className="bg-[#F2EBE0] py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <p className="font-serif italic text-base text-forest-600">{t("filters.label")}</p>
          </Reveal>

          <Suspense fallback={null}>
            <div className="mt-4">
              <ApartmentLocationFilter active={activeFilter} variant="light" />
            </div>
          </Suspense>

          <RevealList className="mt-10 space-y-8" stagger={100}>
            {apartments.length > 0 ? (
              apartments.map((apartment) => (
                <ApartmentListingItem
                  key={apartment.id}
                  apartment={apartment}
                  locale={lang}
                />
              ))
            ) : (
              <ApartmentEmptyState variant="light" />
            )}
          </RevealList>
        </div>
      </section>

      <section className="bg-[#F2EBE0] py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div
              id="inquiry"
              className="card scroll-mt-24 px-6 py-12 text-center sm:px-10"
            >
              <p className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-3xl">
                {t("inquiry.title")}
              </p>
              <p className="mx-auto mt-4 max-w-lg font-sans text-base leading-relaxed text-forest-700">
                {t("inquiry.subtitle")}
              </p>
              <Link href="/contact" className="btn-primary mt-7">
                {t("inquiry.cta")}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
