import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, IBM_Plex_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { SiteShell } from "@/components/layout/SiteShell";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { LivePreviewRefresh } from "@/components/cms/LivePreviewRefresh";
import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";
import { getSiteUrl } from "@/lib/seo";
import { BRAND_LOGO, BRAND_NAME } from "@/lib/constants";
import "../globals.css";

// Cormorant Garamond — korkean kontrastin elegantti serif otsikoihin ja korostettuun tekstiin
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  style: ["normal", "italic"],
  // 500 ei käytössä serifillä (font-medium vain font-sans/mono-elementeissä)
  weight: ["400", "600", "700"],
  display: "swap",
});

// DM Sans — lämmin, moderni groteski leipätekstiin ja käyttöliittymään
const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  // 700 ei käytössä sansilla (font-bold vain font-display/serif-elementeissä)
  weight: ["400", "500", "600"],
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
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  const t = await getTranslations({ locale, namespace: "metadata" });

  const siteUrl = getSiteUrl();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: t("title"),
      template: `%s | ${BRAND_NAME}`,
    },
    description: t("description"),
    // Favicon tulee src/app/icon.png-tiedostosta (sama kuva kuin logo-mark.png)
    icons: {
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

export default async function LocaleLayout(props: Props) {
  const params = await props.params;

  const {
    locale
  } = params;

  const {
    children
  } = props;

  if (!routing.locales.includes(locale as "fi" | "en")) {
    notFound();
  }

  // Ilman tätä next-intl lukee kielen headers()-kutsulla ja jokainen sivu renderöityy dynaamisesti.
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${display.variable} ${sans.variable} ${serif.variable} ${mono.variable} antialiased`}
      >
        <OrganizationJsonLd locale={locale} />
        <LivePreviewRefresh />
        <NextIntlClientProvider messages={messages}>
          <SmoothScroll>
            <SiteShell>{children}</SiteShell>
          </SmoothScroll>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
