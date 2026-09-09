import type { PropertyPricing } from "@/types/pricing";
import { hasAnyPrice } from "@/lib/pricing/seasons";
import { readPricing } from "./pricing-store";

export async function getPropertyPricing(
  propertyId: string,
): Promise<PropertyPricing | null> {
  const store = await readPricing();
  const entry = store[propertyId];
  if (!entry || !hasAnyPrice(entry)) return null;
  return entry;
}
