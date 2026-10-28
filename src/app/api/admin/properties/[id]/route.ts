import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api-auth";
import { revalidatePropertyPaths } from "@/lib/admin/revalidate-property";
import { resolveProperty } from "@/lib/admin/property-registry";
import {
  readPropertyEditor,
  writePropertyGallery,
  writePropertyMeta,
  writePropertyTexts,
} from "@/lib/data/content-store";
import type {
  PropertyMetaPayload,
  PropertyTextsPayload,
} from "@/types/property-editor";
import type { AmenityId } from "@/types/villa";

type RouteContext = { params: Promise<{ id: string }> };

function isLocaleText(value: unknown): value is { fi: string; en: string } {
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;
  return typeof data.fi === "string" && typeof data.en === "string";
}

function parseTexts(body: Record<string, unknown>): PropertyTextsPayload | null {
  if (!isLocaleText(body.name) || !isLocaleText(body.description)) {
    return null;
  }

  const payload: PropertyTextsPayload = {
    name: {
      fi: body.name.fi.trim(),
      en: body.name.en.trim(),
    },
    description: {
      fi: body.description.fi.trim(),
      en: body.description.en.trim(),
    },
  };

  if (body.longDescription && typeof body.longDescription === "object") {
    const long = body.longDescription as Record<string, unknown>;
    if (Array.isArray(long.fi) && Array.isArray(long.en)) {
      payload.longDescription = {
        fi: long.fi.filter((item): item is string => typeof item === "string"),
        en: long.en.filter((item): item is string => typeof item === "string"),
      };
    }
  }

  if (isLocaleText(body.area)) {
    payload.area = {
      fi: body.area.fi.trim(),
      en: body.area.en.trim(),
    };
  }

  if (isLocaleText(body.imageAlt)) {
    payload.imageAlt = {
      fi: body.imageAlt.fi.trim(),
      en: body.imageAlt.en.trim(),
    };
  }

  return payload;
}

const AMENITY_IDS = new Set<AmenityId>([
  "sauna",
  "wifi",
  "jacuzzi",
  "pets",
  "beds",
  "kitchen",
  "fireplace",
  "parking",
]);

function parseMeta(body: Record<string, unknown>): PropertyMetaPayload | null {
  if (typeof body.location !== "string") return null;
  if (typeof body.guests !== "number" || typeof body.bedrooms !== "number") {
    return null;
  }

  const meta: PropertyMetaPayload = {
    location: body.location.trim(),
    guests: Math.max(0, Math.round(body.guests)),
    bedrooms: Math.max(0, Math.round(body.bedrooms)),
  };

  if (Array.isArray(body.amenities)) {
    meta.amenities = body.amenities.filter(
      (item): item is AmenityId =>
        typeof item === "string" && AMENITY_IDS.has(item as AmenityId),
    );
  }

  return meta;
}

export async function GET(_request: Request, props: RouteContext) {
  const params = await props.params;
  const authError = await requireAdmin();
  if (authError) return authError;

  const ref = resolveProperty(params.id);
  if (!ref) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const property = await readPropertyEditor(ref.id, ref.group);
  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(property);
}

export async function PUT(request: Request, props: RouteContext) {
  const params = await props.params;
  const authError = await requireAdmin();
  if (authError) return authError;

  const ref = resolveProperty(params.id);
  if (!ref) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;

    const gallery = Array.isArray(body.gallery)
      ? body.gallery.filter((item): item is string => typeof item === "string")
      : null;
    const image = typeof body.image === "string" ? body.image : null;

    if (gallery && image) {
      if (!gallery.includes(image)) {
        return NextResponse.json(
          { error: "Cover image must be in gallery" },
          { status: 400 },
        );
      }

      await writePropertyGallery(ref.id, ref.group, image, gallery);
      revalidatePropertyPaths(ref.id, ref.group);
      return NextResponse.json(await readPropertyEditor(ref.id, ref.group));
    }

    if (body.name && body.description) {
      const texts = parseTexts(body);
      if (!texts || !texts.name.fi) {
        return NextResponse.json(
          { error: "Nimi (FI) on pakollinen" },
          { status: 400 },
        );
      }

      await writePropertyTexts(ref.id, ref.group, texts);
      revalidatePropertyPaths(ref.id, ref.group);
      return NextResponse.json(await readPropertyEditor(ref.id, ref.group));
    }

    const meta = parseMeta(body);
    if (meta?.location) {
      await writePropertyMeta(ref.id, ref.group, meta);
      revalidatePropertyPaths(ref.id, ref.group);
      return NextResponse.json(await readPropertyEditor(ref.id, ref.group));
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
