import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { FaqAccordion } from "@/components/faq/FaqAccordion";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { getFaqItems } from "@/lib/content/faq";
import { buildPageMetadata } from "@/lib/seo";

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
  setRequestLocale(locale);
  const t = await getTranslations("faq");
  const faqItems = await getFaqItems();

  return (
    <main>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
        narrow
      />

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <FaqAccordion
              locale={locale as "fi" | "en"}
              items={faqItems ?? undefined}
            />
          </Reveal>

          <Reveal delay={120}>
          <div className="relative mt-12 overflow-hidden rounded-none bg-ink-900 px-6 py-12 text-center text-paper sm:px-10">
            <div className="grain absolute inset-0 opacity-30" aria-hidden />
            <div className="relative">
              <p className="font-display text-2xl font-extrabold tracking-tightest sm:text-3xl">
                {t("cta.title")}
              </p>
              <p className="mx-auto mt-3 max-w-md font-sans text-sm leading-relaxed text-paper/75 sm:text-base">
                {t("cta.subtitle")}
              </p>
              <Link href="/contact" className="btn-cream mt-7">
                {t("cta.button")}
              </Link>
            </div>
          </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
