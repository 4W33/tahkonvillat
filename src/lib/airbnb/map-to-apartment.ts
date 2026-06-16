import type { Apartment } from "@/types/apartment";
import type { AirbnbListing } from "@/lib/airbnb/map-to-villa";

const SLUG_BY_LISTING: Record<string, string> = {
  "32621290": "vantaa-1",
  "32665560": "vantaa-2",
  "32721246": "vantaa-3",
  "18682338": "helsinki-1",
};

function sizedImage(url: string): string {
  return url.includes("?") ? `${url}&im_w=1200` : `${url}?im_w=1200`;
}

function deriveName(description: string, location: string): { fi: string; en: string } {
  const firstLine = description.split("\n")[0]?.trim() || "Asunto";
  const isHelsinki = /helsinki/i.test(location);
  const isVantaa = /vantaa/i.test(location);

  if (firstLine.length > 8 && firstLine.length < 80) {
    return { fi: firstLine, en: firstLine };
  }

  if (isHelsinki) {
    return { fi: "Asunto Helsinki", en: "Apartment Helsinki" };
  }
  if (isVantaa) {
    return { fi: "Asunto Vantaalla", en: "Apartment in Vantaa" };
  }

  return { fi: "Asunto", en: "Apartment" };
}

function deriveArea(location: string, description: string): { fi: string; en: string } {
  if (/helsinki/i.test(location)) {
    return { fi: "Helsinki", en: "Helsinki" };
  }
  if (/vantaa/i.test(location)) {
    if (/lentokentt|flamingo/i.test(description)) {
      return { fi: "Vantaa, lentokenttä / Flamingo", en: "Vantaa, airport / Flamingo" };
    }
    return { fi: "Vantaa", en: "Vantaa" };
  }
  return { fi: "Suomi", en: "Finland" };
}

export function mapAirbnbToApartment(listing: AirbnbListing): Apartment | null {
  const id = SLUG_BY_LISTING[listing.listingId];
  if (!id) return null;

  const image = listing.images[0]?.url
    ? sizedImage(listing.images[0].url)
    : "";
  const alt =
    listing.images[0]?.alt ||
    deriveName(listing.description, listing.location ?? "").fi;

  const locationText = listing.location ?? "";

  return {
    id,
    location: /helsinki/i.test(locationText) ? "helsinki" : "vantaa",
    image,
    imageAlt: { fi: alt, en: alt },
    name: deriveName(listing.description, locationText),
    area: deriveArea(locationText, listing.description),
    description: {
      fi: listing.description.split("\n").filter(Boolean)[0] || "",
      en: listing.description.split("\n").filter(Boolean)[0] || "",
    },
    ratingAverage: listing.stats.ratingAverage ?? undefined,
    ratingCount: listing.stats.ratingCount ?? undefined,
    guests: listing.stats.guests ?? undefined,
    bedrooms: listing.stats.bedrooms ?? undefined,
  };
}
