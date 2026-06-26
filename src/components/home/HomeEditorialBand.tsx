import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { RevealText } from "@/components/motion/RevealText";
import { ClipReveal } from "@/components/motion/ClipReveal";
import { Magnetic } from "@/components/motion/Magnetic";

export async function HomeEditorialBand() {
  const t = await getTranslations("home.editorial");
  const editorialImage = t("image");

  return (
    <section className="relative min-h-[80vh] overflow-hidden bg-neutral-900 text-paper">
      <ClipReveal className="absolute inset-0">
        <Image
          src={editorialImage}
          alt={t("imageAlt")}
          fill
          sizes="100vw"
          className="object-cover"
        />
      </ClipReveal>
      <div
        className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-[80vh] max-w-7xl flex-col justify-center px-4 py-20 sm:px-6 lg:px-8">
        <p className="eyebrow text-paper/70">{t("eyebrow")}</p>
        <RevealText
          as="h2"
          lines={[t("title")]}
          className="display-xl mt-6 max-w-2xl text-4xl text-paper sm:text-5xl lg:text-6xl"
        />
        <p className="mt-6 max-w-lg font-sans text-base leading-relaxed text-paper/85 sm:text-lg">
          {t("subtitle")}
        </p>
        <div className="mt-10">
          <Magnetic>
            <Link href="/villas" className="btn-cream">
              {t("cta")}
            </Link>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
