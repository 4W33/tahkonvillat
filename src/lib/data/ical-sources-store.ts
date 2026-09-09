import { readStoreJson, writeStoreJson } from "@/lib/storage/json";
import type { IcalSourceStore } from "@/types/availability";

const ICAL_SOURCES_PATH = "data/ical-sources.json";

export async function readIcalSources(): Promise<IcalSourceStore> {
  const store = await readStoreJson<IcalSourceStore>(ICAL_SOURCES_PATH);
  if (!store || typeof store !== "object" || Array.isArray(store)) return {};
  return store;
}

export async function writeIcalSources(store: IcalSourceStore): Promise<void> {
  await writeStoreJson(ICAL_SOURCES_PATH, store, { access: "private" });
}
