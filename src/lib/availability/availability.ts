import { readIcalSources } from "@/lib/data/ical-sources-store";
import { readReservations } from "@/lib/data/reservation-store";
import type {
  Availability,
  BookedRange,
  IcalSourceStore,
} from "@/types/availability";
import type { Reservation } from "@/types/villa";
import { mergeRanges, parseIcsToRanges } from "./ical";
import { parseCalendarKey } from "./keys";

/** 3 h — sama kuin Airbnbn oma kalenteripäivitysväli. Ohjaa myös villasivun ISR-aikaa. */
export const REVALIDATE_SECONDS = 10800;

export async function fetchIcsText(
  url: string,
  opts: { noStore?: boolean } = {},
): Promise<string> {
  const response = await fetch(url, {
    headers: { accept: "text/calendar, text/plain;q=0.8, */*;q=0.5" },
    ...(opts.noStore
      ? { cache: "no-store" as const }
      : { next: { revalidate: REVALIDATE_SECONDS } }),
  });
  if (!response.ok) {
    throw new Error(`iCal fetch failed: HTTP ${response.status}`);
  }
  return response.text();
}

export type AvailabilityDeps = {
  fetchIcs: (url: string) => Promise<string>;
  readSources: () => Promise<IcalSourceStore>;
  readReservations: () => Promise<Reservation[]>;
};

const defaultDeps: AvailabilityDeps = {
  fetchIcs: (url) => fetchIcsText(url),
  readSources: readIcalSources,
  readReservations,
};

function manualRanges(reservations: Reservation[], propertySlug: string): BookedRange[] {
  return reservations
    .filter((r) => r.propertySlug === propertySlug)
    .map((r) => ({ start: r.startDate, end: r.endDate, source: "manual" as const }));
}

/**
 * iCal-varaukset + adminin käsivaraukset yhdeksi listaksi.
 * Virhetilanteessa palautetaan status "unavailable" JA käsivaraukset —
 * ei koskaan tyhjää listaa, joka näyttäisi kaikki päivät vapaina.
 */
export async function getAvailability(
  key: string,
  overrides: Partial<AvailabilityDeps> = {},
): Promise<Availability> {
  const deps = { ...defaultDeps, ...overrides };
  const { propertySlug } = parseCalendarKey(key);
  const [sources, reservations] = await Promise.all([
    deps.readSources(),
    deps.readReservations(),
  ]);
  const manual = manualRanges(reservations, propertySlug);
  const source = sources[key];

  if (!source?.url) {
    return { key, booked: mergeRanges(manual), status: "unconfigured" };
  }

  try {
    const ics = await deps.fetchIcs(source.url);
    const airbnb = parseIcsToRanges(ics);
    return { key, booked: mergeRanges([...airbnb, ...manual]), status: "ok" };
  } catch (error) {
    console.error(
      `[availability] ${key}: ${error instanceof Error ? error.message : String(error)}`,
    );
    return { key, booked: mergeRanges(manual), status: "unavailable" };
  }
}
