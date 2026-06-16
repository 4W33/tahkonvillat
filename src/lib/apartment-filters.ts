import type { ApartmentLocation } from "@/types/apartment";

export type ApartmentFilterValue = "all" | "vantaa" | "helsinki";

export function parseApartmentFilter(
  value: string | undefined,
): ApartmentFilterValue {
  if (value === "vantaa" || value === "helsinki") return value;
  return "all";
}

export function filterApartmentsByLocation<
  T extends { location: ApartmentLocation },
>(items: T[], filter: ApartmentFilterValue): T[] {
  if (filter === "all") return items;
  return items.filter((item) => item.location === filter);
}
