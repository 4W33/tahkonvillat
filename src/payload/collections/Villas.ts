import type { CollectionConfig } from "payload";
import { siteConfig } from "@/lib/site.config";
import { AMENITY_OPTIONS } from "../fields/amenities";
import { pricingField } from "../fields/pricing";
import {
  capacityFields,
  icalUrlField,
  imageFields,
  ratingFields,
  syncedAtField,
} from "../fields/property";
import { revalidateHooks } from "../hooks/revalidate";

export const Villas: CollectionConfig = {
  slug: "villas",
  labels: { singular: "Villa", plural: "Villat" },
  admin: {
    group: "Sisältö",
    useAsTitle: "name",
    defaultColumns: ["name", "location", "guests", "updatedAt"],
    livePreview: {
      url: ({ data, locale, req }) =>
        `${req.origin || siteConfig.siteUrl}/${locale?.code === "en" ? "en/villas" : "villat"}/${data?.slug ?? ""}`,
    },
  },
  access: { read: () => true },
  hooks: revalidateHooks,
  fields: [
    {
      name: "slug",
      label: "Osoite (URL-tunnus)",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        position: "sidebar",
        description: "Sivun osoite, esim. villa-puolukka. Älä muuta julkaisun jälkeen.",
      },
    },
    {
      name: "location",
      label: "Sijainti",
      type: "select",
      required: true,
      options: [
        { label: "Tahko", value: "tahko" },
        { label: "Vantaa", value: "vantaa" },
        { label: "Helsinki", value: "helsinki" },
      ],
      admin: { position: "sidebar" },
    },
    { name: "name", label: "Nimi", type: "text", required: true, localized: true },
    { name: "description", label: "Lyhyt kuvaus", type: "textarea", localized: true },
    {
      name: "longDescription",
      label: "Pitkä kuvaus",
      type: "array",
      localized: true,
      labels: { singular: "Kappale", plural: "Kappaleet" },
      fields: [{ name: "paragraph", label: "Kappale", type: "textarea", required: true }],
    },
    capacityFields,
    ...imageFields,
    {
      name: "amenities",
      label: "Varustelu",
      type: "select",
      hasMany: true,
      options: AMENITY_OPTIONS.map(({ id, label }) => ({ label, value: id })),
    },
    icalUrlField,
    {
      name: "units",
      label: "Yksiköt (jos kohteessa on useampi erikseen varattava osa)",
      type: "array",
      labels: { singular: "Yksikkö", plural: "Yksiköt" },
      fields: [
        { name: "unitId", label: "Tunnus (Airbnb-ilmoituksen numero)", type: "text", required: true },
        { name: "name", label: "Nimi", type: "text", localized: true },
        capacityFields,
        icalUrlField,
      ],
    },
    pricingField,
    ...ratingFields,
    syncedAtField,
  ],
};
