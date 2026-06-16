import { NextResponse } from "next/server";
import type { Reservation } from "@/types/villa";
import { requireAdmin } from "@/lib/admin/api-auth";
import { getAdminProperties } from "@/lib/admin/properties";
import {
  readReservations,
  writeReservations,
} from "@/lib/data/reservation-store";

async function isValidReservation(body: unknown): Promise<boolean> {
  if (!body || typeof body !== "object") return false;
  const data = body as Record<string, unknown>;
  const properties = await getAdminProperties();
  const validProperty = properties.some((p) => p.id === data.propertySlug);

  return (
    validProperty &&
    typeof data.propertySlug === "string" &&
    typeof data.startDate === "string" &&
    typeof data.endDate === "string" &&
    typeof data.guestName === "string" &&
    data.guestName.trim().length > 0 &&
    data.endDate > data.startDate
  );
}

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const reservations = await readReservations();
  return NextResponse.json(reservations);
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();

    if (!(await isValidReservation(body))) {
      return NextResponse.json({ error: "Invalid reservation" }, { status: 400 });
    }

    const reservations = await readReservations();
    const data = body as Omit<Reservation, "id">;
    const reservation: Reservation = {
      id: `res-${Date.now()}`,
      ...data,
      guestName: data.guestName.trim(),
    };

    reservations.push(reservation);
    await writeReservations(reservations);

    return NextResponse.json(reservation, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
