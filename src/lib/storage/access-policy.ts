export type StorageAccess = "public" | "private";

/**
 * Kaikki tallennukset ovat yksityisiä.
 *
 * Vercel Blobissa taso on kiinteä koko säilölle: säilö on joko julkinen tai
 * yksityinen, eikä samaan säilöön voi kirjoittaa molempia (docs: vercel-blob/
 * using-blob-sdk, 9/2026). Aiemmin sisältö kirjoitettiin julkisena ja
 * lomakeviestit yksityisinä samaan säilöön, jolloin puolet tallennuksista
 * olisi kaatunut tuotannossa kumman tason tahansa valitsi.
 *
 * Yksi yksityinen säilö: sisältö luetaan palvelimella get()-kutsulla, ja kuvat
 * näytetään sivuston oman reitin /api/media/… kautta. Mikään asiakkaan tieto ei
 * voi päätyä julkiseen osoitteeseen väärän luokittelun takia.
 *
 * Funktio on säilytetty, jotta luku, kirjoitus ja seed-skripti kysyvät tason
 * samasta paikasta.
 */
export function storageAccess(_relativePath: string): StorageAccess {
  return "private";
}

export function isPrivateStore(relativePath: string): boolean {
  return storageAccess(relativePath) === "private";
}

/**
 * Tallennukset, joiden lukuvirhe EI saa palata hiljaa repon vanhaan tiedostoon:
 * lomakeviestit, varaukset ja iCal-linkit. Niissä vanha data näyttäisi
 * ajantasaiselta ja tuoreet viestit katoaisivat näkyvistä.
 *
 * Kaikki muu (sivuston sisältö, tekstit, hinnat, kuvalista) palaa virheessä repon
 * mukana tulevaan oletukseen, jotta julkinen sivusto pysyy pystyssä vaikka
 * Blob-säilössä olisi häiriö.
 *
 * Tämä on eri asia kuin tallennustaso: taso on nyt aina "private".
 */
const FAIL_LOUD_PATHS: ReadonlySet<string> = new Set([
  "data/contacts.json",
  "data/inquiries.json",
  "data/reservations.json",
  "data/ical-sources.json",
]);

export function failLoudOnReadError(relativePath: string): boolean {
  return FAIL_LOUD_PATHS.has(relativePath.replace(/^\/+/, ""));
}
