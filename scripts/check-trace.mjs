/**
 * Varmistaa, että ajon aikana luettavat datatiedostot ovat mukana Vercelin
 * palvelinfunktioissa. Aja `npm run build` jälkeen:
 *
 *   node scripts/check-trace.mjs
 *
 * Tausta 13.9.2026: sisältö luetaan Blobista tai sen puuttuessa tiedostosta
 * `data/…`. Next jäljittää funktioihin vain staattisesti tunnistetut tiedostot,
 * joten dynaamisella polulla luetut `data/`-tiedostot jäivät pois. Tuotannossa
 * ajon aikana renderöidyt sivut (/asunnot, /villat, villasivut) näyttivät
 * tyhjää ja 404:ää. Exit 1, jos jokin reitti ei sisällä tarvittavia tiedostoja.
 */
import { existsSync, readFileSync } from "node:fs";

const ROUTES = [
  ".next/server/app/[locale]/page.js.nft.json",
  ".next/server/app/[locale]/villas/page.js.nft.json",
  ".next/server/app/[locale]/villas/[slug]/page.js.nft.json",
  ".next/server/app/[locale]/apartments/page.js.nft.json",
  ".next/server/app/admin/page.js.nft.json",
];

const REQUIRED = [
  "data/content/villa-puolukka.json",
  "data/content/villa-karpalo.json",
  "data/content/tahkon-teituli.json",
  "data/content/apartment-vantaa-1.json",
  "data/pricing.json",
];

let failed = 0;
for (const route of ROUTES) {
  if (!existsSync(route)) {
    console.log(`✗ puuttuu build-tulosteesta: ${route} (aja ensin npm run build)`);
    failed += 1;
    continue;
  }
  const files = JSON.parse(readFileSync(route, "utf-8")).files.map((f) => f.replace(/\\/g, "/"));
  const missing = REQUIRED.filter((req) => !files.some((f) => f.endsWith(req)));
  const name = route.replace(".next/server/app", "").replace("/page.js.nft.json", "") || "/";
  if (missing.length) {
    console.log(`✗ ${name}: puuttuu ${missing.length}/${REQUIRED.length} (${missing[0]} …)`);
    failed += 1;
  } else {
    console.log(`✓ ${name}: kaikki ${REQUIRED.length} datatiedostoa mukana`);
  }
}

process.exit(failed ? 1 : 0);
