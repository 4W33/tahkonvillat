import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api-auth";
import { getAdminProperties } from "@/lib/admin/properties";
import { resolveProperty } from "@/lib/admin/property-registry";
import { readPropertyGallery } from "@/lib/data/content-store";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const properties = await getAdminProperties();
  const items = await Promise.all(
    properties.map(async (property) => {
      const ref = resolveProperty(property.id);
      if (!ref) return null;
      const gallery = await readPropertyGallery(property.id, ref.group);
      return {
        id: property.id,
        name: property.name,
        group: property.group,
        image: gallery?.image ?? "",
        imageCount: gallery?.gallery.length ?? 0,
      };
    }),
  );

  return NextResponse.json(items.filter(Boolean));
}
