import type { CollectionConfig } from "payload";
import { siteConfig } from "@/lib/site.config";
import { pricingField } from "../fields/pricing";
import { capacityFields, imageFields, ratingFields, syncedAtField } from "../fields/property";
import { revalidateHooks } from "../hooks/revalidate";

export const Apartments: CollectionConfig = {
  slug: "apartments",
  labels: { singular: "Asunto", plural: "Asunnot" },
  admin: {
    group: "Sisältö",
    useAsTitle: "name",
    defaultColumns: ["name", "location", "area", "updatedAt"],
    livePreview: {
      url: ({ locale, req }) => `${req.origin || siteConfig.siteUrl}/${locale?.code === "en" ? "en/apartments" : "asunnot"}`,
    },
  },
  access: { read: () => true },
  hooks: revalidateHooks,
  fields: [
    {
      name: "apartmentId",
      label: "Tunnus",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: { position: "sidebar", description: "Esim. vantaa-1. Älä muuta julkaisun jälkeen." },
    },
    {
      name: "location",
      label: "Sijainti",
      type: "select",
      required: true,
      options: [
        { label: "Vantaa", value: "vantaa" },
        { label: "Helsinki", value: "helsinki" },
      ],
      admin: { position: "sidebar" },
    },
    { name: "name", label: "Nimi", type: "text", required: true, localized: true },
    { name: "area", label: "Alue", type: "text", localized: true },
    { name: "description", label: "Kuvaus", type: "textarea", localized: true },
    capacityFields,
    ...imageFields,
    pricingField,
    ...ratingFields,
    syncedAtField,
  ],
};
