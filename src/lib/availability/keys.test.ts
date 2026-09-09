import { describe, expect, it } from "vitest";
import { listCalendarKeys, parseCalendarKey } from "./keys";

const villas = [
  { slug: "villa-puolukka", name: { fi: "Villa Puolukka", en: "Villa Puolukka" } },
  {
    slug: "tahkon-teituli",
    name: { fi: "Tahkon Teituli", en: "Tahkon Teituli" },
    units: [
      { id: "a", name: { fi: "Teituli A", en: "Teituli A" }, guests: 4, bedrooms: 2 },
      { id: "8b", name: { fi: "Teituli 8B", en: "Teituli 8B" }, guests: 6, bedrooms: 2 },
    ],
  },
];

describe("listCalendarKeys", () => {
  it("villa ilman yksiköitä saa yhden avaimen", () => {
    const keys = listCalendarKeys(villas);
    expect(keys[0]).toEqual({
      key: "villa-puolukka",
      propertySlug: "villa-puolukka",
      label: { fi: "Villa Puolukka", en: "Villa Puolukka" },
    });
  });

  it("villa yksiköillä saa avaimen per yksikkö", () => {
    const keys = listCalendarKeys(villas).filter(
      (k) => k.propertySlug === "tahkon-teituli",
    );
    expect(keys.map((k) => k.key)).toEqual(["tahkon-teituli:a", "tahkon-teituli:8b"]);
    expect(keys[1].unitId).toBe("8b");
    expect(keys[1].label.fi).toBe("Teituli 8B");
  });
});

describe("parseCalendarKey", () => {
  it("jakaa slugin ja yksikön", () => {
    expect(parseCalendarKey("tahkon-teituli:8b")).toEqual({
      propertySlug: "tahkon-teituli",
      unitId: "8b",
    });
    expect(parseCalendarKey("villa-karpalo")).toEqual({ propertySlug: "villa-karpalo" });
  });
});
