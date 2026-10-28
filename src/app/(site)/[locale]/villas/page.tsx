import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { RevealList } from "@/components/ui/RevealList";
import { VillaCard } from "@/components/villas/VillaCard";
import { getVillas } from "@/lib/content/villas";
import { getPageHeaderImage } from "@/lib/page-header-images";
import { buildPageMetadata } from "@/lib/seo";
import { requireLocale } from "@/i18n/locale";

/** Kausihinnat vanhenevat ajan myötä → uudelleenvalidoi 3 h välein. */
export const revalidate = 10800;

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: Props) {
  const params = await props.params;

  const {
    locale
  } = params;

  const t = await getTranslations({ locale, namespace: "villas.metadata" });

  return buildPageMetadata({
    locale,
    title: t("title"),
    description: t("description"),
    path: "/villas",
    absoluteTitle: t("title"),
  });
}

export default async function VillasPage(props: Props) {
  const params = await props.params;

  const {
    locale
  } = params;

  const lang = requireLocale(locale);
  setRequestLocale(lang);
  const t = await getTranslations("villas");
  const villas = await getVillas();
  const headerImage = getPageHeaderImage("villas", lang);

  return (
    <main className="bg-[#F7F2EA]">
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
        narrow
        image={headerImage.src}
        imageAlt={headerImage.alt}
      >
        <p className="font-sans text-base">
          {t("cityHint")}{" "}
          <Link
            href="/apartments"
            className="font-semibold underline-offset-4 transition-colors hover:underline"
          >
            {t("cityHintLink")}
          </Link>
        </p>
      </PageHeader>

      <section className="bg-[#F2EBE0] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RevealList className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {villas.map((villa) => (
              <VillaCard
                key={villa.slug}
                villa={villa}
                locale={lang}
              />
            ))}
          </RevealList>
        </div>
      </section>
    </main>
  );
}
