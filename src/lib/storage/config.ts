export function isBlobStorageEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function isProductionDeploy(): boolean {
  return process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
}

const DEFAULT_DEV_SESSION = "tahkon-villat-admin-session-2026";

export function assertProductionSecrets(): void {
  if (!isProductionDeploy()) return;

  const password = process.env.ADMIN_PASSWORD?.trim();
  const sessionToken = process.env.ADMIN_SESSION_TOKEN?.trim();

  if (!password) {
    throw new Error("ADMIN_PASSWORD is required in production");
  }

  if (!sessionToken || sessionToken === DEFAULT_DEV_SESSION) {
    throw new Error("ADMIN_SESSION_TOKEN must be set to a unique secret in production");
  }
}

export function assertWritableStorage(): void {
  if (isProductionDeploy() && !isBlobStorageEnabled()) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is required for admin writes on Vercel. Enable Blob storage and add the token to environment variables.",
    );
  }
}

export const BLOB_JSON_PREFIX = "store";

export function blobJsonPath(relativePath: string): string {
  return `${BLOB_JSON_PREFIX}/${relativePath.replace(/^\/+/, "")}`;
}

export function blobMediaPath(mediaDir: string, filename: string): string {
  return `media/properties/${mediaDir}/${filename}`;
}

export function isBlobMediaUrl(url: string): boolean {
  return url.includes(".blob.vercel-storage.com/");
}

export function isLocalMediaPath(url: string): boolean {
  return url.startsWith("/images/properties/");
}
