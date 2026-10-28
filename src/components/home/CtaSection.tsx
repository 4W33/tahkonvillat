import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { RevealText } from "@/components/motion/RevealText";
import { Magnetic } from "@/components/motion/Magnetic";

export async function CtaSection() {
  const t = await getTranslations("home.cta");

  return (
    <section className="relative overflow-hidden bg-[#EDE5D8] py-24 sm:py-32">
      {/* Subtle warm grain texture */}
      <div className="grain absolute inset-0 opacity-30" aria-hidden />
      {/* Decorative large italic text in background */}
      <p
        className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-serif italic text-[8rem] font-bold leading-none text-[#C8B89A]/20 sm:text-[12rem] lg:text-[16rem]"
        aria-hidden
      >
        Tahko
      </p>

      <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <p className="font-display italic text-3xl font-semibold text-gold-dark sm:text-4xl">
          Ota yhteyttä
        </p>
        <RevealText
          as="h2"
          lines={[t("title")]}
          className="display-xl mt-3 text-balance text-4xl text-ink sm:text-5xl lg:text-6xl"
        />
        <span
          className="mx-auto mt-7 block h-px w-16 bg-gradient-to-r from-transparent via-gold to-transparent"
          aria-hidden
        />
        <p className="mx-auto mt-7 max-w-2xl font-sans text-lg leading-relaxed text-forest-700 sm:text-xl">
          {t("subtitle")}
        </p>
        <div className="mt-12 flex justify-center">
          <Magnetic>
            <Link href="/contact" className="btn-primary">
              {t("button")}
            </Link>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
