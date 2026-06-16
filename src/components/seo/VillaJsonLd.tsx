import { absoluteUrl } from "@/lib/seo";
import type { Villa } from "@/types/villa";

type Props = {
  villa: Villa;
  locale: "fi" | "en";
};

export function VillaJsonLd({ villa, locale }: Props) {
  const data = {
    "@context": "https://schema.org",
    "@type": "VacationRental",
    name: villa.name[locale],
    description: villa.description[locale],
    url: absoluteUrl(locale, `/villas/${villa.slug}`),
    numberOfRooms: villa.bedrooms,
    occupancy: {
      "@type": "QuantitativeValue",
      maxValue: villa.guests,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: villa.location,
      addressCountry: "FI",
    },
    image: villa.gallery[0] ?? villa.image,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
