import type { CollectionConfig } from "payload";
import { revalidateHooks } from "../hooks/revalidate";

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Kuva", plural: "Kuvat" },
  admin: { group: "Sisältö" },
  access: { read: () => true },
  hooks: revalidateHooks,
  fields: [
    {
      name: "alt",
      label: "Kuvan kuvaus (näkövammaisille ja hakukoneille)",
      type: "text",
      localized: true,
      required: true,
    },
  ],
  upload: {
    mimeTypes: ["image/*"],
    resizeOptions: { width: 2400, withoutEnlargement: true },
  },
};
