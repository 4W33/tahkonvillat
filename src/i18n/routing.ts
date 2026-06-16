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
