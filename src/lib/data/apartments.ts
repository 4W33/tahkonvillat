import { getAllApartments } from "@/lib/data/content-store";
import type { Apartment } from "@/types/apartment";

export async function getApartments(): Promise<Apartment[]> {
  return getAllApartments();
}
