/**
 * Blob on käytössä, jos jompikumpi tunnistautumistapa on saatavilla:
 * staattinen BLOB_READ_WRITE_TOKEN (lisätään kun säilö luodaan projektille)
 * tai BLOB_STORE_ID (lisätään kun olemassa oleva säilö yhdistetään projektiin;
 * SDK hakee silloin VERCEL_OIDC_TOKENin itse).
 */
export function isBlobStorageEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
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
      "Blob-tallennus puuttuu: luo Vercel-projektiin yksityinen (Private) Blob-säilö. Ilman sitä adminin tallennukset ja lomakkeet eivät toimi tuotannossa.",
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

/**
 * Kuvat ovat yksityisessä säilössä, joten niillä ei ole julkista osoitetta.
 * Ne näytetään sivuston oman reitin kautta: /api/media/properties/<kohde>/<tiedosto>.
 */
export const MEDIA_ROUTE_PREFIX = "/api/media/";

export function mediaRouteUrl(pathname: string): string {
  return `${MEDIA_ROUTE_PREFIX}${pathname.replace(/^media\//, "")}`;
}

export function mediaPathnameFromUrl(url: string): string | null {
  if (!url.startsWith(MEDIA_ROUTE_PREFIX)) return null;
  return `media/${url.slice(MEDIA_ROUTE_PREFIX.length)}`;
}

/**
 * Kuvareitti saa lukea VAIN kohteiden kuvia. Samassa yksityisessä säilössä on
 * lomakeviestejä ja varauksia, joten polku tarkistetaan tiukasti: ei `..`,
 * ei muita kansioita, vain kuvapäätteet, täsmälleen media/properties/<kohde>/<tiedosto>.
 */
export function isAllowedMediaPathname(pathname: string): boolean {
  if (pathname.includes("..")) return false;
  return /^media\/properties\/[a-z0-9-]+\/[A-Za-z0-9_-][A-Za-z0-9._-]*\.(webp|jpe?g|png|avif)$/.test(
    pathname,
  );
}

export function isBlobMediaUrl(url: string): boolean {
  return url.startsWith(MEDIA_ROUTE_PREFIX) || url.includes(".blob.vercel-storage.com/");
}

export function isLocalMediaPath(url: string): boolean {
  return url.startsWith("/images/properties/");
}
