export const pageHeaderImages = {
  villas: {
    src: "/images/properties/villa-karpalo/04.jpg",
    alt: {
      fi: "Villa Karpalo Tahkolla — järvinäkymä olohuoneesta",
      en: "Villa Karpalo in Tahko — lake view from the living room",
    },
  },
  apartments: {
    src: "/images/properties/helsinki-1/01.jpg",
    alt: {
      fi: "Kaupunkiasunto Uudellamaalla",
      en: "City apartment in Uusimaa",
    },
  },
  contact: {
    src: "/images/properties/villa-puolukka/15.jpg",
    alt: {
      fi: "Villa Puolukka — terassi ja luonto",
      en: "Villa Puolukka — terrace and nature",
    },
  },
  faq: {
    src: "/images/properties/villa-karpalo/09.jpg",
    alt: {
      fi: "Villa Karpalo — sauna ja sisätilat",
      en: "Villa Karpalo — sauna and interior",
    },
  },
  checkout: {
    src: "/images/properties/villa-puolukka/05.jpg",
    alt: {
      fi: "Villa Puolukka — lomamajoitus Tahkolla",
      en: "Villa Puolukka — holiday home in Tahko",
    },
  },
} as const;

export type PageHeaderImageKey = keyof typeof pageHeaderImages;

export function getPageHeaderImage(key: PageHeaderImageKey, locale: "fi" | "en") {
  const image = pageHeaderImages[key];
  return { src: image.src, alt: image.alt[locale] };
}
