import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@vercel/blob", "undici"],
  },
  webpack: (config, { dev }) => {
    // OneDrive often corrupts webpack's persistent cache → missing vendor-chunks/*.js
    if (dev) {
      config.cache = false;
    }
    return config;
  },
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

export default withNextIntl(nextConfig);
