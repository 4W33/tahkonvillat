import type { PropertyPricing } from "@/types/pricing";
import { toPricing } from "./payload-mappers";

/** propertyId = villan slug tai asunnon apartmentId. */
export async function getPropertyPricing(
  propertyId: string,
): Promise<PropertyPricing | null> {
  const { getPayloadClient } = await import("@/lib/payload");
  const payload = await getPayloadClient();
  const [villas, apartments] = await Promise.all([
    payload.find({ collection: "villas", where: { slug: { equals: propertyId } }, locale: "all", depth: 0, limit: 1 }),
    payload.find({ collection: "apartments", where: { apartmentId: { equals: propertyId } }, locale: "all", depth: 0, limit: 1 }),
  ]);
  const doc = villas.docs[0] ?? apartments.docs[0];
  return doc ? toPricing(doc.pricing) : null;
}
