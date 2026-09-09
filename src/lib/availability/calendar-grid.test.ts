import { describe, expect, it } from "vitest";
import { buildMonthCells, isBooked, shiftMonth } from "./calendar-grid";

describe("buildMonthCells", () => {
  it("syyskuu 2026 alkaa tiistaina → 1 täytesolu, 42 solua yhteensä", () => {
    const cells = buildMonthCells(2026, 8);
    expect(cells).toHaveLength(42);
    expect(cells[0].inMonth).toBe(false);
    expect(cells[1]).toEqual({ iso: "2026-09-01", day: 1, inMonth: true });
    expect(cells.filter((c) => c.inMonth)).toHaveLength(30);
  });

  it("maanantaina alkava kuukausi ei saa täytesoluja alkuun (kesäkuu 2026)", () => {
    expect(buildMonthCells(2026, 5)[0]).toEqual({ iso: "2026-06-01", day: 1, inMonth: true });
  });
});

describe("isBooked", () => {
  const ranges = [{ start: "2026-09-12", end: "2026-09-15", source: "airbnb" as const }];
  it("start mukana, end ei", () => {
    expect(isBooked("2026-09-12", ranges)).toBe(true);
    expect(isBooked("2026-09-14", ranges)).toBe(true);
    expect(isBooked("2026-09-15", ranges)).toBe(false);
    expect(isBooked("2026-09-11", ranges)).toBe(false);
  });
});

describe("shiftMonth", () => {
  it("kiertää vuoden yli", () => {
    expect(shiftMonth(2026, 11, 1)).toEqual({ year: 2027, month: 0 });
    expect(shiftMonth(2026, 0, -1)).toEqual({ year: 2025, month: 11 });
  });
});
