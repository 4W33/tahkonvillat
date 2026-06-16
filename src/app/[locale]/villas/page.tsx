import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { RevealList } from "@/components/ui/RevealList";
import { VillaCard } from "@/components/villas/VillaCard";
import { getVillas } from "@/lib/content/villas";
import { buildPageMetadata } from "@/lib/seo";

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params: { locale } }: Props) {
  const t = await getTranslations({ locale, namespace: "villas.metadata" });

  return buildPageMetadata({
    locale,
    title: t("title"),
    description: t("description"),
    path: "/villas",
    absoluteTitle: t("title"),
  });
}

export default async function VillasPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const t = await getTranslations("villas");
  const villas = await getVillas();

  return (
    <main>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
        narrow
      >
        <p className="font-sans text-sm text-forest-500">
          {t("cityHint")}{" "}
          <Link
            href="/apartments"
            className="font-semibold text-forest underline-offset-4 transition-colors hover:underline"
          >
            {t("cityHintLink")}
          </Link>
        </p>
      </PageHeader>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RevealList className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {villas.map((villa) => (
              <VillaCard
                key={villa.slug}
                villa={villa}
                locale={locale as "fi" | "en"}
              />
            ))}
          </RevealList>
        </div>
      </section>
    </main>
  );
}
