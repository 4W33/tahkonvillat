import type { CollectionConfig, Field } from "payload";
import { authenticated } from "../access";

/** Lomakkeiden kautta tulleet viestit. Julkiset reitit kirjoittavat `overrideAccess`-oikeudella. */
const access = { read: authenticated, create: authenticated, update: authenticated, delete: authenticated };

const ro = { readOnly: true };

const common: Field[] = [
  { name: "name", label: "Nimi", type: "text", required: true, admin: ro },
  { name: "email", label: "Sähköposti", type: "email", required: true, admin: ro },
  { name: "phone", label: "Puhelin", type: "text", admin: ro },
  { name: "message", label: "Viesti", type: "textarea", admin: ro },
  { name: "locale", label: "Kieli", type: "text", admin: { ...ro, position: "sidebar" } },
  { name: "read", label: "Käsitelty", type: "checkbox", defaultValue: false, admin: { position: "sidebar" } },
  {
    name: "notified",
    label: "Sähköposti-ilmoitus",
    type: "select",
    options: [
      { label: "Lähetetty", value: "sent" },
      { label: "Epäonnistui", value: "failed" },
      { label: "Ei käytössä", value: "off" },
    ],
    admin: { ...ro, position: "sidebar" },
  },
];

export const Contacts: CollectionConfig = {
  slug: "contacts",
  labels: { singular: "Yhteydenotto", plural: "Yhteydenotot" },
  admin: { group: "Viestit", useAsTitle: "name", defaultColumns: ["name", "email", "topic", "createdAt", "read"] },
  access,
  fields: [
    {
      name: "topic",
      label: "Aihe",
      type: "select",
      options: [
        { label: "Villa", value: "villa" },
        { label: "Asunto", value: "apartment" },
        { label: "Yleinen", value: "general" },
      ],
      admin: ro,
    },
    ...common,
  ],
};

export const Inquiries: CollectionConfig = {
  slug: "inquiries",
  labels: { singular: "Varaustiedustelu", plural: "Varaustiedustelut" },
  admin: { group: "Viestit", useAsTitle: "name", defaultColumns: ["name", "villaName", "checkIn", "createdAt", "read"] },
  access,
  fields: [
    { name: "villaSlug", label: "Kohteen tunnus", type: "text", admin: ro },
    { name: "villaName", label: "Kohde", type: "text", admin: ro },
    {
      type: "row",
      fields: [
        { name: "checkIn", label: "Saapuminen", type: "text", admin: ro },
        { name: "checkOut", label: "Lähtö", type: "text", admin: ro },
        { name: "guests", label: "Vieraita", type: "number", admin: ro },
      ],
    },
    ...common,
  ],
};

export function notifiedValue(flag: boolean | null | undefined): "sent" | "failed" | "off" {
  return flag === true ? "sent" : flag === false ? "failed" : "off";
}
