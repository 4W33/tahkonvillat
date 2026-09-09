import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { CONTACT_EMAIL } from "@/lib/constants";
import { getPageHeaderImage } from "@/lib/page-header-images";
import { buildPageMetadata } from "@/lib/seo";
import { requireLocale } from "@/i18n/locale";

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params: { locale } }: Props) {
  const t = await getTranslations({ locale, namespace: "checkout.metadata" });
  return buildPageMetadata({
    locale,
    title: t("title"),
    description: t("description"),
    path: "/checkout",
    absoluteTitle: t("title"),
  });
}

function InstructionList({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 space-y-3">
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-3 font-sans text-base leading-relaxed text-forest-700"
        >
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function CheckoutPage({ params: { locale } }: Props) {
  const lang = requireLocale(locale);
  setRequestLocale(lang);
  const t = await getTranslations("checkout");
  const headerImage = getPageHeaderImage("checkout", lang);

  const checkoutSteps = t.raw("checkout.steps") as string[];
  const kitchenSteps = t.raw("cleaning.kitchen.steps") as string[];
  const otherSteps = t.raw("cleaning.other.steps") as string[];
  const outdoorSteps = t.raw("cleaning.outdoor.steps") as string[];

  return (
    <main>
      <PageHeader
        cmsKey="checkout"
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
            <article className="rounded-2xl border border-[color:var(--hairline)] bg-white p-6 sm:p-8">
              <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">
                {t("checkout.title")}
              </h2>
              <InstructionList items={checkoutSteps} />
            </article>
          </Reveal>

          <Reveal delay={80}>
            <article className="mt-8 rounded-2xl border border-[color:var(--hairline)] bg-[#FAF7F3] p-6 sm:p-8">
              <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">
                {t("cleaning.title")}
              </h2>
              <p className="mt-3 font-sans text-base leading-relaxed text-forest-700">
                {t("cleaning.intro")}
              </p>

              <div className="mt-8 space-y-8">
                <div>
                  <h3 className="font-display text-2xl font-semibold text-ink">
                    {t("cleaning.kitchen.title")}
                  </h3>
                  <InstructionList items={kitchenSteps} />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-semibold text-ink">
                    {t("cleaning.other.title")}
                  </h3>
                  <InstructionList items={otherSteps} />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-semibold text-ink">
                    {t("cleaning.outdoor.title")}
                  </h3>
                  <InstructionList items={outdoorSteps} />
                </div>
              </div>

              <p className="mt-8 font-sans text-base leading-relaxed text-forest-700">
                {t("cleaning.note")}
              </p>
            </article>
          </Reveal>

          <Reveal delay={120}>
            <div className="mt-12 overflow-hidden rounded-2xl bg-[#EDE5D8] px-6 py-12 text-center sm:px-10">
              <p className="font-serif italic text-base text-gold-dark">{t("cta.eyebrow")}</p>
              <p className="font-display mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                {t("cta.title")}
              </p>
              <p className="mx-auto mt-3 max-w-md font-sans text-base leading-relaxed text-forest-700">
                {t("cta.subtitle", { email: CONTACT_EMAIL })}
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
