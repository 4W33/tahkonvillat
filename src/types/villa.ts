import type { GuestReview } from "@/types/review";

export type VillaLocation = "tahko" | "vantaa" | "helsinki";

export type AmenityId =
  | "sauna"
  | "wifi"
  | "jacuzzi"
  | "pets"
  | "beds"
  | "kitchen"
  | "fireplace"
  | "parking";

export type VillaUnit = {
  id: string;
  name: { fi: string; en: string };
  guests: number;
  bedrooms: number;
};

export type Villa = {
  slug: string;
  location: VillaLocation;
  guests: number;
  bedrooms: number;
  units?: VillaUnit[];
  image: string;
  gallery: string[];
  imageAlt: { fi: string; en: string };
  name: { fi: string; en: string };
  description: { fi: string; en: string };
  longDescription: { fi: string[]; en: string[] };
  amenities: AmenityId[];
  ratingAverage?: number;
  ratingCount?: number;
  reviews?: GuestReview[];
};

export type Reservation = {
  id: string;
  propertySlug: string;
  startDate: string;
  endDate: string;
  guestName: string;
};
