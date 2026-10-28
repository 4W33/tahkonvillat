import type { Field, GroupField } from "payload";
import { validateSeasons } from "@/lib/pricing/seasons";

/** Payloadin date-kenttä on ISO-aikaleima; dayOnly-valitsin tallentaa klo 12, joten päivä = 10 ensimmäistä merkkiä. */
export function toIsoDay(value: unknown): string | undefined {
  return typeof value === "string" ? value.slice(0, 10) : undefined;
}

const dayField = (name: string, label: string): Field => ({
  name,
  label,
  type: "date",
  required: true,
  admin: { date: { pickerAppearance: "dayOnly", displayFormat: "d.M.yyyy" } },
});

export const pricingField: GroupField = {
  name: "pricing",
  label: "Hinnat",
  type: "group",
  fields: [
    { name: "fromPerNight", label: "Perushinta alkaen (€ / yö)", type: "number", min: 0 },
    {
      name: "seasons",
      label: "Kausihinnat",
      type: "array",
      labels: { singular: "Kausi", plural: "Kaudet" },
      validate: (rows: unknown) => {
        const seasons = Array.isArray(rows)
          ? rows.map((r: Record<string, unknown>) => ({ ...r, start: toIsoDay(r.start), end: toIsoDay(r.end) }))
          : rows;
        return validateSeasons(seasons) ?? true;
      },
      fields: [
        { type: "row", fields: [dayField("start", "Alkaa"), dayField("end", "Päättyy (viimeinen yö mukaan lukien)")] },
        { name: "pricePerNight", label: "Hinta (€ / yö)", type: "number", required: true, min: 1 },
        { name: "label", label: "Nimi (esim. Joulu)", type: "text", localized: true },
      ],
    },
  ],
};
