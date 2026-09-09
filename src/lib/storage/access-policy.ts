export type StorageAccess = "public" | "private";

/**
 * Yksi totuuslähde sille, mikä tallennus on julkinen ja mikä yksityinen.
 *
 * Aiemmin kirjoituspuoli päätti tason kutsukohtaisesti eikä lukupuoli tiennyt
 * siitä mitään: yksityiset blobit kirjoitettiin oikein, mutta luettiin
 * autentikoimattomalla fetchillä, joka epäonnistuu. Kun luku ja kirjoitus
 * lukevat saman politiikan, ne eivät voi enää olla eri mieltä.
 *
 * Yksityisiä ovat kaikki tallennukset, joissa on henkilötietoja tai salaisuuksia:
 * lomakeviestit (nimi, sähköposti, puhelin), varaukset (vieraan nimi) ja
 * Airbnbn iCal-osoitteet (salaisia linkkejä).
 */
const PRIVATE_PATHS: ReadonlySet<string> = new Set([
  "data/contacts.json",
  "data/inquiries.json",
  "data/reservations.json",
  "data/ical-sources.json",
]);

function normalize(relativePath: string): string {
  return relativePath.replace(/^\/+/, "");
}

export function storageAccess(relativePath: string): StorageAccess {
  return PRIVATE_PATHS.has(normalize(relativePath)) ? "private" : "public";
}

export function isPrivateStore(relativePath: string): boolean {
  return storageAccess(relativePath) === "private";
}
