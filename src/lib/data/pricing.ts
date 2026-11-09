import { cache } from "react";
import type { PropertyPricing } from "@/types/pricing";
import { toPricing } from "./payload-mappers";

// Yksi haku per pyyntö kaikille hintakorteille (ennen 2 kyselyä per kortti).
const getAllPricing = cache(async () => {
  const { getPayloadClient } = await import("@/lib/payload");
  const payload = await getPayloadClient();
  const [villas, apartments] = await Promise.all([
    payload.find({ collection: "villas", locale: "all", depth: 0, pagination: false }),
    payload.find({ collection: "apartments", locale: "all", depth: 0, pagination: false }),
  ]);
  const byId = new Map<string, unknown>();
  // Villa voittaa, jos asunnon apartmentId on sama kuin villan slug (kuten ennen).
  for (const doc of apartments.docs) byId.set(doc.apartmentId, doc.pricing);
  for (const doc of villas.docs) byId.set(doc.slug, doc.pricing);
  return byId;
});

/** propertyId = villan slug tai asunnon apartmentId. */
export async function getPropertyPricing(
  propertyId: string,
): Promise<PropertyPricing | null> {
  const byId = await getAllPricing();
  return byId.has(propertyId) ? toPricing(byId.get(propertyId)) : null;
}
