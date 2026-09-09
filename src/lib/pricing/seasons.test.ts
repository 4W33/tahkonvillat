import { describe, expect, it } from "vitest";
import {
  formatSeasonRange,
  getDisplayFromPrice,
  getUpcomingSeasons,
  hasAnyPrice,
  validateSeasons,
} from "./seasons";

const pricing = {
  fromPerNight: 200,
  currency: "EUR" as const,
  seasons: [
    { id: "a", start: "2026-09-12", end: "2026-09-30", pricePerNight: 250 },
    {
      id: "b",
      start: "2026-12-20",
      end: "2027-01-06",
      pricePerNight: 390,
      label: { fi: "Joulu", en: "Christmas" },
    },
    { id: "c", start: "2026-01-01", end: "2026-03-31", pricePerNight: 150 },
  ],
};

describe("getUpcomingSeasons", () => {
  it("pudottaa menneet ja järjestää alun mukaan", () => {
    expect(getUpcomingSeasons(pricing, "2026-09-09").map((s) => s.id)).toEqual(["a", "b"]);
  });
  it("kausi jonka end on tänään on vielä mukana", () => {
    expect(getUpcomingSeasons(pricing, "2026-09-30").map((s) => s.id)).toEqual(["a", "b"]);
  });
});

describe("getDisplayFromPrice", () => {
  it("pienin perushinnasta ja tulevista kausista", () => {
    expect(getDisplayFromPrice(pricing, "2026-09-09")).toBe(200);
    expect(getDisplayFromPrice({ currency: "EUR", seasons: pricing.seasons }, "2026-09-09")).toBe(
      250,
    );
  });
  it("ei hintoja → null", () => {
    expect(getDisplayFromPrice({ currency: "EUR" }, "2026-09-09")).toBeNull();
    expect(getDisplayFromPrice(null, "2026-09-09")).toBeNull();
    expect(getDisplayFromPrice({ currency: "EUR", fromPerNight: 0 }, "2026-09-09")).toBeNull();
  });
});

describe("validateSeasons", () => {
  it("ok-lista palauttaa null", () => {
    expect(validateSeasons(pricing.seasons)).toBeNull();
    expect(validateSeasons([])).toBeNull();
    expect(validateSeasons(undefined)).toBeNull();
  });
  it("loppu ennen alkua", () => {
    expect(
      validateSeasons([{ id: "x", start: "2026-09-30", end: "2026-09-12", pricePerNight: 1 }]),
    ).toMatch(/loppu/i);
  });
  it("hinta nolla tai negatiivinen", () => {
    expect(
      validateSeasons([{ id: "x", start: "2026-09-01", end: "2026-09-02", pricePerNight: 0 }]),
    ).toMatch(/hinta/i);
  });
  it("päällekkäiset kaudet", () => {
    expect(
      validateSeasons([
        { id: "x", start: "2026-09-01", end: "2026-09-10", pricePerNight: 1 },
        { id: "y", start: "2026-09-10", end: "2026-09-20", pricePerNight: 2 },
      ]),
    ).toMatch(/päällekkäi/i);
  });
  it("virheellinen päivämäärämuoto", () => {
    expect(
      validateSeasons([{ id: "x", start: "12.9.2026", end: "2026-09-30", pricePerNight: 1 }]),
    ).toMatch(/päivämäär/i);
  });
});

describe("formatSeasonRange", () => {
  it("sisältää päivät ja vuoden", () => {
    const fi = formatSeasonRange("2026-09-12", "2026-09-30", "fi");
    expect(fi).toContain("12");
    expect(fi).toContain("30");
    expect(fi).toContain("2026");
    const en = formatSeasonRange("2026-12-20", "2027-01-06", "en");
    expect(en).toContain("2026");
    expect(en).toContain("2027");
  });
});

describe("hasAnyPrice", () => {
  it("true jos perushinta tai kausia", () => {
    expect(hasAnyPrice({ currency: "EUR" })).toBe(false);
    expect(hasAnyPrice({ currency: "EUR", fromPerNight: 10 })).toBe(true);
    expect(hasAnyPrice({ currency: "EUR", seasons: pricing.seasons })).toBe(true);
  });
});
