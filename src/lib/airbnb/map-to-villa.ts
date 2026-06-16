import type { AmenityId, Villa } from "@/types/villa";

export type AirbnbListing = {
  listingId: string;
  url: string;
  title: string;
  description: string;
  location?: string;
  stats: {
    ratingAverage: number | null;
    ratingCount: number | null;
    guests: number | null;
    bedrooms: number | null;
  };
  amenities: string[];
  images: { url: string; alt: string }[];
};

const SLUG_BY_LISTING: Record<string, string> = {
  "24085153": "villa-puolukka",
  "1217947670762444308": "villa-karpalo",
  "47068801": "tahkon-teituli",
};

const NAMES: Record<string, { fi: string; en: string }> = {
  "villa-puolukka": { fi: "Villa Puolukka", en: "Villa Puolukka" },
  "villa-karpalo": { fi: "Villa Karpalo", en: "Villa Karpalo" },
  "tahkon-teituli": { fi: "Tahkon Teituli", en: "Tahkon Teituli" },
};

const EN_DESCRIPTIONS: Record<string, string[]> = {
  "villa-puolukka": [
    "The stay price includes 6 ski lift tickets (free for guests to use throughout the winter season).",
    "5 bedrooms, living room, kitchen, 4 bathrooms, utility room, sauna, large terrace and outdoor hot tub.",
    "Lakeside sauna with a wood-fired Harvia Legend stove, 2 showers, lounge, loft, WC and terrace.",
    "Optional extras: bed linen/towels €18/person or made beds €28/person. You may also bring your own linen.",
  ],
  "villa-karpalo": [
    "5 bedrooms, outdoor hot tub, living room, kitchen, fireplace lounge, 2 bathrooms, WC, sauna and a terrace wrapping around the house.",
    "Winter stay price includes 6 ski lift tickets (6 corporate season cards at the villa).",
    "Tahko's largest and finest sauna — fits 15–20 people in the steam at once.",
    "Optional extras: bed linen/towels €18/person or made beds €28/person. Your own linen is also welcome.",
  ],
  "tahkon-teituli": [
    "Winter stay price includes 4 ski lift tickets to Tahko slopes for the full stay.",
    "2 bedrooms (double beds in both), living room (sofa bed), kitchen, bathroom, sauna, large loft (three single beds and a sofa bed), 2 WCs, terrace.",
    "Air-source heat pump. Six identical Tahkon Teituli semi-detached units — suitable for larger groups split across units.",
    "Hot tub rental available for an extra fee. Bed linen/towels €18/person. You may bring your own linen.",
  ],
};

function sizedImage(url: string): string {
  return url.includes("?") ? `${url}&im_w=1200` : `${url}?im_w=1200`;
}

function mapAmenities(amenities: string[]): AmenityId[] {
  const ids = new Set<AmenityId>(["kitchen", "parking", "beds"]);

  if (amenities.some((a) => /wifi/i.test(a))) ids.add("wifi");
  if (amenities.some((a) => /sauna/i.test(a))) ids.add("sauna");
  if (amenities.some((a) => /poreallas|jacuzzi|hot tub/i.test(a))) ids.add("jacuzzi");
  if (amenities.some((a) => /lemmik/i.test(a))) ids.add("pets");
  if (amenities.some((a) => /takka/i.test(a))) ids.add("fireplace");

  return Array.from(ids);
}

function shortDescription(slug: string): { fi: string; en: string } {
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
    fi: "Tahkon Teituli -paritalohuoneisto — sauna, parvi ja hissiliput talvikaudella.",
    en: "Tahkon Teituli semi-detached unit — sauna, loft and lift tickets in winter.",
  };
}

export function mapAirbnbToVilla(listing: AirbnbListing): Villa | null {
  const slug = SLUG_BY_LISTING[listing.listingId];
  if (!slug) return null;

  const fiParagraphs = listing.description
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);

  const gallery = listing.images.map((img) => sizedImage(img.url));
  const image = gallery[0] ?? "";
  const heroAlt =
    listing.images.find((img) => img.alt)?.alt ||
    `${NAMES[slug].fi} Tahkolla`;

  return {
    slug,
    location: "tahko",
    guests: listing.stats.guests ?? 4,
    bedrooms: listing.stats.bedrooms ?? 2,
    image,
    gallery: gallery.length ? gallery : [image],
    imageAlt: {
      fi: heroAlt,
      en: heroAlt,
    },
    name: NAMES[slug],
    description: shortDescription(slug),
    longDescription: {
      fi: fiParagraphs,
      en: EN_DESCRIPTIONS[slug] ?? fiParagraphs,
    },
    amenities: mapAmenities(listing.amenities),
    ratingAverage: listing.stats.ratingAverage ?? undefined,
    ratingCount: listing.stats.ratingCount ?? undefined,
  };
}
