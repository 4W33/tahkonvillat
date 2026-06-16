import type { Reservation } from "@/types/villa";
import { readReservations } from "./reservation-store";

export async function getReservationsForProperty(
  slug: string,
): Promise<Reservation[]> {
  const reservations = await readReservations();
  return reservations.filter((r) => r.propertySlug === slug);
}

export async function getAllReservations(): Promise<Reservation[]> {
  return readReservations();
}

export function isDateBooked(
  date: Date,
  propertySlug: string,
  items: Reservation[],
): boolean {
  const day = toDateString(date);
  return items
    .filter((r) => r.propertySlug === propertySlug)
    .some((r) => day >= r.startDate && day < r.endDate);
}

export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
