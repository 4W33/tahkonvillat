import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/motion/RevealText";
import { ClipReveal } from "@/components/motion/ClipReveal";

export async function BrandStory() {
  const t = await getTranslations("home.story");
  const tCommon = await getTranslations("common");
  const storyImage = t("image");

  return (
    <section className="overflow-hidden bg-white py-24 sm:py-32">
      <div className="mx-auto grid max-w-[88rem] gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:gap-20 lg:px-8">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow">{t("eyebrow")}</p>
          <RevealText
            as="h2"
            lines={[t("title")]}
            className="section-title mt-2 text-balance"
          />
          <ClipReveal className="mt-10">
            <div className="image-frame aspect-[4/5] sm:aspect-[3/2] lg:aspect-[4/5]">
              <Image
                src={storyImage}
                alt={t("imageAlt")}
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
          </ClipReveal>
        </div>

        <Reveal delay={120}>
          <div className="flex h-full flex-col justify-center">
            {/* Large opening quote */}
            <span className="font-serif text-[5rem] leading-none text-gold/40 select-none" aria-hidden>&ldquo;</span>
            <p className="-mt-6 font-serif text-[1.65rem] italic leading-snug text-ink sm:text-[2rem] lg:text-[2.1rem]">
              {t("paragraph1")}
            </p>
            <div className="mt-10 space-y-5 font-sans text-[1.05rem] leading-relaxed text-forest-700 sm:text-lg">
              <p>{t("paragraph2")}</p>
              <p>{t("paragraph3")}</p>
            </div>
            {/* Signature feel */}
            <p className="mt-10 font-display text-2xl font-semibold italic text-gold-dark">— {tCommon("brand")}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
