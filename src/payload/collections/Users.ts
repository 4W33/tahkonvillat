import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "Käyttäjä", plural: "Käyttäjät" },
  admin: { useAsTitle: "email", group: "Asetukset" },
  auth: { cookies: { secure: process.env.NODE_ENV === "production" } },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [],
};
