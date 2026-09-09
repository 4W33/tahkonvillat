import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api-auth";
import { getAvailability } from "@/lib/availability/availability";
import { listCalendarKeys } from "@/lib/availability/keys";
import { getVillas } from "@/lib/content/villas";
import type { Availability } from "@/types/availability";

/** Kaikkien kalenteriavainten varaukset adminin Ganttia varten (3 h välimuisti). */
export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const keys = listCalendarKeys(await getVillas());
  const entries = await Promise.all(keys.map((k) => getAvailability(k.key)));
  const out: Record<string, Availability> = {};
  for (const entry of entries) out[entry.key] = entry;
  return NextResponse.json(out);
}
