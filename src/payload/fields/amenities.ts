import type { AmenityId } from "@/types/villa";

export const AMENITY_OPTIONS: { id: AmenityId; label: string }[] = [
  { id: "sauna", label: "Sauna" },
  { id: "wifi", label: "Wi-Fi" },
  { id: "jacuzzi", label: "Poreamme" },
  { id: "pets", label: "Lemmikit sallittu" },
  { id: "beds", label: "Vuodevaatteet" },
  { id: "kitchen", label: "Keittiö" },
  { id: "fireplace", label: "Takka" },
  { id: "parking", label: "Pysäköinti" },
];
