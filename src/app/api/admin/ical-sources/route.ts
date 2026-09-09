import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api-auth";
import { revalidatePropertyPaths } from "@/lib/admin/revalidate-property";
import { listCalendarKeys } from "@/lib/availability/keys";
import { isValidIcalUrl } from "@/lib/availability/validate-url";
import { getVillas } from "@/lib/content/villas";
import { readIcalSources, writeIcalSources } from "@/lib/data/ical-sources-store";
import type { IcalSourceStore } from "@/types/availability";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const [villas, sources] = await Promise.all([getVillas(), readIcalSources()]);
  return NextResponse.json({ keys: listCalendarKeys(villas), sources });
}

export async function PUT(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = (await request.json()) as { sources?: Record<string, unknown> };
    if (!body.sources || typeof body.sources !== "object") {
      return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 400 });
    }

    const villas = await getVillas();
    const keys = listCalendarKeys(villas);
    const validKeys = new Map(keys.map((k) => [k.key, k]));
    const existing = await readIcalSources();
    const next: IcalSourceStore = {};
    const touched = new Set<string>();

    for (const [key, raw] of Object.entries(body.sources)) {
      const info = validKeys.get(key);
      if (!info) {
        return NextResponse.json({ error: `Tuntematon kohde: ${key}` }, { status: 400 });
      }
      const url = typeof raw === "string" ? raw.trim() : "";
      if (!url) {
        touched.add(info.propertySlug);
        continue;
      }
      if (!isValidIcalUrl(url)) {
        return NextResponse.json(
          { error: `${info.label.fi}: osoitteen pitää alkaa https://` },
          { status: 400 },
        );
      }
      next[key] = {
        url,
        updatedAt:
          existing[key]?.url === url ? existing[key].updatedAt : new Date().toISOString(),
      };
      touched.add(info.propertySlug);
    }

    await writeIcalSources(next);
    touched.forEach((slug) => revalidatePropertyPaths(slug, "villa"));
    return NextResponse.json({ sources: next });
  } catch {
    return NextResponse.json({ error: "Tallennus epäonnistui" }, { status: 500 });
  }
}
