import { NextResponse } from "next/server";
import type { Reservation } from "@/types/villa";
import { requireAdmin } from "@/lib/admin/api-auth";
import { getAdminProperties } from "@/lib/admin/properties";
import {
  readReservations,
  writeReservations,
} from "@/lib/data/reservation-store";

type RouteContext = { params: { id: string } };

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

export async function PUT(request: Request, { params }: RouteContext) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();

    if (!(await isValidReservation(body))) {
      return NextResponse.json({ error: "Invalid reservation" }, { status: 400 });
    }

    const reservations = await readReservations();
    const index = reservations.findIndex((r) => r.id === params.id);

    if (index === -1) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const data = body as Omit<Reservation, "id">;
    reservations[index] = {
      id: params.id,
      propertySlug: data.propertySlug,
      startDate: data.startDate,
      endDate: data.endDate,
      guestName: data.guestName.trim(),
    };

    await writeReservations(reservations);
    return NextResponse.json(reservations[index]);
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const reservations = await readReservations();
    const filtered = reservations.filter((r) => r.id !== params.id);

    if (filtered.length === reservations.length) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await writeReservations(filtered);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
