/**
 * Lazy-load @vercel/blob so local dev (no token) never bundles undici.
 */
type BlobModule = typeof import("@vercel/blob");

let blobModule: BlobModule | null = null;

export async function getBlobClient(): Promise<BlobModule> {
  if (!blobModule) {
    blobModule = await import("@vercel/blob");
  }
  return blobModule;
}
