import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { RevealText } from "@/components/motion/RevealText";
import { ClipReveal } from "@/components/motion/ClipReveal";
import { Magnetic } from "@/components/motion/Magnetic";
import { WindButton } from "@/components/ui/WindButton";

export async function Hero() {
  const t = await getTranslations("home.hero");
  const heroImage = t("image");
  const title = t("title");
  const lines = title.includes(",")
    ? [title.slice(0, title.indexOf(",") + 1), title.slice(title.indexOf(",") + 1).trim()]
    : [title];

  return (
    <section className="relative flex min-h-[95vh] flex-col justify-end overflow-hidden bg-neutral-900 text-paper">
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
      {/* Extra darkening on mobile for text legibility */}
      <div className="absolute inset-0 bg-black/35 sm:hidden" aria-hidden />

      {/* One cohesive content block, bottom-left. */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-28 pt-32 sm:px-6 sm:pb-32 sm:pt-36 lg:px-8 lg:pb-36">
        <p className="font-display text-2xl italic font-semibold text-paper/90 sm:text-3xl">
          {t("eyebrow")}
        </p>
        <RevealText
          as="h1"
          lines={lines}
          className="display-xl mt-5 max-w-4xl text-[2.8rem] text-paper sm:text-6xl lg:text-[5.2rem]"
          delay={250}
        />
        <p className="mt-8 max-w-2xl font-sans text-lg leading-relaxed text-paper/90 sm:text-xl">
          {t("subtitle")}
        </p>
        <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
          <WindButton href="/villas" variant="light" className="w-full sm:w-auto">
            {t("cta")}
          </WindButton>
          <Magnetic className="block w-full sm:inline-block sm:w-auto">
            <Link
              href="/contact"
              className="btn-ghost-light w-full whitespace-nowrap !border-[1.5px] !border-white/60 !px-[1.3rem] !py-[0.7rem] !text-[0.95rem] !leading-[1.5] hover:!bg-white/10 hover:!text-paper sm:w-auto sm:!px-[2.6rem] sm:!py-[0.7rem] sm:!text-lg sm:!leading-[1.5]"
            >
              {t("ctaSecondary")}
            </Link>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
