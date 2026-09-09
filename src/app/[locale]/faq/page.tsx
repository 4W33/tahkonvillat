import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { FaqAccordion } from "@/components/faq/FaqAccordion";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { getFaqItems } from "@/lib/content/faq";
import { getPageHeaderImage } from "@/lib/page-header-images";
import { buildPageMetadata } from "@/lib/seo";
import { requireLocale } from "@/i18n/locale";

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params: { locale } }: Props) {
  const t = await getTranslations({ locale, namespace: "faq.metadata" });
  return buildPageMetadata({
    locale,
    title: t("title"),
    description: t("description"),
    path: "/faq",
    absoluteTitle: t("title"),
  });
}

export default async function FaqPage({ params: { locale } }: Props) {
  const lang = requireLocale(locale);
  setRequestLocale(lang);
  const t = await getTranslations("faq");
  const faqItems = await getFaqItems();
  const headerImage = getPageHeaderImage("faq", lang);

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

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <FaqAccordion
              locale={lang}
              items={faqItems ?? undefined}
            />
          </Reveal>

          <Reveal delay={120}>
          <div className="mt-12 overflow-hidden rounded-2xl bg-[#EDE5D8] px-6 py-12 text-center sm:px-10">
            <p className="font-serif italic text-base text-gold-dark">Ota yhteyttä</p>
            <p className="font-display mt-3 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {t("cta.title")}
            </p>
            <p className="mx-auto mt-3 max-w-md font-sans text-base leading-relaxed text-forest-700">
              {t("cta.subtitle")}
            </p>
            <Link href="/contact" className="btn-primary mt-7">
              {t("cta.button")}
            </Link>
          </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
