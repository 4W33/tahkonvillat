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
    <section className="border-b border-[color:var(--hairline)] bg-paper py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <p className="eyebrow">{t("eyebrow")}</p>
        </Reveal>
        <ul className="mt-12 grid gap-px overflow-hidden border border-[color:var(--hairline)] bg-[color:var(--hairline)] sm:grid-cols-3">
          {items.map((item, index) => (
            <li key={item.title} className="bg-paper">
              <Reveal delay={index * 100}>
                <div className="flex h-full flex-col p-7 sm:p-8">
                  <span className="index-num">
                    {String(index + 1).padStart(2, "0")} / 03
                  </span>
                  <h2 className="mt-6 font-display text-2xl font-extrabold tracking-tightest text-ink sm:text-[1.6rem]">
                    {item.title}
                  </h2>
                  <p className="mt-3 font-sans text-sm leading-relaxed text-forest-700">
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
