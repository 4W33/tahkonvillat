import type { GlobalConfig } from "payload";
import fiMessages from "../../../messages/fi.json";
import { messagesToFields } from "../fields/messages-to-fields";
import { revalidateSite } from "../hooks/revalidate";

/** Yksi global per messages/fi.json-osio (Postgresin sarakeraja, ks. MAX_LOCALIZED_PER_GLOBAL). */
const SECTION_LABELS: Record<keyof typeof fiMessages, string> = {
  metadata: "Hakukoneet (sivuston nimi ja kuvaus)",
  common: "Yleiset",
  nav: "Valikko",
  footer: "Alatunniste",
  home: "Etusivu",
  villas: "Villat",
  apartments: "Asunnot",
  contact: "Yhteystiedot",
  faq: "Kysymykset (FAQ)",
  checkout: "Lähtöpäivän ohjeet",
  pricing: "Hinnat",
  reviews: "Arviot",
  privacy: "Tietosuoja",
  notFound: "Sivua ei löytynyt (404)",
};

export const SITE_TEXT_SECTIONS = Object.keys(SECTION_LABELS) as Array<keyof typeof fiMessages>;

export function siteTextSlug(section: string): string {
  return `texts-${section.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;
}

export const siteTextGlobals: GlobalConfig[] = SITE_TEXT_SECTIONS.map((section) => ({
  slug: siteTextSlug(section),
  label: SECTION_LABELS[section],
  admin: {
    group: "Sivuston tekstit",
    description:
      "Tyhjä kenttä = sivustolla näkyy oletusteksti. Vaihda kieli (FI/EN) yläreunasta.",
  },
  access: { read: () => true },
  hooks: { afterChange: [({ context }) => revalidateSite({ context })] },
  fields: messagesToFields(fiMessages[section] as Record<string, unknown>),
}));
