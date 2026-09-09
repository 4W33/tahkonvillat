import { promises as fs } from "fs";
import path from "path";
import { storageAccess } from "@/lib/storage/access-policy";
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

function isNotFound(error: unknown): boolean {
  const name = error instanceof Error ? error.name : "";
  const message = error instanceof Error ? error.message : String(error);
  return name === "BlobNotFoundError" || /not\s*found/i.test(message);
}

/**
 * Yksityinen blob vaatii autentikoinnin: `head()` + tavallinen `fetch(downloadUrl)`
 * ei riitä, vaan sisältö luetaan `get(pathname, { access: "private" })` -kutsulla,
 * joka käyttää BLOB_READ_WRITE_TOKENia.
 */
async function readBlobJson<T>(
  relativePath: string,
  access: "public" | "private",
): Promise<T | null> {
  const pathname = blobJsonPath(relativePath);
  const { get } = await getBlobClient();

  const result = await get(pathname, { access, useCache: access === "public" });
  if (!result || result.statusCode !== 200 || !result.stream) return null;

  return (await new Response(result.stream).json()) as T;
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

/**
 * Lukee tallennuksen Blobista (tuotanto) tai paikallisesta `data/`-kansiosta (kehitys).
 *
 * Julkinen sisältö: jos blobia ei ole, palataan repon mukana tulevaan oletukseen.
 * Yksityinen sisältö (lomakeviestit, varaukset, iCal-linkit): puuttuva blob
 * tarkoittaa "ei vielä mitään tallennettua" ja palataan paikalliseen tiedostoon,
 * mutta MUU virhe heitetään eteenpäin. Muuten hakuvirhe näyttäisi hiljaa repoon
 * committoidun vanhan datan ikään kuin se olisi ajantasainen.
 */
export async function readStoreJson<T>(relativePath: string): Promise<T | null> {
  if (isBlobStorageEnabled()) {
    const access = storageAccess(relativePath);
    try {
      const remote = await readBlobJson<T>(relativePath, access);
      if (remote !== null) return remote;
    } catch (error) {
      if (access === "private" && !isNotFound(error)) {
        throw new Error(
          `Tallennuksen luku epäonnistui (${relativePath}): ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
      console.error(`[storage] ${relativePath}:`, error);
    }
  }

  return readLocalJson<T>(relativePath);
}

export async function writeStoreJson(
  relativePath: string,
  data: unknown,
): Promise<void> {
  assertWritableStorage();

  if (isBlobStorageEnabled()) {
    await writeBlobJson(relativePath, data, storageAccess(relativePath));
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
