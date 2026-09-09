import { readStoreJson, writeStoreJson } from "@/lib/storage/json";
import type { Reservation } from "@/types/villa";

const RESERVATIONS_PATH = "data/reservations.json";

export async function readReservations(): Promise<Reservation[]> {
  const data = await readStoreJson<Reservation[]>(RESERVATIONS_PATH);
  return Array.isArray(data) ? data : [];
}

export async function writeReservations(reservations: Reservation[]): Promise<void> {
  await writeStoreJson(RESERVATIONS_PATH, reservations);
}
