import type { CalendarKey } from "@/types/availability";
import type { Villa } from "@/types/villa";

type VillaLike = Pick<Villa, "slug" | "name" | "units">;

/** Yksi kalenteri per varattava yksikkö: `slug` tai `slug:unitId`. */
export function listCalendarKeys(villas: VillaLike[]): CalendarKey[] {
  return villas.flatMap((villa) => {
    if (villa.units && villa.units.length > 0) {
      return villa.units.map((unit) => ({
        key: `${villa.slug}:${unit.id}`,
        propertySlug: villa.slug,
        unitId: unit.id,
        label: unit.name,
      }));
    }
    return [{ key: villa.slug, propertySlug: villa.slug, label: villa.name }];
  });
}

export function parseCalendarKey(key: string): {
  propertySlug: string;
  unitId?: string;
} {
  const [propertySlug, unitId] = key.split(":");
  return unitId ? { propertySlug, unitId } : { propertySlug };
}
