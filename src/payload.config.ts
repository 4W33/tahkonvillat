import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { resendAdapter } from "@payloadcms/email-resend";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { buildConfig, type Config } from "payload";
import sharp from "sharp";
import { Apartments } from "./payload/collections/Apartments";
import { Media } from "./payload/collections/Media";
import { Contacts, Inquiries } from "./payload/collections/Messages";
import { Reservations } from "./payload/collections/Reservations";
import { Users } from "./payload/collections/Users";
import { Villas } from "./payload/collections/Villas";
import { siteTextGlobals } from "./payload/globals/SiteTexts";
import { fi } from "./payload/i18n/fi";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Sama lähettäjä kuin lomake-ilmoituksissa (src/lib/email/send.ts). Ilman avainta Payload kirjoittaa
// viestit (myös salasanan palautuslinkin) lokiin, joten tuotannossa RESEND_API_KEY kuuluu asettaa.
const emailFrom = (process.env.EMAIL_FROM || "Tahkon Villat <onboarding@resend.dev>").match(/^(.*?)\s*<(.+)>$/);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: " · Tahkon Villat" },
  },
  collections: [Villas, Apartments, Reservations, Contacts, Inquiries, Media, Users],
  globals: siteTextGlobals,
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
    // Dev-push vain paikalliseen kantaan (npm run db:dev): Neonia vasten ajettu cms:seed muuten
    // pushaisi skeeman ja kirjaisi batch -1 -rivin, jonka jälkeen Vercelin `payload migrate` ohittaa migraatiot.
    push: /@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(process.env.DATABASE_URL ?? ""),
  }),
  email: process.env.RESEND_API_KEY
    ? resendAdapter({
        apiKey: process.env.RESEND_API_KEY,
        defaultFromName: emailFrom?.[1] || "Tahkon Villat",
        defaultFromAddress: emailFrom?.[2] || process.env.EMAIL_FROM || "onboarding@resend.dev",
      })
    : undefined,
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
