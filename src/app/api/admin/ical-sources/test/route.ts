import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api-auth";
import { fetchIcsText } from "@/lib/availability/availability";
import { parseIcsToRanges } from "@/lib/availability/ical";
import { isValidIcalUrl } from "@/lib/availability/validate-url";

/** Testaa iCal-linkin ilman tallennusta: hakee tuoreena, jäsentää, kertoo määrän. */
export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = (await request.json().catch(() => ({}))) as { url?: string };
  const url = body.url?.trim() ?? "";
  if (!isValidIcalUrl(url)) {
    return NextResponse.json({ ok: false, error: "Osoitteen pitää alkaa https://" });
  }

  try {
    const ics = await fetchIcsText(url, { noStore: true });
    const ranges = parseIcsToRanges(ics);
    const today = new Date().toISOString().slice(0, 10);
    const next = ranges.find((r) => r.end > today) ?? null;
    return NextResponse.json({ ok: true, count: ranges.length, next });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: `Linkkiä ei voitu lukea: ${error instanceof Error ? error.message : "tuntematon virhe"}`,
    });
  }
}
