import { promises as fs } from "fs";
import path from "path";
import { getBlobClient } from "@/lib/storage/blob-client";
import {
  assertWritableStorage,
  blobMediaPath,
  isBlobMediaUrl,
  isBlobStorageEnabled,
  isLocalMediaPath,
} from "@/lib/storage/config";

const MEDIA_ROOT = path.join(process.cwd(), "public", "images", "properties");

export function toLocalMediaPath(mediaDir: string, filename: string): string {
  return `/images/properties/${mediaDir}/${filename}`;
}

export async function ensureLocalMediaDir(mediaDir: string): Promise<string> {
  const dir = path.join(MEDIA_ROOT, mediaDir);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export async function saveMediaFile(
  mediaDir: string,
  filename: string,
  buffer: Buffer,
): Promise<string> {
  assertWritableStorage();

  if (isBlobStorageEnabled()) {
    const pathname = blobMediaPath(mediaDir, filename);
    const { put } = await getBlobClient();
    const blob = await put(pathname, buffer, {
      access: "public",
      contentType: "image/webp",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return blob.url;
  }

  const dir = await ensureLocalMediaDir(mediaDir);
  await fs.writeFile(path.join(dir, filename), buffer);
  return toLocalMediaPath(mediaDir, filename);
}

export async function deleteMediaUrl(url: string): Promise<void> {
  if (isBlobMediaUrl(url)) {
    try {
      const { del } = await getBlobClient();
      await del(url);
    } catch {
      // ignore missing blobs
    }
    return;
  }

  if (!isLocalMediaPath(url)) return;

  const file = path.join(process.cwd(), "public", url.replace(/^\//, ""));
  try {
    await fs.unlink(file);
  } catch {
    // ignore missing files
  }
}
