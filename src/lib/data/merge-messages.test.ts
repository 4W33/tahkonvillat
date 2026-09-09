import { describe, expect, it } from "vitest";
import { mergeMessages } from "./merge-messages";

const template = {
  home: { hero: { title: "Oletus", cta: "Tutustu" }, steps: ["a", "b"] },
  pricing: { fromPerNight: "alkaen {price}", seasonsTitle: "Hinnat kausittain" },
};

describe("mergeMessages", () => {
  it("tallennettu arvo voittaa kun tyyppi täsmää", () => {
    const stored = { home: { hero: { title: "Oma otsikko" } } };
    const out = mergeMessages(template, stored);
    expect(out.home.hero.title).toBe("Oma otsikko");
    expect(out.home.hero.cta).toBe("Tutustu");
  });

  it("templaten uudet avaimet tulevat mukaan vaikka tallennetusta puuttuvat", () => {
    const stored = { pricing: { fromPerNight: "from {price}" } };
    const out = mergeMessages(template, stored);
    expect(out.pricing.seasonsTitle).toBe("Hinnat kausittain");
    expect(out.pricing.fromPerNight).toBe("from {price}");
  });

  it("tallennetun ylimääräiset avaimet pudotetaan", () => {
    const stored = { home: { hero: { title: "x", vanha: "poistettu" } } };
    const out = mergeMessages(template, stored) as unknown as Record<
      string,
      Record<string, Record<string, string>>
    >;
    expect(out.home.hero.vanha).toBeUndefined();
  });

  it("merkkijonolista otetaan tallennetusta vain jos se on merkkijonolista", () => {
    expect(mergeMessages(template, { home: { steps: ["x"] } }).home.steps).toEqual(["x"]);
    expect(mergeMessages(template, { home: { steps: "ei lista" } }).home.steps).toEqual([
      "a",
      "b",
    ]);
  });

  it("null/undefined tallennettu palauttaa templaten", () => {
    expect(mergeMessages(template, null)).toEqual(template);
    expect(mergeMessages(template, undefined)).toEqual(template);
  });
});
