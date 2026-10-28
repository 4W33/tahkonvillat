import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { buildConfig, type Config } from "payload";
import sharp from "sharp";
import { Media } from "./payload/collections/Media";
import { Users } from "./payload/collections/Users";
import { fi } from "./payload/i18n/fi";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: " · Tahkon Villat" },
  },
  collections: [Users, Media],
  localization: {
    locales: [
      { code: "fi", label: "Suomi" },
      { code: "en", label: "English" },
    ],
    defaultLocale: "fi",
    fallback: true,
  },
  // Payload ei sisällä suomea: oma käännös src/payload/i18n/fi.ts
  i18n: {
    supportedLanguages: { fi } as unknown as NonNullable<Config["i18n"]>["supportedLanguages"],
    fallbackLanguage: "fi" as "en",
  },
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL },
  }),
  sharp,
  plugins: [
    // Payload 3.92 tukee vain julkista Blob-säilöä; kuvat ovat sivustolla julkisia muutenkin.
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      token: process.env.BLOB_READ_WRITE_TOKEN,
      collections: { media: true },
      clientUploads: true,
    }),
  ],
});
