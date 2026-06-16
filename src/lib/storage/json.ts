import { promises as fs } from "fs";
import path from "path";
import { getBlobClient } from "@/lib/storage/blob-client";
import {
  assertWritableStorage,
  blobJsonPath,
  isBlobStorageEnabled,
} from "@/lib/storage/config";

function localPath(relativePath: string): string {
  return path.join(process.cwd(), relativePath.replace(/^\/+/, ""));
}

async function readLocalJson<T>(relativePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(localPath(relativePath), "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeLocalJson(
  relativePath: string,
  data: unknown,
): Promise<void> {
  const file = localPath(relativePath);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf-8");
}

async function readBlobJson<T>(relativePath: string): Promise<T | null> {
  const pathname = blobJsonPath(relativePath);

  try {
    const { head } = await getBlobClient();
    const meta = await head(pathname);
    const response = await fetch(meta.downloadUrl);
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function writeBlobJson(
  relativePath: string,
  data: unknown,
  access: "public" | "private",
): Promise<void> {
  const pathname = blobJsonPath(relativePath);
  const { put } = await getBlobClient();

  await put(pathname, JSON.stringify(data, null, 2), {
    access,
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

export async function readStoreJson<T>(relativePath: string): Promise<T | null> {
  if (isBlobStorageEnabled()) {
    const remote = await readBlobJson<T>(relativePath);
    if (remote !== null) return remote;
  }

  return readLocalJson<T>(relativePath);
}

export async function writeStoreJson(
  relativePath: string,
  data: unknown,
  options?: { access?: "public" | "private" },
): Promise<void> {
  assertWritableStorage();
  const access = options?.access ?? "private";

  if (isBlobStorageEnabled()) {
    await writeBlobJson(relativePath, data, access);
    return;
  }

  await writeLocalJson(relativePath, data);
}

export async function deleteStoreJson(relativePath: string): Promise<void> {
  if (!isBlobStorageEnabled()) return;

  try {
    const { head, del } = await getBlobClient();
    const meta = await head(blobJsonPath(relativePath));
    await del(meta.url);
  } catch {
    // ignore missing blobs
  }
}
