import ICAL from "ical.js";
import type { BookedRange } from "@/types/availability";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** ICAL.Time → YYYY-MM-DD kalenterin omassa päivämäärässä (ei aikavyöhykesiirtoa). */
function toIsoDate(time: { year: number; month: number; day: number }): string {
  return `${time.year}-${pad(time.month)}-${pad(time.day)}`;
}

export function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Yhdistää päällekkäiset/vierekkäiset saman lähteen välit. Palauttaa uuden, järjestetyn listan. */
export function mergeRanges(ranges: BookedRange[]): BookedRange[] {
  const sorted = [...ranges].sort(
    (a, b) => a.start.localeCompare(b.start) || a.end.localeCompare(b.end),
  );
  const out: BookedRange[] = [];
  for (const range of sorted) {
    const last = out[out.length - 1];
    if (last && last.source === range.source && range.start <= last.end) {
      if (range.end > last.end) last.end = range.end;
    } else {
      out.push({ ...range });
    }
  }
  return out;
}

/**
 * Jäsentää iCal-tekstin varatuiksi väleiksi. Kaikki VEVENTit tulkitaan varatuiksi
 * (Airbnb: "Reserved", "Airbnb (Not available)"). Heittää, jos syöte ei ole iCal.
 */
export function parseIcsToRanges(ics: string): BookedRange[] {
  if (!ics.trim()) return [];

  const jcal = ICAL.parse(ics);
  // Yksi VCALENDAR → ["vcalendar", props, comps]; useita → taulukko taulukoita.
  const rootJcal = Array.isArray(jcal[0]) ? jcal[0] : jcal;
  const root = new ICAL.Component(rootJcal as ConstructorParameters<typeof ICAL.Component>[0]);
  const events = root.getAllSubcomponents("vevent");

  const ranges: BookedRange[] = [];
  for (const component of events) {
    const event = new ICAL.Event(component);
    if (!event.startDate) continue;
    const start = toIsoDate(event.startDate);
    let end = event.endDate ? toIsoDate(event.endDate) : addDays(start, 1);
    if (end <= start) end = addDays(start, 1);
    ranges.push({ start, end, source: "airbnb" });
  }

  return mergeRanges(ranges);
}
