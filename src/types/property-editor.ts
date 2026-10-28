import type { PropertyGroup } from "@/lib/admin/property-registry";
import type { AmenityId } from "@/types/villa";

export type LocaleText = { fi: string; en: string };

export { AMENITY_OPTIONS } from "@/payload/fields/amenities";

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
