import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { RevealText } from "@/components/motion/RevealText";
import { ClipReveal } from "@/components/motion/ClipReveal";
import { Magnetic } from "@/components/motion/Magnetic";

export async function Hero() {
  const t = await getTranslations("home.hero");
  const heroImage = t("image");
  const title = t("title");
  const lines = title.includes(",")
    ? [title.slice(0, title.indexOf(",") + 1), title.slice(title.indexOf(",") + 1).trim()]
    : [title];

  return (
    <section className="relative flex min-h-[90vh] flex-col justify-end overflow-hidden bg-neutral-900 text-paper">
      <ClipReveal immediate className="absolute inset-0">
        <Image
          src={heroImage}
          alt={t("imageAlt")}
          fill
          priority
          sizes="100vw"
          className="object-cover animate-hero-zoom"
        />
      </ClipReveal>

      {/* Neutral legibility scrim — kept subtle so the photo stays clean. */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-transparent"
        aria-hidden
      />

      {/* One cohesive content block, bottom-left. */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-20 pt-32 sm:px-6 sm:pb-24 lg:px-8">
        <p className="font-mono text-[0.72rem] uppercase tracking-[0.28em] text-paper/75">
          {t("eyebrow")}
        </p>
        <RevealText
          as="h1"
          lines={lines}
          className="display-xl mt-6 max-w-4xl text-[2.6rem] text-paper sm:text-6xl lg:text-[5rem]"
          delay={250}
        />
        <p className="mt-7 max-w-xl font-sans text-base leading-relaxed text-paper/85 sm:text-lg">
          {t("subtitle")}
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Magnetic>
            <Link href="/villas" className="btn-cream">
              {t("cta")}
            </Link>
          </Magnetic>
          <Magnetic>
            <Link href="/contact" className="btn-ghost-light">
              {t("ctaSecondary")}
            </Link>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
