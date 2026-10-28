// Vanhan CMS:n data → Payload. Idempotentti: ajo uudestaan päivittää, ei luo kaksoiskappaleita.
// Lähde: data/blob-export/ (tuotannon export, `npm run cms:export-blob`) jos olemassa, muuten repon data/.
// Käyttö: npm run cms:seed
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import type { Payload, Where } from "payload";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const ROOT = process.cwd();
const EXPORT = path.join(ROOT, "data", "blob-export");
const context = { disableRevalidate: true };

type Json = Record<string, any>;
type Text = { fi: string; en: string };
// Julkaisun jälkeen asiakkaan muokkaukset ovat Payloadissa: olemassa olevat kohteet päivitetään vain --force-lipulla.
const FORCE = process.argv.includes("--force");
const stats: Record<string, { created: number; updated: number; skipped: number }> = {};
const bump = (kind: string, created: boolean | "skipped") => {
  stats[kind] ??= { created: 0, updated: 0, skipped: 0 };
  stats[kind][created === "skipped" ? "skipped" : created ? "created" : "updated"] += 1;
};

function readJson(rel: string): { data: any; fromExport: boolean } | null {
  const exported = path.join(EXPORT, "store", rel);
  if (existsSync(exported)) return { data: JSON.parse(readFileSync(exported, "utf-8")), fromExport: true };
  const local = path.join(ROOT, rel);
  if (existsSync(local)) return { data: JSON.parse(readFileSync(local, "utf-8")), fromExport: false };
  return null;
}

/** /images/... → public/, /api/media/properties/... → blob-export/media/properties/. */
function imageFile(url: string): string | null {
  const file = url.startsWith("/images/")
    ? path.join(ROOT, "public", url)
    : url.startsWith("/api/media/")
      ? path.join(EXPORT, "media", url.slice("/api/media/".length))
      : null;
  return file && existsSync(file) ? file : null;
}

const MIME: Record<string, string> = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".avif": "image/avif" };
const missingImages: string[] = [];
const mediaIds = new Map<string, number | string>();

async function ensureMedia(payload: Payload, url: string | undefined, alt: Text): Promise<number | string | undefined> {
  if (!url) return undefined;
  if (mediaIds.has(url)) return mediaIds.get(url);
  const file = imageFile(url);
  if (!file) {
    missingImages.push(url);
    return undefined;
  }
  // villa-puolukka/01.jpg → villa-puolukka-01.jpg (sama nimi eri kohteissa)
  const filename = url.split("/properties/")[1]?.replaceAll("/", "-") ?? path.basename(file);
  const altFi = alt.fi || alt.en || filename;
  const existing = await payload.find({ collection: "media", where: { filename: { equals: filename } }, limit: 1, depth: 0 });
  let id = existing.docs[0]?.id;
  if (id) {
    await payload.update({ collection: "media", id, data: { alt: altFi }, locale: "fi", context });
  } else {
    const doc = await payload.create({
      collection: "media",
      data: { alt: altFi },
      locale: "fi",
      context,
      file: { data: readFileSync(file), mimetype: MIME[path.extname(file).toLowerCase()] ?? "image/jpeg", name: filename, size: statSync(file).size },
    });
    id = doc.id;
  }
  if (alt.en) await payload.update({ collection: "media", id, data: { alt: alt.en }, locale: "en", context });
  bump("kuvat", !existing.docs[0]);
  mediaIds.set(url, id);
  return id;
}

const isoNoon = (day: string) => `${day}T12:00:00.000Z`;

function pricingData(entry: Json | undefined, locale: "fi" | "en", rows?: Json[]) {
  if (!entry) return undefined;
  return {
    fromPerNight: entry.fromPerNight,
    seasons: (entry.seasons ?? []).map((s: Json, i: number) => ({
      ...(rows?.[i] ? { id: rows[i].id } : {}),
      start: isoNoon(s.start),
      end: isoNoon(s.end),
      pricePerNight: s.pricePerNight,
      label: s.label?.[locale],
    })),
  };
}

/** Lokalisoitu upsert: luonti/päivitys suomeksi, sitten englanti samoille taulukkoriveille (rivien id:t säilyvät). */
async function upsertLocalized(
  payload: Payload,
  collection: "villas" | "apartments",
  key: "slug" | "apartmentId",
  fi: Json,
  toEn: (doc: Json) => Json,
): Promise<boolean> {
  const existing = await payload.find({ collection, where: { [key]: { equals: fi[key] } }, limit: 1, depth: 0 });
  const prev = existing.docs[0];
  if (prev && !FORCE) {
    bump(collection === "villas" ? "villat" : "asunnot", "skipped");
    return false;
  }
  const doc = prev
    ? await payload.update({ collection, id: prev.id, data: fi as never, locale: "fi", context })
    : await payload.create({ collection, data: fi as never, locale: "fi", context });
  await payload.update({ collection, id: doc.id, data: toEn(doc as Json) as never, locale: "en", context });
  bump(collection === "villas" ? "villat" : "asunnot", !prev);
  return true;
}

async function seedVillas(payload: Payload, villaSlugs: readonly string[], pricing: Json, sources: Json) {
  let links = 0;
  for (const slug of villaSlugs) {
    const record = readJson(`data/content/${slug}.json`)?.data as Json | undefined;
    if (!record) continue;
    const image = await ensureMedia(payload, record.image, record.imageAlt);
    const gallery = [];
    for (const url of record.gallery ?? []) {
      const id = await ensureMedia(payload, url, record.imageAlt);
      if (id) gallery.push(id);
    }
    const units = (record.units ?? []) as Json[];
    const icalUrl = sources[slug]?.url;
    const fi = {
      slug,
      location: record.location,
      guests: record.guests,
      bedrooms: record.bedrooms,
      name: record.name.fi,
      description: record.description?.fi,
      imageAlt: record.imageAlt?.fi,
      longDescription: (record.longDescription?.fi ?? []).map((paragraph: string) => ({ paragraph })),
      image,
      gallery,
      amenities: record.amenities,
      ratingAverage: record.ratingAverage,
      ratingCount: record.ratingCount,
      reviews: record.reviews,
      icalUrl,
      units: units.map((u) => ({
        unitId: u.id,
        name: u.name?.fi,
        guests: u.guests,
        bedrooms: u.bedrooms,
        icalUrl: sources[`${slug}:${u.id}`]?.url,
      })),
      pricing: pricingData(pricing[slug], "fi"),
      syncedAt: record.syncedAt,
    };
    const written = await upsertLocalized(payload, "villas", "slug", fi, (doc) => ({
      name: record.name.en,
      description: record.description?.en,
      imageAlt: record.imageAlt?.en,
      longDescription: (record.longDescription?.en ?? []).map((paragraph: string) => ({ paragraph })),
      units: (doc.units ?? []).map((row: Json, i: number) => ({ ...row, name: units[i]?.name?.en })),
      pricing: pricingData(pricing[slug], "en", doc.pricing?.seasons),
    }));
    if (written) links += (icalUrl ? 1 : 0) + units.filter((u) => sources[`${slug}:${u.id}`]?.url).length;
  }
  console.log(`iCal-linkkejä kytketty: ${links}`);
}

async function seedApartments(payload: Payload, ids: readonly string[], pricing: Json) {
  for (const apartmentId of ids) {
    const record = readJson(`data/content/apartment-${apartmentId}.json`)?.data as Json | undefined;
    if (!record) continue;
    const image = await ensureMedia(payload, record.image, record.imageAlt);
    const gallery = [];
    for (const url of record.gallery ?? []) {
      const id = await ensureMedia(payload, url, record.imageAlt);
      if (id) gallery.push(id);
    }
    const fi = {
      apartmentId,
      location: record.location,
      name: record.name.fi,
      area: record.area?.fi,
      description: record.description?.fi,
      imageAlt: record.imageAlt?.fi,
      guests: record.guests,
      bedrooms: record.bedrooms,
      image,
      gallery,
      ratingAverage: record.ratingAverage,
      ratingCount: record.ratingCount,
      reviews: record.reviews,
      pricing: pricingData(pricing[apartmentId], "fi"),
      syncedAt: record.syncedAt,
    };
    await upsertLocalized(payload, "apartments", "apartmentId", fi, (doc) => ({
      name: record.name.en,
      area: record.area?.en,
      description: record.description?.en,
      imageAlt: record.imageAlt?.en,
      pricing: pricingData(pricing[apartmentId], "en", doc.pricing?.seasons),
    }));
  }
}

async function seedReservations(payload: Payload) {
  const items = (readJson("data/reservations.json")?.data ?? []) as Json[];
  for (const r of items) {
    const where: Where = {
      and: [
        { calendarKey: { equals: r.propertySlug } },
        { startDate: { equals: isoNoon(r.startDate) } },
        { endDate: { equals: isoNoon(r.endDate) } },
      ],
    };
    const prev = (await payload.find({ collection: "reservations", where, limit: 1, depth: 0 })).docs[0];
    const data = { calendarKey: r.propertySlug, startDate: isoNoon(r.startDate), endDate: isoNoon(r.endDate), guestName: r.guestName };
    if (prev) await payload.update({ collection: "reservations", id: prev.id, data, context });
    else await payload.create({ collection: "reservations", data, context });
    bump("varaukset", !prev);
  }
}

async function seedMessages(payload: Payload, collection: "contacts" | "inquiries", file: string, label: string) {
  const items = (readJson(file)?.data ?? []) as Json[];
  for (const m of items) {
    const where: Where = { and: [{ email: { equals: m.email } }, { createdAt: { equals: m.createdAt } }] };
    const prev = (await payload.find({ collection, where, limit: 1, depth: 0 })).docs[0];
    if (prev) {
      bump(label, false);
      continue;
    }
    const { id: _legacyId, notified, ...rest } = m;
    const data = { ...rest, notified: notified === true ? "sent" : notified === false ? "failed" : "off" };
    await payload.create({ collection, data: data as never, context });
    bump(label, true);
  }
}

/** Vain tuotannon exportista: repon data/content/messages on vanha dev-kopio. Vain oletuksesta poikkeavat arvot. */
async function seedSiteTexts(payload: Payload, sections: readonly string[], slugOf: (s: string) => string) {
  const isObject = (v: unknown): v is Json => Boolean(v) && typeof v === "object" && !Array.isArray(v);
  const diff = (stored: Json, bundled: Json | undefined): Json => {
    const out: Json = {};
    for (const [k, v] of Object.entries(stored)) {
      if (isObject(v)) {
        const d = diff(v, isObject(bundled?.[k]) ? bundled[k] : undefined);
        if (Object.keys(d).length) out[k] = d;
      } else if (JSON.stringify(v) !== JSON.stringify(bundled?.[k])) out[k] = v;
    }
    return out;
  };
  const toGlobal = async (tree: Json, full: Json): Promise<Json> => {
    const out: Json = {};
    for (const [k, v] of Object.entries(tree)) {
      if (k === "image" && typeof v === "string") {
        const alt = String(full.imageAlt ?? "");
        out[k] = await ensureMedia(payload, v, { fi: alt, en: alt });
      } else if (Array.isArray(v)) out[k] = v.map((value) => ({ value }));
      else if (isObject(v)) out[k] = await toGlobal(v, full[k] ?? {});
      else out[k] = v;
    }
    return out;
  };
  for (const locale of ["fi", "en"] as const) {
    const exported = path.join(EXPORT, "store", "data", "content", "messages", `${locale}.json`);
    if (!existsSync(exported)) continue;
    const stored = JSON.parse(readFileSync(exported, "utf-8")) as Json;
    const bundled = JSON.parse(readFileSync(path.join(ROOT, "messages", `${locale}.json`), "utf-8")) as Json;
    for (const section of sections) {
      const changed = diff(stored[section] ?? {}, bundled[section]);
      if (!Object.keys(changed).length) continue;
      await payload.updateGlobal({ slug: slugOf(section) as never, locale, data: (await toGlobal(changed, stored[section])) as never, context });
      bump("tekstiosiot", false);
    }
  }
}

const { getPayload } = await import("payload");
const { default: config } = await import("../src/payload.config");
const { siteConfig } = await import("../src/lib/site.config");
const { SITE_TEXT_SECTIONS, siteTextSlug } = await import("../src/payload/globals/SiteTexts");
const payload = await getPayload({ config });

const pricing = (readJson("data/pricing.json")?.data ?? {}) as Json;
const sources = (readJson("data/ical-sources.json")?.data ?? {}) as Json;
console.log(existsSync(EXPORT) ? "Lähde: data/blob-export (tuotanto)" : "Lähde: repon data/ (ei tuotannon exporttia)");

await seedVillas(payload, siteConfig.properties.villaSlugs, pricing, sources);
await seedApartments(payload, siteConfig.properties.apartmentIds, pricing);
await seedReservations(payload);
await seedMessages(payload, "contacts", "data/contacts.json", "yhteydenotot");
await seedMessages(payload, "inquiries", "data/inquiries.json", "tiedustelut");
await seedSiteTexts(payload, SITE_TEXT_SECTIONS, siteTextSlug);

console.table(stats);
if (missingImages.length) console.warn(`Kuvatiedosto puuttuu (${missingImages.length}):`, missingImages);
process.exit(0);
