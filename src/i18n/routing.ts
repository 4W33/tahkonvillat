import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fi", "en"],
  defaultLocale: "fi",
  localePrefix: "as-needed",
  pathnames: {
    "/": "/",
    "/villas": {
      fi: "/villat",
      en: "/villas",
    },
    "/apartments": {
      fi: "/asunnot",
      en: "/apartments",
    },
    "/contact": {
      fi: "/yhteystiedot",
      en: "/contact",
    },
    "/faq": "/faq",
    "/checkout": {
      fi: "/lahtopaivan-ohjeet",
      en: "/checkout-instructions",
    },
    "/privacy": {
      fi: "/tietosuoja",
      en: "/privacy",
    },
    "/villas/[slug]": {
      fi: "/villat/[slug]",
      en: "/villas/[slug]",
    },
  },
});

export type AppLocale = (typeof routing.locales)[number];

/** Tyyppivartija: kertoo onko merkkijono tuettu kieli. */
export function isAppLocale(value: string): value is AppLocale {
  return (routing.locales as readonly string[]).includes(value);
}
