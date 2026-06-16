import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/motion/RevealText";
import { ClipReveal } from "@/components/motion/ClipReveal";

export async function BrandStory() {
  const t = await getTranslations("home.story");
  const storyImage = t("image");

  return (
    <section className="overflow-hidden bg-paper py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:gap-20 lg:px-8">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow">{t("eyebrow")}</p>
          <RevealText
            as="h2"
            lines={[t("title")]}
            className="section-title mt-6 text-balance"
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
            <p className="font-serif text-2xl italic leading-snug text-ink sm:text-3xl">
              {t("paragraph1")}
            </p>
            <div className="mt-8 space-y-5 font-sans text-base leading-relaxed text-forest-700 sm:text-[1.05rem]">
              <p>{t("paragraph2")}</p>
              <p>{t("paragraph3")}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
