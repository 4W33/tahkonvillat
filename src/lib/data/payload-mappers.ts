import { toIsoDay } from "@/payload/fields/pricing";
import type { Apartment } from "@/types/apartment";
import type { PropertyPricing } from "@/types/pricing";
import type { GuestReview } from "@/types/review";
import type { AmenityId, Villa } from "@/types/villa";

/** Payloadin `locale: 'all'` -dokumentti: lokalisoidut kentät muodossa `{ fi, en }`. */
type Doc = Record<string, unknown>;
type LocaleText = { fi: string; en: string };

function text(value: unknown): LocaleText {
  const v = (value ?? {}) as Partial<Record<"fi" | "en", unknown>>;
  return {
    fi: typeof v.fi === "string" ? v.fi : "",
    en: typeof v.en === "string" ? v.en : "",
  };
}

function mediaUrl(value: unknown): string {
  const url = (value as { url?: unknown } | null)?.url;
  return typeof url === "string" ? url : "";
}

function gallery(value: unknown, cover: string): string[] {
  const urls = Array.isArray(value) ? value.map(mediaUrl).filter(Boolean) : [];
  return urls.length ? urls : cover ? [cover] : [];
}

function paragraphs(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map((row) => (row as { paragraph?: unknown })?.paragraph).filter((p): p is string => typeof p === "string")
    : [];
}

function num(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined;
}

function reviews(value: unknown): GuestReview[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.map((r: Doc) => ({
    comment: String(r.comment ?? ""),
    ...(typeof r.author === "string" && r.author ? { author: r.author } : {}),
    ...(num(r.rating) !== undefined ? { rating: num(r.rating) } : {}),
    ...(typeof r.date === "string" && r.date ? { date: r.date } : {}),
  }));
}

export function toVilla(doc: Doc): Villa {
  const image = mediaUrl(doc.image);
  const long = (doc.longDescription ?? {}) as Partial<Record<"fi" | "en", unknown>>;
  const units = Array.isArray(doc.units) && doc.units.length
    ? doc.units.map((u: Doc) => ({
        id: String(u.unitId),
        name: text(u.name),
        guests: num(u.guests) ?? 0,
        bedrooms: num(u.bedrooms) ?? 0,
      }))
    : undefined;
  return {
    slug: String(doc.slug),
    location: doc.location as Villa["location"],
    guests: num(doc.guests) ?? 0,
    bedrooms: num(doc.bedrooms) ?? 0,
    image,
    gallery: gallery(doc.gallery, image),
    imageAlt: text(doc.imageAlt),
    name: text(doc.name),
    description: text(doc.description),
    longDescription: { fi: paragraphs(long.fi), en: paragraphs(long.en) },
    amenities: (Array.isArray(doc.amenities) ? doc.amenities : []) as AmenityId[],
    ratingAverage: num(doc.ratingAverage),
    ratingCount: num(doc.ratingCount),
    reviews: reviews(doc.reviews),
    units,
  };
}

export function toApartment(doc: Doc): Apartment {
  const image = mediaUrl(doc.image);
  const description = text(doc.description);
  return {
    id: String(doc.apartmentId),
    location: doc.location as Apartment["location"],
    image,
    gallery: gallery(doc.gallery, image),
    imageAlt: text(doc.imageAlt),
    name: text(doc.name),
    area: text(doc.area),
    description: description.fi || description.en ? description : undefined,
    guests: num(doc.guests),
    bedrooms: num(doc.bedrooms),
    ratingAverage: num(doc.ratingAverage),
    ratingCount: num(doc.ratingCount),
    reviews: reviews(doc.reviews),
  };
}

/** `pricing`-ryhmä → PropertyPricing; ei hintoja → null (sivu ei näytä hintaa). */
export function toPricing(group: unknown): PropertyPricing | null {
  const g = (group ?? {}) as Doc;
  const fromPerNight = num(g.fromPerNight);
  const seasons = (Array.isArray(g.seasons) ? g.seasons : []).map((s: Doc) => {
    const start = toIsoDay(s.start) ?? "";
    const label = text(s.label);
    return {
      id: start,
      start,
      end: toIsoDay(s.end) ?? "",
      pricePerNight: num(s.pricePerNight) ?? 0,
      ...(label.fi || label.en ? { label } : {}),
    };
  });
  if (!(fromPerNight && fromPerNight > 0) && seasons.length === 0) return null;
  return {
    ...(fromPerNight !== undefined ? { fromPerNight } : {}),
    currency: "EUR",
    ...(seasons.length ? { seasons } : {}),
  };
}
