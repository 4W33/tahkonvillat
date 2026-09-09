import type { PriceSeason, PropertyPricing } from "@/types/pricing";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function todayIso(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** Kaudet, joiden loppupäivä ei ole vielä mennyt, alkupäivän mukaan. */
export function getUpcomingSeasons(pricing: PropertyPricing, today: string): PriceSeason[] {
  return (pricing.seasons ?? [])
    .filter((s) => s.end >= today)
    .sort((a, b) => a.start.localeCompare(b.start));
}

export function hasAnyPrice(pricing: PropertyPricing): boolean {
  const base = pricing.fromPerNight ?? 0;
  return base > 0 || (pricing.seasons?.length ?? 0) > 0;
}

/** "alkaen"-hinta = pienin perushinnasta ja tulevista kausihinnoista. */
export function getDisplayFromPrice(
  pricing: PropertyPricing | null,
  today: string,
): number | null {
  if (!pricing) return null;
  const candidates: number[] = [];
  if ((pricing.fromPerNight ?? 0) > 0) candidates.push(pricing.fromPerNight as number);
  for (const season of getUpcomingSeasons(pricing, today)) {
    if (season.pricePerNight > 0) candidates.push(season.pricePerNight);
  }
  return candidates.length ? Math.min(...candidates) : null;
}

/** Palauttaa suomenkielisen virheviestin tai null. */
export function validateSeasons(seasons: unknown): string | null {
  if (seasons == null) return null;
  if (!Array.isArray(seasons)) return "Kaudet: odotettiin listaa";

  const items = seasons as Partial<PriceSeason>[];
  for (let index = 0; index < items.length; index += 1) {
    const s = items[index];
    const n = index + 1;
    if (
      typeof s.start !== "string" ||
      !ISO_DATE.test(s.start) ||
      typeof s.end !== "string" ||
      !ISO_DATE.test(s.end)
    ) {
      return `Kausi ${n}: päivämäärän pitää olla muotoa VVVV-KK-PP`;
    }
    if (s.end < s.start) return `Kausi ${n}: loppupäivä ei voi olla ennen alkupäivää`;
    if (
      typeof s.pricePerNight !== "number" ||
      !Number.isFinite(s.pricePerNight) ||
      s.pricePerNight <= 0
    ) {
      return `Kausi ${n}: hinta pitää olla suurempi kuin 0`;
    }
  }

  const sorted = [...(items as PriceSeason[])].sort((a, b) => a.start.localeCompare(b.start));
  for (let i = 1; i < sorted.length; i += 1) {
    if (sorted[i].start <= sorted[i - 1].end) {
      return `Kaudet ovat päällekkäin: ${sorted[i - 1].start}–${sorted[i - 1].end} ja ${sorted[i].start}–${sorted[i].end}`;
    }
  }
  return null;
}

export function formatSeasonRange(start: string, end: string, locale: string): string {
  const formatter = new Intl.DateTimeFormat(locale === "fi" ? "fi-FI" : "en-GB", {
    day: "numeric",
    month: locale === "fi" ? "numeric" : "short",
    year: "numeric",
    timeZone: "UTC",
  });
  return formatter.formatRange(new Date(`${start}T00:00:00Z`), new Date(`${end}T00:00:00Z`));
}
