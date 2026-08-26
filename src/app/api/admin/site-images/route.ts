import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api-auth";
import { savePropertyImage } from "@/lib/admin/process-image";
import { readStoreJson, writeStoreJson } from "@/lib/storage/json";

const SITE_IMAGES_PATH = "data/site-images.json";

// Site-wide images (hero, story, editorial banners) that don't belong
// to any property. Stored under mediaDir "site", tracked in a JSON list
// so they appear in the shared image pool.
export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const form = await request.formData();
    const files = form
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File);

    if (!files.length) {
      return NextResponse.json({ error: "No files" }, { status: 400 });
    }

    const uploaded: string[] = [];
    for (const file of files) {
      uploaded.push(await savePropertyImage("site", file));
    }

    const existing = (await readStoreJson<string[]>(SITE_IMAGES_PATH)) ?? [];
    await writeStoreJson(SITE_IMAGES_PATH, [...uploaded, ...existing], {
      access: "public",
    });

    return NextResponse.json({ uploaded });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
