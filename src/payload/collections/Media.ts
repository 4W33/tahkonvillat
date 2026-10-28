import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Kuva", plural: "Kuvat" },
  admin: { group: "Sisältö" },
  access: { read: () => true },
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
