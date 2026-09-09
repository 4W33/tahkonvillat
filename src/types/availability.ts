export type IcalSource = { url: string; updatedAt: string };
export type IcalSourceStore = Record<string, IcalSource>;

/** end on EKSKLUSIIVINEN (iCal DTEND -semantiikka): 2026-09-12..2026-09-15 = yöt 12, 13, 14. */
export type BookedRange = {
  start: string;
  end: string;
  source: "airbnb" | "manual";
};

export type AvailabilityStatus = "ok" | "unavailable" | "unconfigured";

export type Availability = {
  key: string;
  booked: BookedRange[];
  status: AvailabilityStatus;
};

export type CalendarKey = {
  key: string;
  propertySlug: string;
  unitId?: string;
  label: { fi: string; en: string };
};
