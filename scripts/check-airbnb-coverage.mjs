/**
 * Vertaa Airbnb-profiilista scrapattuja listaus-ID:itä (data/airbnb/profile-listing-ids.json)
 * sivuston mappaukseen (scripts/sync-airbnb-content.mjs). Exit 1 jos profiilissa on
 * listaus, jota sivustolla ei ole.
 *
 *   npm run scrape:airbnb:browser   # päivittää profile-listing-ids.json (voi törmätä kirjautumisseinään)
 *   node scripts/check-airbnb-coverage.mjs
 */
import { readFile } from "node:fs/promises";

const ids = JSON.parse(
  await readFile(new URL("../data/airbnb/profile-listing-ids.json", import.meta.url), "utf-8"),
);
const sync = await readFile(new URL("./sync-airbnb-content.mjs", import.meta.url), "utf-8");
const mapped = new Set([...sync.matchAll(/"(\d{8,})"/g)].map((m) => m[1]));

const missing = ids.profileIds.filter((id) => !mapped.has(id));
const extra = [...mapped].filter((id) => !ids.profileIds.includes(id));

console.log(`Profiili scrapattu: ${ids.scrapedAt} (${ids.method})`);
console.log(`Profiilissa ${ids.profileIds.length} listausta, sivustolle mapattu ${mapped.size}.`);
console.log(
  missing.length
    ? `PUUTTUU SIVUSTOLTA: ${missing.join(", ")}`
    : "✓ Kaikki profiilin listaukset ovat sivustolla.",
);
if (extra.length) {
  console.log(`Sivustolla mutta ei tässä profiilissa (esim. toinen host-tili): ${extra.join(", ")}`);
}
process.exit(missing.length ? 1 : 0);
