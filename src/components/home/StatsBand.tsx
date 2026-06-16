import { getTranslations } from "next-intl/server";
import { getVillas } from "@/lib/content/villas";
import { getApartments } from "@/lib/content/apartments";
import { Reveal } from "@/components/ui/Reveal";

export async function StatsBand() {
  const t = await getTranslations("home.stats");
  const villas = await getVillas();
  const apartments = await getApartments();
  const all = [...villas, ...apartments];

  const rated = all.filter(
    (p) => p.ratingAverage != null && p.ratingCount != null,
  );
  const totalReviews = rated.reduce((sum, p) => sum + (p.ratingCount ?? 0), 0);
  const weightedAvg =
    totalReviews > 0
      ? rated.reduce((sum, p) => sum + p.ratingAverage! * p.ratingCount!, 0) /
        totalReviews
      : 0;

  const stats = [
    { value: weightedAvg.toFixed(1), star: true, label: t("rating"), color: "#B8955A" },
    { value: totalReviews.toLocaleString("fi-FI"), label: t("reviews"), color: "#4E7787" },
    { value: String(all.length), label: t("homes"), color: "#7E8E5A" },
    { value: "2", label: t("regions"), color: "#A85A43" },
  ];

  return (
    <section className="relative overflow-hidden bg-ink-900 py-16 text-paper sm:py-20">
      {/* Topographic contour graphic */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 1440 420"
        preserveAspectRatio="none"
        aria-hidden
      >
        {Array.from({ length: 8 }, (_, i) => (
          <path
            key={i}
            d={`M0 ${40 + i * 50} C 360 ${10 + i * 50}, 720 ${95 + i * 50}, 1080 ${45 + i * 50} S 1440 ${75 + i * 50}, 1440 ${75 + i * 50}`}
            fill="none"
            stroke={i % 4 === 0 ? "#B8955A" : "#F1ECE1"}
            strokeOpacity={i % 4 === 0 ? 0.14 : 0.06}
            strokeWidth="1.5"
          />
        ))}
      </svg>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <p className="eyebrow text-paper/60">{t("eyebrow")}</p>
        </Reveal>
        <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden border border-paper/15 bg-paper/15 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={stat.label} className="relative bg-ink-900 p-7 sm:p-8">
              <span
                className="absolute left-0 top-0 h-0.5 w-12"
                style={{ backgroundColor: stat.color }}
                aria-hidden
              />
              <Reveal delay={index * 80}>
                <dd className="flex items-baseline gap-1 font-display text-5xl font-black tracking-tightest text-paper sm:text-6xl">
                  {stat.value}
                  {stat.star && (
                    <span style={{ color: stat.color }}>★</span>
                  )}
                </dd>
                <dt className="mt-3 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-paper/60">
                  {stat.label}
                </dt>
              </Reveal>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
