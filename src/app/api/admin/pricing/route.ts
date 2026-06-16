import { NextResponse } from "next/server";
import type { PricingStore } from "@/types/pricing";
import { requireAdmin } from "@/lib/admin/api-auth";
import { getAdminProperties } from "@/lib/admin/properties";
import { revalidatePricing } from "@/lib/admin/revalidate-site";
import { readPricing, writePricing } from "@/lib/data/pricing-store";

function isValidStore(body: unknown, validIds: Set<string>): body is PricingStore {
  if (!body || typeof body !== "object") return false;

  for (const [id, value] of Object.entries(body as PricingStore)) {
    if (!validIds.has(id)) return false;
    if (!value || typeof value !== "object") return false;
    if (typeof value.fromPerNight !== "number" || value.fromPerNight < 0) {
      return false;
    }
    if (value.currency && value.currency !== "EUR") return false;
  }

  return true;
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

    if (!isValidStore(body, validIds)) {
      return NextResponse.json({ error: "Invalid pricing data" }, { status: 400 });
    }

    const normalized: PricingStore = {};
    for (const [id, value] of Object.entries(body as PricingStore)) {
      if (value.fromPerNight <= 0) continue;
      normalized[id] = {
        fromPerNight: Math.round(value.fromPerNight),
        currency: "EUR",
        updatedAt: new Date().toISOString(),
      };
    }

    await writePricing(normalized);
    revalidatePricing();
    return NextResponse.json(normalized);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
