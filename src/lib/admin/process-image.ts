import { randomUUID } from "crypto";
import sharp from "sharp";
import { saveMediaFile } from "@/lib/storage/media";

const MAX_EDGE = 2000;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export async function savePropertyImage(
  mediaDir: string,
  file: File,
): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Unsupported image type");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const optimized = await sharp(buffer)
    .rotate()
    .resize(MAX_EDGE, MAX_EDGE, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 82 })
    .toBuffer();

  const filename = `${randomUUID()}.webp`;
  return saveMediaFile(mediaDir, filename, optimized);
}
