import { describe, expect, it } from "vitest";
import { getAvailability } from "./availability";

const ICS = [
  "BEGIN:VCALENDAR",
  "VERSION:2.0",
  "PRODID:x",
  "BEGIN:VEVENT",
  "DTSTART;VALUE=DATE:20260912",
  "DTEND;VALUE=DATE:20260915",
  "UID:1",
  "END:VEVENT",
  "END:VCALENDAR",
].join("\r\n");

const sources = {
  "villa-puolukka": { url: "https://example.test/a.ics", updatedAt: "2026-09-09T00:00:00Z" },
};
const reservations = [
  { id: "r1", propertySlug: "villa-puolukka", startDate: "2026-09-20", endDate: "2026-09-22", guestName: "x" },
  { id: "r2", propertySlug: "tahkon-teituli", startDate: "2026-11-01", endDate: "2026-11-03", guestName: "y" },
];

describe("getAvailability", () => {
  it("yhdistää iCalin ja käsivaraukset, status ok", async () => {
    const out = await getAvailability("villa-puolukka", {
      fetchIcs: async () => ICS,
      readSources: async () => sources,
      readReservations: async () => reservations,
    });
    expect(out.status).toBe("ok");
    expect(out.booked).toEqual([
      { start: "2026-09-12", end: "2026-09-15", source: "airbnb" },
      { start: "2026-09-20", end: "2026-09-22", source: "manual" },
    ]);
  });

  it("lähde puuttuu → unconfigured, vain käsivaraukset", async () => {
    const out = await getAvailability("villa-karpalo", {
      fetchIcs: async () => {
        throw new Error("ei saa kutsua");
      },
      readSources: async () => sources,
      readReservations: async () => reservations,
    });
    expect(out.status).toBe("unconfigured");
    expect(out.booked).toEqual([]);
  });

  it("haku epäonnistuu → unavailable, käsivaraukset säilyvät, ei tyhjää 'kaikki vapaana'", async () => {
    const out = await getAvailability("villa-puolukka", {
      fetchIcs: async () => {
        throw new Error("503");
      },
      readSources: async () => sources,
      readReservations: async () => reservations,
    });
    expect(out.status).toBe("unavailable");
    expect(out.booked).toEqual([{ start: "2026-09-20", end: "2026-09-22", source: "manual" }]);
  });

  it("linkkien luku kaatuu → unavailable, ei 'kaikki vapaana'", async () => {
    const out = await getAvailability("villa-puolukka", {
      fetchIcs: async () => ICS,
      readSources: async () => {
        throw new Error("db down");
      },
      readReservations: async () => reservations,
    });
    expect(out.status).toBe("unavailable");
  });

  it("varaus yksikön avaimella näkyy vain sille yksikölle", async () => {
    const unitReservations = [
      { id: "r3", propertySlug: "tahkon-teituli:a", startDate: "2026-12-01", endDate: "2026-12-03", guestName: "z" },
    ];
    const deps = {
      fetchIcs: async () => ICS,
      readSources: async () => ({}),
      readReservations: async () => unitReservations,
    };
    expect((await getAvailability("tahkon-teituli:a", deps)).booked).toHaveLength(1);
    expect((await getAvailability("tahkon-teituli:b", deps)).booked).toHaveLength(0);
  });

  it("yksikköavain perii kohteen käsivaraukset", async () => {
    const out = await getAvailability("tahkon-teituli:8b", {
      fetchIcs: async () => ICS,
      readSources: async () => ({ "tahkon-teituli:8b": sources["villa-puolukka"] }),
      readReservations: async () => reservations,
    });
    expect(out.booked.some((r) => r.source === "manual" && r.start === "2026-11-01")).toBe(true);
  });
});
