export type PropertyPricing = {
  fromPerNight: number;
  currency: "EUR";
  updatedAt?: string;
};

export type PricingStore = Record<string, PropertyPricing>;
