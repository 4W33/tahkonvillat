import { readStoreJson, writeStoreJson } from "@/lib/storage/json";
import type { IcalSourceStore } from "@/types/availability";

const ICAL_SOURCES_PATH = "data/ical-sources.json";

/** Avaimet `slug` ja `slug:unitId` villojen iCal-kentistä. Kantavirhe HEITTÄÄ (kalenteri → unavailable). */
export async function readIcalSources(): Promise<IcalSourceStore> {
  const { getPayloadClient } = await import("@/lib/payload");
  const payload = await getPayloadClient();
  const { docs } = await payload.find({ collection: "villas", depth: 0, pagination: false, overrideAccess: true });
  const store: IcalSourceStore = {};
  for (const villa of docs) {
    if (villa.icalUrl) store[villa.slug] = { url: villa.icalUrl, updatedAt: villa.updatedAt };
    for (const unit of villa.units ?? []) {
      if (unit.icalUrl) store[`${villa.slug}:${unit.unitId}`] = { url: unit.icalUrl, updatedAt: villa.updatedAt };
    }
  }
  return store;
}

export async function writeIcalSources(store: IcalSourceStore): Promise<void> {
  await writeStoreJson(ICAL_SOURCES_PATH, store);
}
