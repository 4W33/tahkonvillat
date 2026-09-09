/** Kausi: start ja end ovat INKLUSIIVISIA päivämääriä (YYYY-MM-DD). */
export type PriceSeason = {
  id: string;
  start: string;
  end: string;
  pricePerNight: number;
  label?: { fi: string; en: string };
};

export type PropertyPricing = {
  /** Perushinta "muut ajat". Valinnainen, jos kohteella on vain kausia. */
  fromPerNight?: number;
  currency: "EUR";
  seasons?: PriceSeason[];
  updatedAt?: string;
};

export type PricingStore = Record<string, PropertyPricing>;
