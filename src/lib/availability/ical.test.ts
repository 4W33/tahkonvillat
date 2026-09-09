import { describe, expect, it } from "vitest";
import { addDays, mergeRanges, parseIcsToRanges } from "./ical";

const AIRBNB_ICS = [
  "BEGIN:VCALENDAR",
  "PRODID;X-RICAL-TZSOURCE=TZINFO:-//Airbnb Inc//Hosting Calendar 0.8.8//EN",
  "CALSCALE:GREGORIAN",
  "VERSION:2.0",
  "BEGIN:VEVENT",
  "DTEND;VALUE=DATE:20260915",
  "DTSTART;VALUE=DATE:20260912",
  "UID:abc123@airbnb.com",
  "SUMMARY:Reserved",
  "END:VEVENT",
  "BEGIN:VEVENT",
  "DTEND;VALUE=DATE:20261003",
  "DTSTART;VALUE=DATE:20261001",
  "UID:def456@airbnb.com",
  "SUMMARY:Airbnb (Not available)",
  "END:VEVENT",
  "END:VCALENDAR",
].join("\r\n");

describe("parseIcsToRanges", () => {
  it("lukee all-day VEVENTit väleiksi (end eksklusiivinen)", () => {
    expect(parseIcsToRanges(AIRBNB_ICS)).toEqual([
      { start: "2026-09-12", end: "2026-09-15", source: "airbnb" },
      { start: "2026-10-01", end: "2026-10-03", source: "airbnb" },
    ]);
  });

  it("DTEND puuttuu → yksi yö", () => {
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:x",
      "BEGIN:VEVENT",
      "DTSTART;VALUE=DATE:20260920",
      "UID:1",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    expect(parseIcsToRanges(ics)).toEqual([
      { start: "2026-09-20", end: "2026-09-21", source: "airbnb" },
    ]);
  });

  it("tyhjä syöte → tyhjä lista", () => {
    expect(parseIcsToRanges("")).toEqual([]);
    expect(parseIcsToRanges("   \n")).toEqual([]);
  });

  it("roska heittää virheen (kutsuja päättää tilan)", () => {
    expect(() => parseIcsToRanges("<html>login</html>")).toThrow();
  });
});

describe("mergeRanges", () => {
  it("yhdistää päällekkäiset ja vierekkäiset saman lähteen välit", () => {
    expect(
      mergeRanges([
        { start: "2026-09-10", end: "2026-09-12", source: "airbnb" },
        { start: "2026-09-12", end: "2026-09-14", source: "airbnb" },
        { start: "2026-09-13", end: "2026-09-15", source: "airbnb" },
        { start: "2026-09-20", end: "2026-09-21", source: "airbnb" },
      ]),
    ).toEqual([
      { start: "2026-09-10", end: "2026-09-15", source: "airbnb" },
      { start: "2026-09-20", end: "2026-09-21", source: "airbnb" },
    ]);
  });

  it("eri lähteitä ei yhdistetä", () => {
    const out = mergeRanges([
      { start: "2026-09-10", end: "2026-09-12", source: "manual" },
      { start: "2026-09-11", end: "2026-09-13", source: "airbnb" },
    ]);
    expect(out).toHaveLength(2);
  });
});

describe("addDays", () => {
  it("laskee kuukauden yli", () => {
    expect(addDays("2026-09-30", 1)).toBe("2026-10-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });
});
