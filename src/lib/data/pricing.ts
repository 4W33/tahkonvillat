import type { PropertyPricing } from "@/types/pricing";
import { readPricing } from "./pricing-store";

export async function getPropertyPricing(
  propertyId: string,
): Promise<PropertyPricing | null> {
  const store = await readPricing();
  const entry = store[propertyId];
  if (!entry?.fromPerNight || entry.fromPerNight <= 0) return null;
  return entry;
}
