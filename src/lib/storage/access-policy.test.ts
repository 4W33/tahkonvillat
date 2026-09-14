import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { isPrivateStore, storageAccess } from "./access-policy";

describe("storageAccess", () => {
  it("kaikki tallennukset ovat yksityisiä (Vercel Blob: taso on kiinteä per säilö)", () => {
    for (const p of [
      "data/contacts.json",
      "data/inquiries.json",
      "data/reservations.json",
      "data/ical-sources.json",
      "data/pricing.json",
      "data/site-images.json",
      "data/content/villa-puolukka.json",
      "data/content/messages/fi.json",
      "/data/jotain-uutta.json",
    ]) {
      expect(storageAccess(p)).toBe("private");
      expect(isPrivateStore(p)).toBe(true);
    }
  });
});

/**
 * Etsii kohdat, joissa tallennustasoksi välitetään "public":
 * objektissa `access: "public"` tai viimeisenä argumenttina `fn(x, "public")`.
 * Ei hälytä kansionimistä kuten path.join(cwd, "public", "images").
 */
function findPublicAccess(source: string): string[] {
  const patterns = [/access:\s*["']public["']/g, /,\s*["']public["']\s*\)/g];
  return patterns.flatMap((re) => source.match(re) ?? []);
}

describe("findPublicAccess (tarkistimen oma testi)", () => {
  it("löytää molemmat virhemuodot, myös 13.9. seed-skriptiin jääneen", () => {
    expect(findPublicAccess('put(p, b, { access: "public" })')).toHaveLength(1);
    expect(findPublicAccess('await uploadJson(`data/content/${name}`, "public");')).toHaveLength(1);
  });
  it("ei hälytä kansionimestä eikä vertailusta", () => {
    expect(findPublicAccess('path.join(process.cwd(), "public", "images")')).toEqual([]);
    expect(findPublicAccess('useCache: access === "public"')).toEqual([]);
  });
});

describe("mikään koodi ei kirjoita julkiseen tasoon", () => {
  // Yksi yksityinen säilö: yksikin access: "public" kaataisi tallennuksen tuotannossa.
  const files = [
    "src/lib/storage/json.ts",
    "src/lib/storage/media.ts",
    "scripts/seed-blob-storage.mjs",
  ];
  for (const file of files) {
    it(`${file} ei välitä "public"-tasoa`, () => {
      const source = readFileSync(file, "utf-8");
      expect(findPublicAccess(source)).toEqual([]);
    });
  }
});
