import { readStoreJson, writeStoreJson } from "@/lib/storage/json";
import type { PricingStore } from "@/types/pricing";

const PRICING_PATH = "data/pricing.json";

export async function readPricing(): Promise<PricingStore> {
  const store = await readStoreJson<PricingStore>(PRICING_PATH);
  return store ?? {};
}

export async function writePricing(store: PricingStore): Promise<void> {
  await writeStoreJson(PRICING_PATH, store);
}
