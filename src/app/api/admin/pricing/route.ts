import { NextResponse } from "next/server";
import type { PriceSeason, PricingStore } from "@/types/pricing";
import { requireAdmin } from "@/lib/admin/api-auth";
import { getAdminProperties } from "@/lib/admin/properties";
import { revalidatePropertyPaths } from "@/lib/admin/revalidate-property";
import { revalidatePricing } from "@/lib/admin/revalidate-site";
import { readPricing, writePricing } from "@/lib/data/pricing-store";
import { validateSeasons } from "@/lib/pricing/seasons";

function validateStore(body: unknown, validIds: Set<string>): string | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "Virheellinen rakenne";
  }

  for (const [id, value] of Object.entries(body as Record<string, unknown>)) {
    if (!validIds.has(id)) return `Tuntematon kohde: ${id}`;
    if (!value || typeof value !== "object") return `${id}: virheellinen arvo`;
    const v = value as Partial<PricingStore[string]>;
    if (
      v.fromPerNight != null &&
      (typeof v.fromPerNight !== "number" || v.fromPerNight < 0)
    ) {
      return `${id}: perushinta ei kelpaa`;
    }
    if (v.currency && v.currency !== "EUR") return `${id}: vain EUR`;
    const seasonError = validateSeasons(v.seasons);
    if (seasonError) return `${id}: ${seasonError}`;
  }

  return null;
}

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const pricing = await readPricing();
  return NextResponse.json(pricing);
}

export async function PUT(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();
    const properties = await getAdminProperties();
    const validIds = new Set(properties.map((p) => p.id));

    const error = validateStore(body, validIds);
    if (error) return NextResponse.json({ error }, { status: 400 });

    const normalized: PricingStore = {};
    for (const [id, value] of Object.entries(body as PricingStore)) {
      const base =
        value.fromPerNight && value.fromPerNight > 0
          ? Math.round(value.fromPerNight)
          : undefined;
      const seasons: PriceSeason[] = (value.seasons ?? []).map((s, i) => ({
        id: s.id || `s-${Date.now()}-${i}`,
        start: s.start,
        end: s.end,
        pricePerNight: Math.round(s.pricePerNight),
        ...(s.label && (s.label.fi || s.label.en)
          ? { label: { fi: s.label.fi ?? "", en: s.label.en ?? "" } }
          : {}),
      }));
      if (!base && seasons.length === 0) continue;
      normalized[id] = {
        ...(base ? { fromPerNight: base } : {}),
        currency: "EUR",
        ...(seasons.length ? { seasons } : {}),
        updatedAt: new Date().toISOString(),
      };
    }

    await writePricing(normalized);
    revalidatePricing();
    for (const p of properties) {
      if (p.group === "villa") revalidatePropertyPaths(p.id, "villa");
    }
    return NextResponse.json(normalized);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
