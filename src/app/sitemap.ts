import type { MetadataRoute } from "next";
import { getVillaSlugs } from "@/lib/content/villas";
import { routing } from "@/i18n/routing";
import { absoluteUrl } from "@/lib/seo";

const staticPaths = [
  "",
  "/villas",
  "/apartments",
  "/contact",
  "/faq",
  "/checkout",
  "/privacy",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const villaSlugs = await getVillaSlugs();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const path of staticPaths) {
      entries.push({
        url: absoluteUrl(locale, path),
        lastModified: new Date(),
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1 : 0.8,
      });
    }

    for (const slug of villaSlugs) {
      entries.push({
        url: absoluteUrl(locale, `/villas/${slug}`),
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.9,
      });
    }
  }

  return entries;
}
