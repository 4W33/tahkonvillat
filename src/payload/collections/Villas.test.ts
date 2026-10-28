import { existsSync } from "node:fs";
import type { Payload } from "payload";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// Local API embedded-Postgresia vasten (npm run db:dev). Ilman kantaa testit ohitetaan.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const hasDb = Boolean(process.env.DATABASE_URL && process.env.PAYLOAD_SECRET);

const SLUG = "testi-villa-vitest";
const context = { disableRevalidate: true };

function villaData(overrides: Record<string, unknown> = {}) {
  return {
    slug: SLUG,
    location: "tahko",
    guests: 4,
    bedrooms: 2,
    name: "Testivilla",
    description: "Kuvaus",
    imageAlt: "Kuva",
    icalUrl: "https://www.airbnb.fi/calendar/ical/1.ics?t=x",
    units: [{ unitId: "u1", name: "Yksikkö", guests: 2, bedrooms: 1, icalUrl: "https://www.airbnb.fi/calendar/ical/2.ics?t=y" }],
    ...overrides,
  };
}

describe.skipIf(!hasDb)("villas-kokoelma", () => {
  let payload: Payload;

  const cleanup = () =>
    payload.delete({ collection: "villas", where: { slug: { equals: SLUG } }, context });

  beforeAll(async () => {
    const { getPayload } = await import("payload");
    const { default: config } = await import("@/payload.config");
    payload = await getPayload({ config });
    await cleanup();
  }, 120_000);

  afterAll(async () => {
    if (payload) await cleanup();
  });

  it("anonyymi luku ei näe iCal-linkkejä", async () => {
    await payload.create({ collection: "villas", data: villaData() as never, context });
    const { docs } = await payload.find({
      collection: "villas",
      where: { slug: { equals: SLUG } },
      overrideAccess: false,
    });
    expect(docs).toHaveLength(1);
    expect(docs[0]).not.toHaveProperty("icalUrl");
    expect(docs[0].units?.[0]).not.toHaveProperty("icalUrl");
    await cleanup();
  });

  it("päällekkäiset kaudet hylätään suomenkielisellä virheellä", async () => {
    const pricing = {
      fromPerNight: 200,
      seasons: [
        { start: "2026-12-01", end: "2026-12-20", pricePerNight: 300 },
        { start: "2026-12-15", end: "2026-12-31", pricePerNight: 400 },
      ],
    };
    const error = await payload
      .create({ collection: "villas", data: villaData({ pricing }) as never, context })
      .catch((e: { data?: { errors?: { message: string }[] } }) => e);
    expect(JSON.stringify((error as { data?: unknown }).data)).toMatch(/Kaudet ovat päällekkäin/);
  });

  it("varauksen kalenteriavaimen pitää vastata kalenteria tarkasti", async () => {
    await payload.create({ collection: "villas", data: villaData() as never, context });
    const reservation = (calendarKey: string) =>
      payload.create({
        collection: "reservations",
        data: { calendarKey, startDate: "2027-01-10T12:00:00.000Z", endDate: "2027-01-12T12:00:00.000Z" },
        context,
      });
    for (const bad of [SLUG, `${SLUG}:`, `${SLUG}:u1:x`, `${SLUG}:u2`]) {
      await expect(reservation(bad), bad).rejects.toThrow();
    }
    const ok = await reservation(`${SLUG}:u1`);
    await payload.delete({ collection: "reservations", id: ok.id, context });
    await cleanup();
  });

  it("http-iCal-linkki hylätään", async () => {
    await expect(
      payload.create({
        collection: "villas",
        data: villaData({ icalUrl: "http://www.airbnb.fi/calendar/ical/1.ics" }) as never,
        context,
      }),
    ).rejects.toThrow();
  });
});
