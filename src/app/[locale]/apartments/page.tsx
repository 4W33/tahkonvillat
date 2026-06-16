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
import { buildPageMetadata } from "@/lib/seo";

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
  setRequestLocale(locale);
  const t = await getTranslations("apartments");
  const activeFilter = parseApartmentFilter(searchParams.location);
  const apartments = filterApartmentsByLocation(
    await getApartments(),
    activeFilter,
  );

  return (
    <main>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
        narrow
      />

      <section className="relative overflow-hidden bg-ink-900 py-14 text-paper sm:py-20">
        <div className="grain absolute inset-0 opacity-30" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <p className="mono-label text-paper/50">{t("filters.label")}</p>
          </Reveal>

          <Suspense fallback={null}>
            <div className="mt-4">
              <ApartmentLocationFilter active={activeFilter} variant="dark" />
            </div>
          </Suspense>

          <RevealList className="mt-10 space-y-8" stagger={100}>
            {apartments.length > 0 ? (
              apartments.map((apartment) => (
                <ApartmentListingItem
                  key={apartment.id}
                  apartment={apartment}
                  locale={locale as "fi" | "en"}
                />
              ))
            ) : (
              <ApartmentEmptyState variant="dark" />
            )}
          </RevealList>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div
              id="inquiry"
              className="card scroll-mt-24 px-6 py-12 text-center sm:px-10"
            >
              <p className="font-display text-2xl font-extrabold tracking-tightest text-ink sm:text-3xl">
                {t("inquiry.title")}
              </p>
              <p className="mx-auto mt-4 max-w-lg font-sans text-sm leading-relaxed text-forest-700 sm:text-base">
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
