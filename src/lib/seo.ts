import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { BRAND_NAME } from "@/lib/constants";
import { siteConfig } from "@/lib/site.config";

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? siteConfig.siteUrl;
}

type StaticPath =
  | "/"
  | "/villas"
  | "/apartments"
  | "/contact"
  | "/faq"
  | "/checkout"
  | "/privacy";

const STATIC_PATHS = new Set<StaticPath>([
  "/",
  "/villas",
  "/apartments",
  "/contact",
  "/faq",
  "/checkout",
  "/privacy",
]);

export function localePath(locale: string, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;

  const villaMatch = normalized.match(/^\/villas\/([^/]+)$/);
  const localized = villaMatch
    ? getPathname({
        locale,
        href: {
          pathname: "/villas/[slug]",
          params: { slug: villaMatch[1] },
        },
      })
    : STATIC_PATHS.has(normalized as StaticPath)
      ? getPathname({ locale, href: normalized as StaticPath })
      : normalized;

  // getPathname lisää kieliprefiksin itse (localePrefix "as-needed"); vain tuntematon polku prefiksoidaan käsin.
  if (villaMatch || STATIC_PATHS.has(normalized as StaticPath)) {
    return localized === "/" ? "" : localized;
  }
  return locale === routing.defaultLocale ? localized : `/${locale}${localized}`;
}

export function absoluteUrl(locale: string, path: string): string {
  const segment = localePath(locale, path);
  return `${getSiteUrl()}${segment || "/"}`;
}

type PageMeta = {
  locale: string;
  title: string;
  description: string;
  path?: string;
  absoluteTitle?: string;
  /** Jakokuva (polku tai täysi URL). Oletus: etusivun hero-kuva. */
  image?: string;
};

const DEFAULT_OG_IMAGE = "/images/properties/villa-karpalo/04.jpg";

export function buildPageMetadata({
  locale,
  title,
  description,
  path = "",
  absoluteTitle,
  image = DEFAULT_OG_IMAGE,
}: PageMeta): Metadata {
  const url = absoluteUrl(locale, path);
  const ogImage = image.startsWith("http") ? image : `${getSiteUrl()}${image}`;
  const resolvedTitle = absoluteTitle ?? title;

  return {
    title: absoluteTitle ? { absolute: absoluteTitle } : title,
    description,
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(
          routing.locales.map((loc) => [loc, absoluteUrl(loc, path)]),
        ),
        "x-default": absoluteUrl(routing.defaultLocale, path),
      },
    },
    openGraph: {
      type: "website",
      locale: locale === "fi" ? "fi_FI" : "en_US",
      url,
      siteName: BRAND_NAME,
      title: resolvedTitle,
      description,
      images: [{ url: ogImage, alt: resolvedTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
      images: [ogImage],
    },
  };
}
