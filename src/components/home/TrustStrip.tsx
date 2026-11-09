import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/ui/Reveal";

export async function TrustStrip() {
  const t = await getTranslations("home.trust");

  const items = [
    { title: t("item1Title"), text: t("item1Text") },
    { title: t("item2Title"), text: t("item2Text") },
    { title: t("item3Title"), text: t("item3Text") },
  ];

  return (
    <section className="bg-[#F7F2EA] py-20 sm:py-28">
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="section-title">{t("eyebrow")}</h2>
        </Reveal>
        <ul className="mt-12 grid gap-6 sm:grid-cols-3">
          {items.map((item, index) => (
            <li key={item.title}>
              <Reveal delay={index * 100}>
                <div className="flex h-full flex-col rounded-2xl bg-white p-8 shadow-soft sm:p-10">
                  <p className="mb-6 font-display text-5xl italic leading-none text-gold" aria-hidden>
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-[2rem]">
                    {item.title}
                  </h3>
                  <p className="mt-4 font-sans text-base leading-relaxed text-forest-700 sm:text-[1.05rem]">
                    {item.text}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
