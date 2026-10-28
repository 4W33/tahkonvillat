import type { CollectionConfig, PayloadRequest } from "payload";
import { authenticated } from "../access";
import { toIsoDay } from "../fields/pricing";
import { revalidateHooks } from "../hooks/revalidate";

const dayOnly = { date: { pickerAppearance: "dayOnly" as const, displayFormat: "d.M.yyyy" } };

/** Käsin lisätyt varaukset (esim. suoraan sovitut), näkyvät kalenterissa varattuina. */
export const Reservations: CollectionConfig = {
  slug: "reservations",
  labels: { singular: "Varaus", plural: "Varaukset" },
  admin: {
    group: "Varaukset",
    useAsTitle: "guestName",
    defaultColumns: ["calendarKey", "startDate", "endDate", "guestName"],
    description: "Airbnb-varaukset tulevat kalenteriin automaattisesti. Tänne vain muualta tulleet varaukset.",
  },
  access: { read: authenticated, create: authenticated, update: authenticated, delete: authenticated },
  hooks: revalidateHooks,
  fields: [
    {
      name: "calendarKey",
      label: "Kohde (esim. villa-puolukka tai tahkon-teituli:46923155)",
      type: "text",
      required: true,
      validate: async (value: string | null | undefined, { req }: { req: PayloadRequest }) => {
        if (!value) return "Pakollinen";
        const [slug, unitId] = value.split(":");
        const { docs } = await req.payload.find({
          collection: "villas",
          where: { slug: { equals: slug } },
          depth: 0,
          limit: 1,
          req,
        });
        const villa = docs[0];
        const units = villa?.units ?? [];
        const ok = villa && (units.length ? units.some((u) => u.unitId === unitId) : !unitId);
        return ok || "Tuntematon kohde tai yksikkö";
      },
    },
    {
      type: "row",
      fields: [
        { name: "startDate", label: "Saapuminen", type: "date", required: true, admin: dayOnly },
        {
          name: "endDate",
          label: "Lähtö",
          type: "date",
          required: true,
          admin: dayOnly,
          validate: (value: unknown, { siblingData }) => {
            const end = toIsoDay(value);
            const start = toIsoDay((siblingData as { startDate?: unknown }).startDate);
            if (!end) return "Pakollinen";
            return !start || end > start || "Lähdön pitää olla saapumisen jälkeen";
          },
        },
      ],
    },
    { name: "guestName", label: "Vieras", type: "text" },
  ],
};
