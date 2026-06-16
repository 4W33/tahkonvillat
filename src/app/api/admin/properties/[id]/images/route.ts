import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api-auth";
import { savePropertyImage } from "@/lib/admin/process-image";
import { revalidatePropertyPaths } from "@/lib/admin/revalidate-property";
import { resolveProperty } from "@/lib/admin/property-registry";
import {
  readPropertyEditor,
  writePropertyGallery,
} from "@/lib/data/content-store";
import { isBlobMediaUrl, isLocalMediaPath } from "@/lib/storage/config";
import { deleteMediaUrl } from "@/lib/storage/media";

type RouteContext = { params: { id: string } };

export async function POST(request: Request, { params }: RouteContext) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const ref = resolveProperty(params.id);
  if (!ref) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const form = await request.formData();
    const files = form
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File);

    if (!files.length) {
      return NextResponse.json({ error: "No files" }, { status: 400 });
    }

    const property = await readPropertyEditor(ref.id, ref.group);
    if (!property) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const uploaded: string[] = [];
    for (const file of files) {
      uploaded.push(await savePropertyImage(ref.mediaDir, file));
    }

    const gallery = [...property.gallery, ...uploaded];
    const image = property.image || gallery[0] || "";
    await writePropertyGallery(ref.id, ref.group, image, gallery);
    revalidatePropertyPaths(ref.id, ref.group);

    const updated = await readPropertyEditor(ref.id, ref.group);
    return NextResponse.json({ uploaded, property: updated });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const ref = resolveProperty(params.id);
  if (!ref) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const paths = Array.isArray(body.paths)
      ? body.paths.filter((item: unknown) => typeof item === "string")
      : [];

    if (!paths.length) {
      return NextResponse.json({ error: "No paths" }, { status: 400 });
    }

    const property = await readPropertyEditor(ref.id, ref.group);
    if (!property) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const gallery = property.gallery.filter((src) => !paths.includes(src));
    let image = property.image;
    if (paths.includes(image)) {
      image = gallery[0] || "";
    }

    await writePropertyGallery(ref.id, ref.group, image, gallery);

    for (const src of paths) {
      if (
        isBlobMediaUrl(src) ||
        (isLocalMediaPath(src) &&
          src.includes(`/images/properties/${ref.mediaDir}/`))
      ) {
        await deleteMediaUrl(src);
      }
    }

    revalidatePropertyPaths(ref.id, ref.group);
    const updated = await readPropertyEditor(ref.id, ref.group);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
