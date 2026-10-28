import type { Where } from "payload";
import { toApartment, toVilla } from "@/lib/data/payload-mappers";
import type { Apartment } from "@/types/apartment";
import type { Villa } from "@/types/villa";

// Julkinen sivusto lukee Payloadista. Kantavirhe heittää: ISR pitää viimeisimmän onnistuneen sivun.
async function findAll(collection: "villas" | "apartments", where?: Where): Promise<Record<string, unknown>[]> {
  const { getPayloadClient } = await import("@/lib/payload");
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection,
    where,
    locale: "all",
    depth: 1,
    pagination: false,
    sort: "createdAt",
  });
  return docs as unknown as Record<string, unknown>[];
}

export async function getAllVillas(): Promise<Villa[]> {
  return (await findAll("villas")).map(toVilla);
}

export async function getVillaBySlug(slug: string): Promise<Villa | undefined> {
  const [doc] = await findAll("villas", { slug: { equals: slug } });
  return doc ? toVilla(doc) : undefined;
}

export async function getAllApartments(): Promise<Apartment[]> {
  return (await findAll("apartments")).map(toApartment);
}
