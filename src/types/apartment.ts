import type { GuestReview } from "@/types/review";

export type ApartmentLocation = "vantaa" | "helsinki";

export type Apartment = {
  id: string;
  location: ApartmentLocation;
  image: string;
  gallery?: string[];
  imageAlt: { fi: string; en: string };
  name: { fi: string; en: string };
  area: { fi: string; en: string };
  description?: { fi: string; en: string };
  ratingAverage?: number;
  ratingCount?: number;
  guests?: number;
  bedrooms?: number;
  reviews?: GuestReview[];
};
