import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/ui/Reveal";
import { AmenityIcon } from "@/components/ui/AmenityIcon";
import type { AmenityId } from "@/types/villa";

type Item = {
  key: string;
  label: string;
  color: string;
  amenity?: AmenityId;
  custom?: "lakeside" | "slopes";
};

export async function HighlightsStrip() {
  const t = await getTranslations("home.highlights");
  const tAm = await getTranslations("villas.detail.amenities");

  // Curated natural palette — muted, Nordic, harmonious (not rainbow).
  const items: Item[] = [
    { key: "lakeside", label: t("lakeside"), color: "#4E7787", custom: "lakeside" },
    { key: "slopes", label: t("slopes"), color: "#5E7E8E", custom: "slopes" },
    { key: "sauna", label: tAm("sauna"), color: "#B07A4F", amenity: "sauna" },
    { key: "jacuzzi", label: tAm("jacuzzi"), color: "#3F8C82", amenity: "jacuzzi" },
    { key: "fireplace", label: tAm("fireplace"), color: "#A85A43", amenity: "fireplace" },
    { key: "kitchen", label: tAm("kitchen"), color: "#7E8E5A", amenity: "kitchen" },
    { key: "wifi", label: tAm("wifi"), color: "#B8955A", amenity: "wifi" },
    { key: "parking", label: tAm("parking"), color: "#3F5D4B", amenity: "parking" },
  ];

  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <p className="eyebrow">{t("eyebrow")}</p>
              <h2 className="section-title mt-2">{t("title")}</h2>
            </div>
            <p className="max-w-sm font-sans text-base leading-relaxed text-forest-700">
              {t("subtitle")}
            </p>
          </div>
        </Reveal>

        <ul className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {items.map((item, index) => (
            <li key={item.key} className="group">
              <Reveal delay={(index % 4) * 70}>
                <div className="flex h-full flex-col gap-5 rounded-2xl bg-[#FAF7F3] p-8 transition-shadow duration-300 hover:shadow-lift">
                  <span
                    className="inline-flex h-14 w-14 items-center justify-center transition-transform duration-300 ease-out-expo group-hover:-translate-y-0.5"
                    style={{ backgroundColor: `${item.color}1f`, color: item.color }}
                  >
                    {item.custom === "lakeside" && (
                      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
                        <path d="M3 14c2 0 2.5-1.5 4.5-1.5S10 14 12 14s2.5-1.5 4.5-1.5S19 14 21 14M3 18c2 0 2.5-1.5 4.5-1.5S10 18 12 18s2.5-1.5 4.5-1.5S19 18 21 18" />
                      </svg>
                    )}
                    {item.custom === "slopes" && (
                      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
                        <path d="M12 4 L21 19 H3 Z" fill="currentColor" />
                      </svg>
                    )}
                    {item.amenity && (
                      <AmenityIcon amenity={item.amenity} className="h-6 w-6" />
                    )}
                  </span>
                  <span className="font-display text-xl font-semibold leading-snug text-ink sm:text-[1.35rem]">
                    {item.label}
                  </span>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
