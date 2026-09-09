import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { isPrivateStore, storageAccess } from "./access-policy";

describe("storageAccess", () => {
  it("henkilötiedot ja salaiset linkit ovat yksityisiä", () => {
    expect(storageAccess("data/contacts.json")).toBe("private");
    expect(storageAccess("data/inquiries.json")).toBe("private");
    expect(storageAccess("data/reservations.json")).toBe("private");
    expect(storageAccess("data/ical-sources.json")).toBe("private");
  });

  it("julkinen sisältö on julkista", () => {
    expect(storageAccess("data/pricing.json")).toBe("public");
    expect(storageAccess("data/site-images.json")).toBe("public");
    expect(storageAccess("data/content/villa-puolukka.json")).toBe("public");
    expect(storageAccess("data/content/messages/fi.json")).toBe("public");
  });

  it("alkuviiva ei muuta tulosta", () => {
    expect(storageAccess("/data/contacts.json")).toBe("private");
    expect(isPrivateStore("/data/contacts.json")).toBe(true);
  });

  it("tuntematon polku on oletuksena julkinen", () => {
    expect(storageAccess("data/jotain-uutta.json")).toBe("public");
  });
});

function quoted(block: string): string[] {
  const out: string[] = [];
  const re = /"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(block)) !== null) out.push(m[1]);
  return out;
}

describe("seed-skripti käyttää samaa politiikkaa", () => {
  // seed-blob-storage.mjs ajetaan Nodella build-putken ulkopuolella eikä se voi
  // importata TS-moduulia. Tämä testi hajoaa, jos listat eriytyvät.
  it("scripts/seed-blob-storage.mjs private-lista täsmää access-policyyn", () => {
    const source = readFileSync("scripts/seed-blob-storage.mjs", "utf-8");
    const block = source.match(/const PRIVATE_PATHS = new Set\(\[([\s\S]*?)\]\)/);
    expect(block, "PRIVATE_PATHS puuttuu seed-skriptistä").not.toBeNull();

    const seedPrivate = quoted(block?.[1] ?? "").sort();
    expect(seedPrivate.length).toBeGreaterThan(0);
    for (const p of seedPrivate) expect(storageAccess(p)).toBe("private");

    const seeded = source.match(/const JSON_FILES = \[([\s\S]*?)\]/);
    const seededPaths = quoted(seeded?.[1] ?? "");
    const seededPrivate = seededPaths.filter((p) => storageAccess(p) === "private").sort();
    expect(seededPrivate).toEqual(seedPrivate);
  });
});
