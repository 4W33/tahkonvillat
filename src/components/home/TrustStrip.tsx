import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/ui/Reveal";

const icons = [
  // Sauna / vesi
  <svg key="sauna" viewBox="0 0 48 48" fill="none" className="h-10 w-10" aria-hidden>
    <circle cx="24" cy="24" r="20" fill="#B8955A" fillOpacity="0.12" />
    <path d="M16 30c2.5 0 3-2 5.5-2s3 2 5.5 2 3-2 5.5-2" stroke="#B8955A" strokeWidth="2" strokeLinecap="round"/>
    <path d="M24 14v4M20 16l2 2M28 16l-2 2" stroke="#B8955A" strokeWidth="2" strokeLinecap="round"/>
  </svg>,
  // Vuori / ulkoilu
  <svg key="mountain" viewBox="0 0 48 48" fill="none" className="h-10 w-10" aria-hidden>
    <circle cx="24" cy="24" r="20" fill="#4E7787" fillOpacity="0.12" />
    <path d="M10 34l10-14 6 8 4-5 8 11H10z" stroke="#4E7787" strokeWidth="2" strokeLinejoin="round" fill="none"/>
  </svg>,
  // Avain / henkilökohtainen
  <svg key="key" viewBox="0 0 48 48" fill="none" className="h-10 w-10" aria-hidden>
    <circle cx="24" cy="24" r="20" fill="#7E8E5A" fillOpacity="0.12" />
    <circle cx="21" cy="22" r="5" stroke="#7E8E5A" strokeWidth="2"/>
    <path d="M25 26l8 8M30 31l2 2" stroke="#7E8E5A" strokeWidth="2" strokeLinecap="round"/>
  </svg>,
];

export async function TrustStrip() {
  const t = await getTranslations("home.trust");

  const items = [
    { title: t("item1Title"), text: t("item1Text"), icon: icons[0] },
    { title: t("item2Title"), text: t("item2Text"), icon: icons[1] },
    { title: t("item3Title"), text: t("item3Text"), icon: icons[2] },
  ];

  return (
    <section className="bg-[#F7F2EA] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <p className="eyebrow">{t("eyebrow")}</p>
        </Reveal>
        <ul className="mt-12 grid gap-6 sm:grid-cols-3">
          {items.map((item, index) => (
            <li key={item.title}>
              <Reveal delay={index * 100}>
                <div className="flex h-full flex-col rounded-2xl bg-white p-8 shadow-soft sm:p-10">
                  <div className="mb-6">{item.icon}</div>
                  <h2 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-[2rem]">
                    {item.title}
                  </h2>
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
