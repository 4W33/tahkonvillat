import type { PropertyGroup } from "@/lib/admin/property-registry";
import type { AmenityId } from "@/types/villa";

export type LocaleText = { fi: string; en: string };

export const AMENITY_OPTIONS: { id: AmenityId; label: string }[] = [
  { id: "sauna", label: "Sauna" },
  { id: "wifi", label: "Wi-Fi" },
  { id: "jacuzzi", label: "Poreamme" },
  { id: "pets", label: "Lemmikit sallittu" },
  { id: "beds", label: "Vuodevaatteet" },
  { id: "kitchen", label: "Keittiö" },
  { id: "fireplace", label: "Takka" },
  { id: "parking", label: "Pysäköinti" },
];

export type PropertyEditorData = {
  id: string;
  group: PropertyGroup;
  image: string;
  gallery: string[];
  name: LocaleText;
  imageAlt: LocaleText;
  description: LocaleText;
  longDescription?: { fi: string[]; en: string[] };
  area?: LocaleText;
  location: string;
  guests: number;
  bedrooms: number;
  amenities?: AmenityId[];
  ratingAverage?: number;
  ratingCount?: number;
};

export type PropertyTextsPayload = {
  name: LocaleText;
  imageAlt?: LocaleText;
  description: LocaleText;
  longDescription?: { fi: string[]; en: string[] };
  area?: LocaleText;
};

export type PropertyMetaPayload = {
  location: string;
  guests: number;
  bedrooms: number;
  amenities?: AmenityId[];
};
