import type { Field } from "payload";
import { isValidIcalUrl } from "@/lib/availability/validate-url";
import { authenticatedField } from "../access";

/** Tokenillinen Airbnb-linkki: vain kirjautuneille, ei koskaan julkiseen API-vastaukseen. */
export const icalUrlField: Field = {
  name: "icalUrl",
  label: "Airbnb-kalenterin iCal-linkki",
  type: "text",
  access: { read: authenticatedField },
  validate: (value: unknown) =>
    !value || (typeof value === "string" && isValidIcalUrl(value)) || "Linkin pitää alkaa https://",
  admin: { description: "Airbnb → Kalenteri → Vie kalenteri. Tyhjä = kalenteri ei näy sivulla." },
};

export const imageFields: Field[] = [
  { name: "image", label: "Pääkuva", type: "upload", relationTo: "media" },
  { name: "gallery", label: "Kuvagalleria", type: "upload", relationTo: "media", hasMany: true },
  { name: "imageAlt", label: "Pääkuvan kuvaus", type: "text", localized: true },
];

export const ratingFields: Field[] = [
  {
    type: "row",
    fields: [
      { name: "ratingAverage", label: "Arvosana (Airbnb)", type: "number", min: 0, max: 5 },
      { name: "ratingCount", label: "Arvioiden määrä", type: "number", min: 0 },
    ],
  },
  {
    name: "reviews",
    label: "Arviot",
    type: "array",
    labels: { singular: "Arvio", plural: "Arviot" },
    fields: [
      { name: "comment", label: "Arvio", type: "textarea", required: true },
      { name: "author", label: "Kirjoittaja", type: "text" },
      { name: "rating", label: "Tähdet", type: "number", min: 0, max: 5 },
      { name: "date", label: "Päivämäärä", type: "text" },
    ],
  },
];

export const capacityFields: Field = {
  type: "row",
  fields: [
    { name: "guests", label: "Vieraita", type: "number", min: 1 },
    { name: "bedrooms", label: "Makuuhuoneita", type: "number", min: 0 },
  ],
};

export const syncedAtField: Field = {
  name: "syncedAt",
  label: "Airbnb-tiedot päivitetty",
  type: "date",
  admin: { readOnly: true, position: "sidebar" },
};
