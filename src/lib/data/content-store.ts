import {
  APARTMENT_IDS,
  VILLA_SLUGS,
  type PropertyGroup,
} from "@/lib/admin/property-registry";
import { readStoreJson, writeStoreJson } from "@/lib/storage/json";
import { deleteMediaUrl } from "@/lib/storage/media";
import type { Apartment } from "@/types/apartment";
import type { GuestReview } from "@/types/review";
import type {
  PropertyEditorData,
  PropertyMetaPayload,
  PropertyTextsPayload,
} from "@/types/property-editor";
import type { AmenityId, Villa, VillaUnit } from "@/types/villa";

const CONTENT_PREFIX = "data/content";

type VillaRecord = {
  slug: string;
  location: string;
  guests: number;
  bedrooms: number;
  units?: VillaUnit[];
  image: string;
  gallery: string[];
  imageAlt: { fi: string; en: string };
  name: { fi: string; en: string };
  description: { fi: string; en: string };
  longDescription: { fi: string[]; en: string[] };
  amenities: string[];
  ratingAverage?: number;
  ratingCount?: number;
  reviews?: GuestReview[];
  syncedAt?: string;
};

type ApartmentRecord = {
  id: string;
  location: string;
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
  syncedAt?: string;
};

function contentPath(filename: string): string {
  return `${CONTENT_PREFIX}/${filename}`;
}

async function readContentJson<T>(filename: string): Promise<T | null> {
  return readStoreJson<T>(contentPath(filename));
}

async function writeContentJson(filename: string, data: unknown): Promise<void> {
  await writeStoreJson(contentPath(filename), data);
}

function asVilla(data: VillaRecord): Villa {
  return {
    ...data,
    location: data.location as Villa["location"],
    amenities: data.amenities as AmenityId[],
    reviews: data.reviews,
    units: data.units,
  };
}

function asApartment(data: ApartmentRecord): Apartment {
  return {
    ...data,
    location: data.location as Apartment["location"],
    gallery: data.gallery ?? (data.image ? [data.image] : []),
    reviews: data.reviews,
  };
}

export async function readVillaRecord(slug: string): Promise<VillaRecord | null> {
  return readContentJson<VillaRecord>(`${slug}.json`);
}

export async function readApartmentRecord(
  id: string,
): Promise<ApartmentRecord | null> {
  return readContentJson<ApartmentRecord>(`apartment-${id}.json`);
}

export async function writeVillaRecord(data: VillaRecord): Promise<void> {
  await writeContentJson(`${data.slug}.json`, data);
}

export async function writeApartmentRecord(data: ApartmentRecord): Promise<void> {
  await writeContentJson(`apartment-${data.id}.json`, data);
}

export async function getAllVillas(): Promise<Villa[]> {
  const villas: Villa[] = [];
  for (const slug of VILLA_SLUGS) {
    const record = await readVillaRecord(slug);
    if (record) villas.push(asVilla(record));
  }
  return villas;
}

export async function getVillaBySlug(slug: string): Promise<Villa | undefined> {
  const record = await readVillaRecord(slug);
  return record ? asVilla(record) : undefined;
}

export async function getAllApartments(): Promise<Apartment[]> {
  const apartments: Apartment[] = [];
  for (const id of APARTMENT_IDS) {
    const record = await readApartmentRecord(id);
    if (record) apartments.push(asApartment(record));
  }
  return apartments;
}

/** @deprecated Use saveMediaFile from storage/media in upload flows */
export function toPublicMediaPath(mediaDir: string, filename: string): string {
  return `/images/properties/${mediaDir}/${filename}`;
}

export async function deleteMediaFile(publicPath: string): Promise<void> {
  await deleteMediaUrl(publicPath);
}

export type PropertyGalleryPayload = {
  id: string;
  group: PropertyGroup;
  name: string;
  image: string;
  gallery: string[];
};

function galleryFromRecord(image: string, gallery?: string[]): string[] {
  if (gallery?.length) return gallery;
  return image ? [image] : [];
}

export async function readPropertyEditor(
  id: string,
  group: PropertyGroup,
): Promise<PropertyEditorData | null> {
  if (group === "villa") {
    const record = await readVillaRecord(id);
    if (!record) return null;
    const gallery = galleryFromRecord(record.image, record.gallery);
    return {
      id: record.slug,
      group,
      image: record.image || gallery[0] || "",
      gallery,
      name: record.name,
      imageAlt: record.imageAlt,
      description: record.description,
      longDescription: record.longDescription,
      location: record.location,
      guests: record.guests,
      bedrooms: record.bedrooms,
      amenities: record.amenities as AmenityId[],
      ratingAverage: record.ratingAverage,
      ratingCount: record.ratingCount,
    };
  }

  const record = await readApartmentRecord(id);
  if (!record) return null;
  const gallery = galleryFromRecord(record.image, record.gallery);
  return {
    id: record.id,
    group,
    image: record.image || gallery[0] || "",
    gallery,
    name: record.name,
    imageAlt: record.imageAlt,
    description: {
      fi: record.description?.fi ?? "",
      en: record.description?.en ?? "",
    },
    area: record.area,
    location: record.location,
    guests: record.guests ?? 0,
    bedrooms: record.bedrooms ?? 0,
    ratingAverage: record.ratingAverage,
    ratingCount: record.ratingCount,
  };
}

export async function writePropertyMeta(
  id: string,
  group: PropertyGroup,
  meta: PropertyMetaPayload,
): Promise<void> {
  if (group === "villa") {
    const record = await readVillaRecord(id);
    if (!record) throw new Error("Property not found");
    await writeVillaRecord({
      ...record,
      location: meta.location,
      guests: meta.guests,
      bedrooms: meta.bedrooms,
      amenities: meta.amenities ?? record.amenities,
    });
    return;
  }

  const record = await readApartmentRecord(id);
  if (!record) throw new Error("Property not found");
  await writeApartmentRecord({
    ...record,
    location: meta.location,
    guests: meta.guests,
    bedrooms: meta.bedrooms,
  });
}

export async function readPropertyGallery(
  id: string,
  group: PropertyGroup,
): Promise<PropertyGalleryPayload | null> {
  if (group === "villa") {
    const record = await readVillaRecord(id);
    if (!record) return null;
    const gallery =
      record.gallery?.length > 0
        ? record.gallery
        : record.image
          ? [record.image]
          : [];
    return {
      id: record.slug,
      group,
      name: record.name.fi,
      image: record.image || gallery[0] || "",
      gallery,
    };
  }

  const record = await readApartmentRecord(id);
  if (!record) return null;
  const gallery =
    record.gallery?.length
      ? record.gallery
      : record.image
        ? [record.image]
        : [];
  return {
    id: record.id,
    group,
    name: record.name.fi,
    image: record.image || gallery[0] || "",
    gallery,
  };
}

export async function writePropertyTexts(
  id: string,
  group: PropertyGroup,
  texts: PropertyTextsPayload,
): Promise<void> {
  if (group === "villa") {
    const record = await readVillaRecord(id);
    if (!record) throw new Error("Property not found");
    await writeVillaRecord({
      ...record,
      name: texts.name,
      description: texts.description,
      longDescription: texts.longDescription ?? record.longDescription,
      imageAlt: texts.imageAlt ?? {
        fi: texts.name.fi || record.imageAlt.fi,
        en: texts.name.en || record.imageAlt.en,
      },
    });
    return;
  }

  const record = await readApartmentRecord(id);
  if (!record) throw new Error("Property not found");
  await writeApartmentRecord({
    ...record,
    name: texts.name,
    area: texts.area ?? record.area,
    description: texts.description,
    imageAlt: texts.imageAlt ?? {
      fi: texts.name.fi || record.imageAlt.fi,
      en: texts.name.en || record.imageAlt.en,
    },
  });
}

export async function writePropertyGallery(
  id: string,
  group: PropertyGroup,
  image: string,
  gallery: string[],
): Promise<void> {
  const uniqueGallery = Array.from(new Set(gallery.filter(Boolean)));
  const cover = image || uniqueGallery[0] || "";

  if (group === "villa") {
    const record = await readVillaRecord(id);
    if (!record) throw new Error("Property not found");
    await writeVillaRecord({
      ...record,
      image: cover,
      gallery: uniqueGallery.length > 0 ? uniqueGallery : cover ? [cover] : [],
    });
    return;
  }

  const record = await readApartmentRecord(id);
  if (!record) throw new Error("Property not found");
  await writeApartmentRecord({
    ...record,
    image: cover,
    gallery: uniqueGallery.length > 0 ? uniqueGallery : cover ? [cover] : [],
  });
}
