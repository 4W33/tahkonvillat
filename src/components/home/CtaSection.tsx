import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { RevealText } from "@/components/motion/RevealText";
import { Magnetic } from "@/components/motion/Magnetic";

export async function CtaSection() {
  const t = await getTranslations("home.cta");

  return (
    <section className="relative overflow-hidden bg-ink-900 py-24 text-paper sm:py-32">
      <div className="grain absolute inset-0 opacity-40" aria-hidden />

      <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <RevealText
          as="h2"
          lines={[t("title")]}
          className="display-xl text-balance text-4xl text-paper sm:text-5xl lg:text-6xl"
        />
        <p className="mx-auto mt-6 max-w-2xl font-sans text-base leading-relaxed text-paper/80 sm:text-lg">
          {t("subtitle")}
        </p>
        <div className="mt-12 flex justify-center">
          <Magnetic>
            <Link href="/contact" className="btn-cream">
              {t("button")}
            </Link>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
