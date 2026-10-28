import { toIsoDay } from "@/payload/fields/pricing";
import type { Reservation } from "@/types/villa";

/** propertySlug = kalenteriavain (`slug` tai `slug:unitId`). Kantavirhe HEITTÄÄ. */
export async function readReservations(): Promise<Reservation[]> {
  const { getPayloadClient } = await import("@/lib/payload");
  const payload = await getPayloadClient();
  const { docs } = await payload.find({ collection: "reservations", depth: 0, pagination: false, overrideAccess: true });
  return docs.map((r) => ({
    id: String(r.id),
    propertySlug: r.calendarKey,
    startDate: toIsoDay(r.startDate) ?? "",
    endDate: toIsoDay(r.endDate) ?? "",
    guestName: r.guestName ?? "",
  }));
}
