/**
 * Per-site configuration — single place for brand, properties, and feature flags.
 * Future agency template: copy this file per client deploy.
 */
export const siteConfig = {
  brand: {
    name: "Tahkon Villat",
    logo: "/images/tahkonvillat-logo.png",
  },
  contact: {
    email: "pellonkulma.apartments@gmail.com",
  },
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://tahkonvillat.fi",
  properties: {
    villaSlugs: [
      "villa-puolukka",
      "villa-karpalo",
      "tahkon-teituli",
    ] as const,
    apartmentIds: [
      "vantaa-1",
      "vantaa-2",
      "vantaa-3",
      "vantaa-4",
      "helsinki-1",
    ] as const,
  },
  modules: {
    properties: true,
    calendar: true,
    pricing: true,
    inbox: true,
  },
} as const;

export type SiteConfig = typeof siteConfig;
