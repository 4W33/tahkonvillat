import { siteConfig } from "@/lib/site.config";

export const VILLA_SLUGS = siteConfig.properties.villaSlugs;
export const APARTMENT_IDS = siteConfig.properties.apartmentIds;

export type PropertyGroup = "villa" | "apartment";

export type PropertyRef = {
  id: string;
  group: PropertyGroup;
  contentFile: string;
  mediaDir: string;
};

const ALL_IDS = new Set<string>([...VILLA_SLUGS, ...APARTMENT_IDS]);

export function resolveProperty(id: string): PropertyRef | null {
  if ((VILLA_SLUGS as readonly string[]).includes(id)) {
    return {
      id,
      group: "villa",
      contentFile: `${id}.json`,
      mediaDir: id,
    };
  }

  if ((APARTMENT_IDS as readonly string[]).includes(id)) {
    return {
      id,
      group: "apartment",
      contentFile: `apartment-${id}.json`,
      mediaDir: id,
    };
  }

  return null;
}

export function isKnownPropertyId(id: string): boolean {
  return ALL_IDS.has(id);
}
