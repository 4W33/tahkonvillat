import { describe, expect, it } from "vitest";
import { toApartment, toPricing, toVilla } from "./payload-mappers";

const villaDoc = {
  slug: "villa-x",
  location: "tahko",
  guests: 6,
  bedrooms: 3,
  name: { fi: "Villa X", en: "Villa X en" },
  description: { fi: "Kuvaus", en: "Description" },
  imageAlt: { fi: "Kuva", en: "Image" },
  longDescription: { fi: [{ paragraph: "Yksi" }, { paragraph: "Kaksi" }], en: [{ paragraph: "One" }] },
  image: { url: "/media/main.jpg" },
  gallery: [{ url: "/media/a.jpg" }, { url: "/media/b.jpg" }],
  amenities: ["sauna", "wifi"],
  units: [{ unitId: "123", name: { fi: "A", en: "A en" }, guests: 4, bedrooms: 2 }],
  ratingAverage: 4.9,
  ratingCount: 12,
  reviews: [{ comment: "Hyvä", author: "Juho", rating: 5, date: "helmikuu 2024" }],
};

describe("toVilla", () => {
  it("lokalisoitu dokumentti → Villa", () => {
    const villa = toVilla(villaDoc);
    expect(villa.name).toEqual({ fi: "Villa X", en: "Villa X en" });
    expect(villa.longDescription).toEqual({ fi: ["Yksi", "Kaksi"], en: ["One"] });
    expect(villa.image).toBe("/media/main.jpg");
    expect(villa.gallery).toEqual(["/media/a.jpg", "/media/b.jpg"]);
    expect(villa.units).toEqual([
      { id: "123", name: { fi: "A", en: "A en" }, guests: 4, bedrooms: 2 },
    ]);
    expect(villa.reviews?.[0]).toEqual({ comment: "Hyvä", author: "Juho", rating: 5, date: "helmikuu 2024" });
  });

  it("poistettu media ei kaada: image '' ja gallerian tyhjät pois", () => {
    const villa = toVilla({ ...villaDoc, image: null, gallery: [null, { url: "/a" }, 7] });
    expect(villa.image).toBe("");
    expect(villa.gallery).toEqual(["/a"]);
  });

  it("puuttuva englanninkielinen nimi → suomi, muut tyhjiä", () => {
    const villa = toVilla({ ...villaDoc, name: { fi: "Vain fi" }, units: undefined, longDescription: null });
    expect(villa.name).toEqual({ fi: "Vain fi", en: "Vain fi" });
    expect(villa.longDescription).toEqual({ fi: [], en: [] });
    expect(villa.units).toBeUndefined();
  });
});

describe("toApartment", () => {
  it("apartmentId → id, galleria ilman kuvia = pääkuva", () => {
    const apt = toApartment({
      apartmentId: "vantaa-1",
      location: "vantaa",
      name: { fi: "Asunto", en: "Apartment" },
      area: { fi: "Tikkurila", en: "Tikkurila" },
      imageAlt: { fi: "k", en: "i" },
      image: { url: "/m.jpg" },
      gallery: [],
    });
    expect(apt.id).toBe("vantaa-1");
    expect(apt.gallery).toEqual(["/m.jpg"]);
    expect(apt.description).toBeUndefined();
  });
});

describe("toPricing", () => {
  it("päivämäärät VVVV-KK-PP, tyhjä hinnasto → null", () => {
    expect(toPricing(undefined)).toBeNull();
    expect(toPricing({ fromPerNight: null, seasons: [] })).toBeNull();
    expect(
      toPricing({
        fromPerNight: 200,
        seasons: [
          { start: "2026-12-01T12:00:00.000Z", end: "2026-12-31T12:00:00.000Z", pricePerNight: 300, label: { fi: "Joulu", en: "Christmas" } },
        ],
      }),
    ).toEqual({
      fromPerNight: 200,
      currency: "EUR",
      seasons: [
        { id: "2026-12-01", start: "2026-12-01", end: "2026-12-31", pricePerNight: 300, label: { fi: "Joulu", en: "Christmas" } },
      ],
    });
  });
});
