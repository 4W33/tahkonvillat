import type { VillaLocation } from "@/types/villa";

export type LocationFilterValue = "all" | "tahko" | "helsinki" | "vantaa";

export function parseLocationFilter(
  value: string | undefined,
): LocationFilterValue {
  if (value === "tahko" || value === "helsinki" || value === "vantaa") {
    return value;
  }
  return "all";
}

export function filterVillasByLocation<T extends { location: VillaLocation }>(
  items: T[],
  filter: LocationFilterValue,
): T[] {
  if (filter === "all") return items;
  return items.filter((item) => item.location === filter);
}
