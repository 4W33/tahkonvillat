import { withPayload } from "@payloadcms/next/withPayload";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Kaksi root layoutia ((site) ja (payload)) → yhteinen 404 tiedostosta app/global-not-found.tsx
  experimental: { globalNotFound: true },
  serverExternalPackages: ["@vercel/blob", "undici"],
  async redirects() {
    return [
      { source: "/apartments", destination: "/asunnot", permanent: true },
      { source: "/villas", destination: "/villat", permanent: true },
      { source: "/villas/:slug", destination: "/villat/:slug", permanent: true },
      { source: "/contact", destination: "/yhteystiedot", permanent: true },
      { source: "/privacy", destination: "/tietosuoja", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "a0.muscache.com",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default withPayload(withNextIntl(nextConfig));
