import { promises as fs } from "fs";
import path from "path";
import { parseAirbnbReviews } from "./lib/parse-reviews.mjs";

const AIRBNB_DIR = path.join(process.cwd(), "data", "airbnb");
const CONTENT_DIR = path.join(process.cwd(), "data", "content");
const PUBLIC_DIR = path.join(process.cwd(), "public", "images", "properties");

const VILLA_MAP = {
  "villa-puolukka": ["24085153"],
  "villa-karpalo": ["1217947670762444308"],
  "tahkon-teituli": ["47068801", "47064939", "46923155", "47002130"],
};

const APARTMENT_MAP = {
  "vantaa-1": "32621290",
  "vantaa-2": "32665560",
  "vantaa-3": "32721246",
  "vantaa-4": "36108291",
  "helsinki-1": "18682338",
};

const APARTMENT_NAMES = {
  "vantaa-1": {
    fi: "Flamingo Luxury — sauna & parveke",
    en: "Flamingo Luxury — sauna & balcony",
  },
  "vantaa-2": {
    fi: "Ylellinen 2 mh — sauna & parveke",
    en: "Premium 2-bed — sauna & balcony",
  },
  "vantaa-3": {
    fi: "Flamingo / Airport Luxury",
    en: "Flamingo / Airport Luxury",
  },
  "vantaa-4": {
    fi: "Lentokenttä — ilmainen pysäköinti",
    en: "Airport — free parking on site",
  },
  "helsinki-1": {
    fi: "Helsinki — näköala & sauna",
    en: "Helsinki — view & sauna",
  },
};

const MAX_GALLERY = 18;
const MAX_REVIEWS = 20;

async function readListing(id) {
  const file = path.join(AIRBNB_DIR, `${id}.json`);
  return JSON.parse(await fs.readFile(file, "utf-8"));
}

function extFromUrl(url) {
  const base = url.split("?")[0];
  if (base.endsWith(".png")) return "png";
  if (base.endsWith(".webp")) return "webp";
  return "jpg";
}

async function downloadImage(url, dest) {
  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(dest, buffer);
}

async function downloadGallery(slug, imageUrls) {
  const dir = path.join(PUBLIC_DIR, slug);
  await fs.mkdir(dir, { recursive: true });

  const localPaths = [];
  const unique = [...new Set(imageUrls)].slice(0, MAX_GALLERY);

  for (let i = 0; i < unique.length; i++) {
    const url = unique[i];
    const ext = extFromUrl(url);
    const filename = `${String(i + 1).padStart(2, "0")}.${ext}`;
    const dest = path.join(dir, filename);
    const publicPath = `/images/properties/${slug}/${filename}`;

    try {
      if (!(await fileExists(dest))) {
        await downloadImage(url, dest);
      }
      localPaths.push(publicPath);
      console.log(`  saved ${publicPath}`);
    } catch (error) {
      console.warn(`  skip image ${i + 1}: ${error.message}`);
    }
  }

  return localPaths;
}

async function fileExists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

function splitParagraphs(text) {
  return text
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);
}

async function buildVillaContent(slug, listingIds) {
  const listings = await Promise.all(listingIds.map(readListing));
  const primary = listings[0];

  const allImages = listings.flatMap((l) => l.images.map((img) => img.url));
  const allReviews = listings.flatMap((l) => l.reviews || []);
  const gallery = await downloadGallery(slug, allImages);

  const content = {
    slug,
    location: "tahko",
    guests: Math.max(...listings.map((l) => l.stats.guests || 0)),
    bedrooms: Math.max(...listings.map((l) => l.stats.bedrooms || 0)),
    image: gallery[0] || "",
    gallery: gallery.length ? gallery : [""],
    imageAlt: {
      fi: listings.find((l) => l.images[0]?.alt)?.images[0]?.alt || primary.title,
      en: listings.find((l) => l.images[0]?.alt)?.images[0]?.alt || primary.title,
    },
    name: {
      fi:
        slug === "tahkon-teituli"
          ? "Tahkon Teituli"
          : slug === "villa-puolukka"
            ? "Villa Puolukka"
            : "Villa Karpalo",
      en:
        slug === "tahkon-teituli"
          ? "Tahkon Teituli"
          : slug === "villa-puolukka"
            ? "Villa Puolukka"
            : "Villa Karpalo",
    },
    description: deriveVillaShort(slug, primary),
    longDescription: {
      fi: splitParagraphs(primary.description),
      en: deriveVillaLongEn(slug),
    },
    amenities: deriveAmenities(primary.amenities || []),
    ratingAverage: average(
      listings.map((l) => l.stats.ratingAverage).filter((n) => n != null),
    ),
    ratingCount: listings.reduce((sum, l) => sum + (l.stats.ratingCount || 0), 0),
    reviews: parseAirbnbReviews(allReviews, MAX_REVIEWS),
    syncedAt: new Date().toISOString(),
  };

  if (slug === "tahkon-teituli") {
    content.units = listings.map((listing) => ({
      id: listing.listingId,
      name: {
        fi: formatTeituliUnitName(listing.title),
        en: formatTeituliUnitName(listing.title),
      },
      guests: listing.stats.guests || 0,
      bedrooms: listing.stats.bedrooms || 0,
    }));
    content.longDescription.fi = [
      "Tahkon Teituli koostuu neljästä erillisestä paritalohuoneistosta (Teituli A & B sekä 8A & 8B).",
      ...content.longDescription.fi,
    ];
    content.longDescription.en = [
      "Tahkon Teituli comprises four separate semi-detached units (Teituli A & B and 8A & 8B).",
      ...content.longDescription.en,
    ];
  }

  await fs.writeFile(
    path.join(CONTENT_DIR, `${slug}.json`),
    JSON.stringify(content, null, 2),
    "utf-8",
  );

  return content;
}

function formatTeituliUnitName(title = "") {
  const cleaned = title.replace(/^TAHKON TEITULI\s*/i, "Teituli ").trim();
  return cleaned.split(",")[0] || "Teituli";
}

function average(nums) {
  if (!nums.length) return undefined;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 100) / 100;
}

function deriveAmenities(amenities) {
  const ids = new Set(["kitchen", "parking", "beds"]);
  const text = amenities.join(" ").toLowerCase();
  if (text.includes("wifi")) ids.add("wifi");
  if (text.includes("sauna")) ids.add("sauna");
  if (text.includes("poreallas") || text.includes("pore")) ids.add("jacuzzi");
  if (text.includes("lemmik")) ids.add("pets");
  if (text.includes("takka")) ids.add("fireplace");
  return Array.from(ids);
}

function deriveVillaShort(slug, listing) {
  if (slug === "villa-puolukka") {
    return {
      fi: "5 makuuhuoneen huvila rantasaunalla — poreallas, 6 hissilippua ja tilaa 16 vieraalle.",
      en: "Five-bedroom villa with lakeside sauna — hot tub, 6 lift tickets and space for 16 guests.",
    };
  }
  if (slug === "villa-karpalo") {
    return {
      fi: "5 makuuhuoneen huvila ulkoporeallasalla — Tahkon suurin sauna ja 6 hissilippua.",
      en: "Five-bedroom villa with outdoor hot tub — Tahko's largest sauna and 6 lift tickets.",
    };
  }
  return {
    fi: "Tahkon Teituli -paritalohuoneistot — sauna, parvi ja hissiliput talvikaudella.",
    en: "Tahkon Teituli semi-detached units — sauna, loft and lift tickets in winter.",
  };
}

const EN_LONG = {
  "villa-puolukka": [
    "Stay price includes 6 ski lift tickets for guests throughout the winter season.",
    "5 bedrooms, living room, kitchen, 4 bathrooms, utility room, sauna, large terrace and outdoor hot tub.",
    "Lakeside sauna with a wood-fired Harvia Legend stove, 2 showers, lounge, loft, WC and terrace.",
    "Optional extras: bed linen/towels €18/person or made beds €28/person. You may bring your own linen.",
  ],
  "villa-karpalo": [
    "5 bedrooms, outdoor hot tub, living room, kitchen, fireplace lounge, 2 bathrooms, WC, sauna and terrace around the house.",
    "Winter stay price includes 6 ski lift tickets (6 corporate season cards at the villa).",
    "Tahko's largest and finest sauna — fits 15–20 people in the steam at once.",
    "Optional extras: bed linen/towels €18/person or made beds €28/person. Your own linen is welcome.",
  ],
  "tahkon-teituli": [
    "Winter stay price includes 4 ski lift tickets to Tahko slopes for the full stay.",
    "2 bedrooms (double beds in both), living room (sofa bed), kitchen, bathroom, sauna, large loft, 2 WCs, terrace.",
    "Air-source heat pump. Six identical Tahkon Teituli units — suitable for larger groups across multiple units.",
    "Hot tub rental available for an extra fee. Bed linen/towels €18/person. You may bring your own linen.",
  ],
};

function deriveVillaLongEn(slug) {
  return EN_LONG[slug] || [];
}

async function buildApartmentContent(slug, listingId) {
  const listing = await readListing(listingId);
  const gallery = await downloadGallery(slug, listing.images.map((i) => i.url));
  const firstLine = listing.description.split("\n")[0]?.trim() || slug;
  const isHelsinki = /helsinki/i.test(listing.location || "");

  const content = {
    id: slug,
    location: isHelsinki ? "helsinki" : "vantaa",
    image: gallery[0] || "",
    gallery: gallery.length > 0 ? gallery : [],
    imageAlt: {
      fi: listing.images[0]?.alt || firstLine,
      en: listing.images[0]?.alt || firstLine,
    },
    name: APARTMENT_NAMES[slug] || { fi: firstLine, en: firstLine },
    area: isHelsinki
      ? { fi: "Helsinki", en: "Helsinki" }
      : /lentokentt|flamingo/i.test(listing.description)
        ? { fi: "Vantaa, lentokenttä / Flamingo", en: "Vantaa, airport / Flamingo" }
        : { fi: "Vantaa", en: "Vantaa" },
    description: {
      fi: firstLine,
      en: firstLine,
    },
    guests: listing.stats.guests,
    bedrooms: listing.stats.bedrooms,
    ratingAverage: listing.stats.ratingAverage,
    ratingCount: listing.stats.ratingCount,
    reviews: parseAirbnbReviews(listing.reviews || [], MAX_REVIEWS),
    syncedAt: new Date().toISOString(),
  };

  await fs.writeFile(
    path.join(CONTENT_DIR, `apartment-${slug}.json`),
    JSON.stringify(content, null, 2),
    "utf-8",
  );

  return content;
}

async function main() {
  await fs.mkdir(CONTENT_DIR, { recursive: true });
  await fs.mkdir(PUBLIC_DIR, { recursive: true });

  console.log("Syncing villas...");
  for (const [slug, ids] of Object.entries(VILLA_MAP)) {
    console.log(slug);
    await buildVillaContent(slug, ids);
  }

  console.log("Syncing apartments...");
  for (const [slug, id] of Object.entries(APARTMENT_MAP)) {
    console.log(slug);
    await buildApartmentContent(slug, id);
  }

  console.log("Done -> data/content/ + public/images/properties/");
}

main();
