import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, IBM_Plex_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { SiteShell } from "@/components/layout/SiteShell";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { Cursor } from "@/components/motion/Cursor";
import { CmsPreviewBridge } from "@/components/cms/CmsPreviewBridge";
import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";
import { getSiteUrl } from "@/lib/seo";
import { BRAND_LOGO, BRAND_NAME } from "@/lib/constants";
import "../globals.css";

// Cormorant Garamond — korkean kontrastin elegantti serif otsikoihin ja korostettuun tekstiin
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// DM Sans — lämmin, moderni groteski leipätekstiin ja käyttöliittymään
const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const display = serif;

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export async function generateMetadata({
  params: { locale },
}: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "metadata" });

  const siteUrl = getSiteUrl();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: t("title"),
      template: `%s | ${BRAND_NAME}`,
    },
    description: t("description"),
    icons: {
      icon: "/images/logo-mark.png",
      apple: "/images/logo-mark-180.png",
    },
    openGraph: {
      type: "website",
      locale: locale === "fi" ? "fi_FI" : "en_US",
      siteName: BRAND_NAME,
      title: t("title"),
      description: t("description"),
      images: [{ url: BRAND_LOGO, width: 630, height: 599, alt: BRAND_NAME }],
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: Props) {
  if (!routing.locales.includes(locale as "fi" | "en")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${display.variable} ${sans.variable} ${serif.variable} ${mono.variable} antialiased`}
      >
        <OrganizationJsonLd locale={locale} />
        <Cursor />
        <CmsPreviewBridge />
        <NextIntlClientProvider messages={messages}>
          <SmoothScroll>
            <SiteShell>{children}</SiteShell>
          </SmoothScroll>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
