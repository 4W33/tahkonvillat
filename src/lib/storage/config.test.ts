import { afterEach, describe, expect, it } from "vitest";
import {
  isAllowedMediaPathname,
  isBlobMediaUrl,
  isBlobStorageEnabled,
  mediaPathnameFromUrl,
  mediaRouteUrl,
} from "./config";

const ENV_KEYS = ["BLOB_READ_WRITE_TOKEN", "BLOB_STORE_ID"] as const;
const saved = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));

afterEach(() => {
  for (const k of ENV_KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

describe("isBlobStorageEnabled", () => {
  it("pois päältä ilman muuttujia", () => {
    delete process.env.BLOB_READ_WRITE_TOKEN;
    delete process.env.BLOB_STORE_ID;
    expect(isBlobStorageEnabled()).toBe(false);
  });

  it("päällä staattisella tokenilla", () => {
    delete process.env.BLOB_STORE_ID;
    process.env.BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_x";
    expect(isBlobStorageEnabled()).toBe(true);
  });

  it("päällä pelkällä BLOB_STORE_ID:llä (Vercel lisää OIDC:n kanssa, ei tokenia)", () => {
    delete process.env.BLOB_READ_WRITE_TOKEN;
    process.env.BLOB_STORE_ID = "store_abc";
    expect(isBlobStorageEnabled()).toBe(true);
  });
});

describe("mediaRouteUrl / mediaPathnameFromUrl", () => {
  it("muuntaa blob-polun sivuston reitiksi ja takaisin", () => {
    const pathname = "media/properties/villa-puolukka/1b2c3d4e-aaaa-bbbb-cccc-1234567890ab.webp";
    const url = mediaRouteUrl(pathname);
    expect(url).toBe(
      "/api/media/properties/villa-puolukka/1b2c3d4e-aaaa-bbbb-cccc-1234567890ab.webp",
    );
    expect(mediaPathnameFromUrl(url)).toBe(pathname);
  });

  it("muut osoitteet eivät ole mediareittejä", () => {
    expect(mediaPathnameFromUrl("/images/properties/villa-puolukka/01.jpg")).toBeNull();
    expect(mediaPathnameFromUrl("https://example.com/api/media/properties/a/b.webp")).toBeNull();
  });
});

describe("isAllowedMediaPathname", () => {
  it("sallii kohteen kuvat", () => {
    expect(isAllowedMediaPathname("media/properties/villa-puolukka/abc-123.webp")).toBe(true);
    expect(isAllowedMediaPathname("media/properties/site/kuva.jpg")).toBe(true);
  });

  it("estää yksityisen datan lukemisen kuvareitin kautta", () => {
    expect(isAllowedMediaPathname("store/data/contacts.json")).toBe(false);
    expect(isAllowedMediaPathname("media/../store/data/contacts.json")).toBe(false);
    expect(isAllowedMediaPathname("media/properties/villa-puolukka/../../store/data/x.webp")).toBe(false);
    expect(isAllowedMediaPathname("media/properties/villa-puolukka/salaisuus.json")).toBe(false);
    expect(isAllowedMediaPathname("media/properties/a/b/c.webp")).toBe(false);
  });
});

describe("isBlobMediaUrl", () => {
  it("tunnistaa uuden reittimuodon ja vanhan julkisen blob-osoitteen", () => {
    expect(isBlobMediaUrl("/api/media/properties/villa-puolukka/x.webp")).toBe(true);
    expect(isBlobMediaUrl("https://abc.public.blob.vercel-storage.com/media/x.webp")).toBe(true);
    expect(isBlobMediaUrl("/images/properties/villa-puolukka/01.jpg")).toBe(false);
  });
});
