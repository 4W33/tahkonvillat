import { revalidateSiteContent } from "@/lib/admin/revalidate-site";
import { getSiteMessagesValidationError } from "@/lib/admin/validate-site-messages";
import {
  getAllSiteMessages,
  writeSiteMessages,
  type SiteMessages,
} from "@/lib/data/site-messages-store";
import {
  readPropertyGallery,
  writePropertyGallery,
} from "@/lib/data/content-store";
import { revalidatePropertyPaths } from "@/lib/admin/revalidate-property";
import { resolveProperty } from "@/lib/admin/property-registry";
import { getAdminProperties } from "@/lib/admin/properties";
import { readStoreJson } from "@/lib/storage/json";

export type BannerSlot = "hero" | "story" | "editorial";

function setNestedImage(
  messages: SiteMessages,
  slot: BannerSlot,
  image: string,
): SiteMessages {
  const next = structuredClone(messages) as SiteMessages;
  if (slot === "hero") next.home.hero.image = image;
  if (slot === "story") next.home.story.image = image;
  if (slot === "editorial") next.home.editorial.image = image;
  return next;
}

const SITE_IMAGES_PATH = "data/site-images.json";

export async function getHomePageAdminData() {
  const [{ fi }, properties, siteImages] = await Promise.all([
    getAllSiteMessages(),
    getAdminProperties(),
    readStoreJson<string[]>(SITE_IMAGES_PATH),
  ]);

  const propertyRows = await Promise.all(
    properties.map(async (property) => {
      const ref = resolveProperty(property.id);
      if (!ref) return null;
      const gallery = await readPropertyGallery(property.id, ref.group);
      return {
        id: property.id,
        name: property.name,
        group: property.group,
        image: gallery?.image ?? "",
        gallery: gallery?.gallery ?? [],
      };
    }),
  );

  const allImages = Array.from(
    new Set(
      [
        ...(siteImages ?? []),
        ...propertyRows.flatMap((row) => row?.gallery ?? []),
      ].filter(Boolean),
    ),
  );

  return {
    banners: {
      hero: fi.home.hero.image,
      story: fi.home.story.image,
      editorial: fi.home.editorial.image,
    },
    properties: propertyRows.filter(Boolean),
    allImages,
  };
}

export async function setBannerImage(slot: BannerSlot, image: string) {
  const { fi, en } = await getAllSiteMessages();

  const nextFi = setNestedImage(fi, slot, image);
  const nextEn = setNestedImage(en, slot, image);

  const fiError = getSiteMessagesValidationError(nextFi);
  if (fiError) throw new Error(fiError);

  const enError = getSiteMessagesValidationError(nextEn);
  if (enError) throw new Error(enError);

  await writeSiteMessages("fi", nextFi);
  await writeSiteMessages("en", nextEn);
  revalidateSiteContent();
}

export async function setPropertyCover(propertyId: string, image: string) {
  const ref = resolveProperty(propertyId);
  if (!ref) throw new Error("Property not found");

  const gallery = await readPropertyGallery(propertyId, ref.group);
  if (!gallery) throw new Error("Property not found");

  if (!gallery.gallery.includes(image)) {
    throw new Error("Image must be in property gallery");
  }

  await writePropertyGallery(propertyId, ref.group, image, gallery.gallery);
  revalidatePropertyPaths(propertyId, ref.group);
}
