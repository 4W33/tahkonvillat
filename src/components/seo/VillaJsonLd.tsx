import { getTranslations } from "next-intl/server";
import { absoluteUrl, getSiteUrl } from "@/lib/seo";
import type { Villa } from "@/types/villa";

type Props = {
  villa: Villa;
  locale: "fi" | "en";
};

// VacationRental vaatii koordinaatit (latitude/longitude), joita datassa ei ole: käytetään LodgingBusinessia
export async function VillaJsonLd({ villa, locale }: Props) {
  const t = await getTranslations({ locale, namespace: "villas" });
  const data = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: villa.name[locale],
    description: villa.description[locale],
    url: absoluteUrl(locale, `/villas/${villa.slug}`),
    numberOfRooms: villa.bedrooms,
    address: {
      "@type": "PostalAddress",
      addressLocality: t(`locations.${villa.location}`),
      addressCountry: "FI",
    },
    image: new URL(villa.gallery[0] ?? villa.image, getSiteUrl()).toString(),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
