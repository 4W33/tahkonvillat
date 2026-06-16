import {
  getAllVillas,
  getVillaBySlug as getVillaBySlugFromStore,
} from "@/lib/data/content-store";
import type { Villa } from "@/types/villa";

export async function getVillas(): Promise<Villa[]> {
  return getAllVillas();
}

export async function getVillaBySlug(slug: string): Promise<Villa | undefined> {
  return getVillaBySlugFromStore(slug);
}

export async function getVillaSlugs(): Promise<string[]> {
  const villas = await getAllVillas();
  return villas.map((villa) => villa.slug);
}
