import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api-auth";
import {
  getHomePageAdminData,
  setBannerImage,
  setPropertyCover,
  type BannerSlot,
} from "@/lib/admin/home-page";

const BANNER_SLOTS = new Set<BannerSlot>(["hero", "story", "editorial"]);

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const data = await getHomePageAdminData();
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = (await request.json()) as {
      action?: string;
      slot?: string;
      propertyId?: string;
      image?: string;
    };

    if (typeof body.image !== "string" || !body.image.startsWith("/")) {
      return NextResponse.json({ error: "Invalid image path" }, { status: 400 });
    }

    if (body.action === "banner") {
      if (!body.slot || !BANNER_SLOTS.has(body.slot as BannerSlot)) {
        return NextResponse.json({ error: "Invalid banner slot" }, { status: 400 });
      }

      await setBannerImage(body.slot as BannerSlot, body.image);
      return NextResponse.json({ ok: true });
    }

    if (body.action === "cover") {
      if (!body.propertyId) {
        return NextResponse.json({ error: "Missing propertyId" }, { status: 400 });
      }

      await setPropertyCover(body.propertyId, body.image);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Save failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
