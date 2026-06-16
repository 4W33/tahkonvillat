import { getApartments } from "@/lib/content/apartments";
import { getVillas } from "@/lib/content/villas";

export type AdminProperty = {
  id: string;
  name: string;
  group: "villa" | "apartment";
};

export async function getAdminProperties(): Promise<AdminProperty[]> {
  const villas = (await getVillas()).map((villa) => ({
    id: villa.slug,
    name: villa.name.fi,
    group: "villa" as const,
  }));

  const apartments = (await getApartments()).map((apartment) => ({
    id: apartment.id,
    name: apartment.name.fi,
    group: "apartment" as const,
  }));

  return [...villas, ...apartments];
}
