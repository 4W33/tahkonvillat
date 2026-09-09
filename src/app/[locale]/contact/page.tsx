import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactForm } from "@/components/contact/ContactForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { CONTACT_EMAIL } from "@/lib/constants";
import { getPageHeaderImage } from "@/lib/page-header-images";
import { buildPageMetadata } from "@/lib/seo";
import { requireLocale } from "@/i18n/locale";

type Props = {
  params: { locale: string };
  searchParams: { topic?: string; property?: string };
};

export async function generateMetadata({ params: { locale } }: Props) {
  const t = await getTranslations({ locale, namespace: "contact.metadata" });
  return buildPageMetadata({
    locale,
    title: t("title"),
    description: t("description"),
    path: "/contact",
    absoluteTitle: t("title"),
  });
}

export default async function ContactPage({
  params: { locale },
  searchParams,
}: Props) {
  const lang = requireLocale(locale);
  setRequestLocale(lang);
  const t = await getTranslations("contact");

  const initialTopic =
    searchParams.topic === "apartment" ||
    searchParams.topic === "villa" ||
    searchParams.topic === "general"
      ? searchParams.topic
      : undefined;

  let initialMessage: string | undefined;
  if (searchParams.property && initialTopic === "apartment") {
    initialMessage = t("form.prefillApartment", {
      property: searchParams.property,
    });
  }
  const headerImage = getPageHeaderImage("contact", lang);

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
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8">
          <Reveal>
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              {t("info.title")}
            </h2>
            <p className="mt-5 font-sans text-sm leading-relaxed text-forest-700 sm:text-base">
              {t("info.description")}
            </p>

            <dl className="mt-10 space-y-8">
              <div>
                <dt className="label-field">{t("info.emailLabel")}</dt>
                <dd className="mt-3">
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="font-sans text-base text-forest transition-opacity hover:opacity-75"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="label-field">{t("info.responseLabel")}</dt>
                <dd className="mt-3 font-sans text-base text-forest-700">
                  {t("info.response")}
                </dd>
              </div>
              <div>
                <dt className="label-field">{t("info.bookingLabel")}</dt>
                <dd className="mt-3 font-sans text-base text-forest-700">
                  {t("info.booking")}
                </dd>
              </div>
            </dl>
          </div>
          </Reveal>

          <Reveal delay={120}>
          <ContactForm
            locale={lang}
            initialTopic={initialTopic}
            initialMessage={initialMessage}
          />
          </Reveal>
        </div>
      </section>
    </main>
  );
}
