import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { CONTACT_EMAIL } from "@/lib/constants";
import { buildPageMetadata } from "@/lib/seo";
import { requireLocale } from "@/i18n/locale";

const SECTION_KEYS = [
  "controller",
  "dataCollected",
  "purpose",
  "legalBasis",
  "retention",
  "sharing",
  "rights",
  "contact",
] as const;

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: Props) {
  const params = await props.params;

  const {
    locale
  } = params;

  const t = await getTranslations({ locale, namespace: "privacy.metadata" });
  return buildPageMetadata({
    locale,
    title: t("title"),
    description: t("description"),
    path: "/privacy",
    absoluteTitle: t("title"),
  });
}

export default async function PrivacyPage(props: Props) {
  const params = await props.params;

  const {
    locale
  } = params;

  const lang = requireLocale(locale);
  setRequestLocale(lang);
  const t = await getTranslations("privacy");

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
          <div className="space-y-10">
            {SECTION_KEYS.map((key, index) => (
              <Reveal key={key} delay={index * 40}>
                <article className="border-t border-[color:var(--hairline)] pt-6">
                  <span className="index-num">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink sm:text-2xl">
                    {t(`sections.${key}.title`)}
                  </h2>
                  <p className="mt-3 font-sans text-[0.9375rem] leading-relaxed text-forest-700 sm:text-base">
                    {t(`sections.${key}.body`, { email: CONTACT_EMAIL })}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal delay={360}>
            <p className="mt-12 font-mono text-[0.9375rem] uppercase tracking-[0.14em] text-forest-500">
              {t("updatedAt")}
            </p>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
