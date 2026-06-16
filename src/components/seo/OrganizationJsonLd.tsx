import { CONTACT_EMAIL, BRAND_NAME } from "@/lib/constants";
import { absoluteUrl } from "@/lib/seo";

type Props = {
  locale: string;
};

export function OrganizationJsonLd({ locale }: Props) {
  const data = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: BRAND_NAME,
    url: absoluteUrl(locale, ""),
    email: CONTACT_EMAIL,
    areaServed: ["Tahko", "Vantaa", "Helsinki"],
    description:
      locale === "fi"
        ? "Lomamökit Tahkolla sekä asunnot Vantaalla ja Helsingissä."
        : "Holiday homes in Tahko and apartments in Vantaa and Helsinki.",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
