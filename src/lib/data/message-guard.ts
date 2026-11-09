import { notifiedValue } from "@/payload/collections/Messages";

// Sama kuin Payloadin email-kentän validointi: reitti ei saa hyväksyä mitä tallennus hylkää.
const EMAIL = /^(?!.*\.\.)[\w!#$%&'*+/=?^`{|}~-](?:[\w!#$%&'*+/=?^`{|}~.-]*[\w!#$%&'*+/=?^`{|}~-])?@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/i;

/** Lomakkeiden yhteiset kentät: pakolliset, pituusrajat ja Payloadin hyväksymä sähköposti. */
export function hasValidSender(data: Record<string, unknown>): boolean {
  const { name, email, message, phone } = data;
  return (
    typeof name === "string" && name.trim().length > 0 && name.length <= 200 &&
    typeof email === "string" && email.length <= 254 && EMAIL.test(email) &&
    typeof message === "string" && message.trim().length > 0 && message.length <= 5000 &&
    (phone === undefined || (typeof phone === "string" && phone.length <= 50))
  );
}

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

/** Piilotettu `website`-kenttä: ihminen jättää sen tyhjäksi, botti täyttää. */
export function isHoneypotFilled(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const { website } = body as Record<string, unknown>;
  return website !== undefined && website !== null && website !== "";
}

export function isSiteLocale(value: unknown): value is "fi" | "en" {
  return value === "fi" || value === "en";
}

/** Tiedustelun kohde, päivät (YYYY-MM-DD) ja vieraat. villaName ratkaistaan palvelimella slugista. */
export function hasValidStay(data: Record<string, unknown>): boolean {
  const { villaSlug, checkIn, checkOut, guests } = data;
  return (
    typeof villaSlug === "string" && villaSlug.length > 0 && villaSlug.length <= 200 &&
    typeof checkIn === "string" && ISO_DAY.test(checkIn) &&
    typeof checkOut === "string" && ISO_DAY.test(checkOut) && checkOut > checkIn &&
    typeof guests === "number" && guests > 0
  );
}

/** Viesti on jo tallessa; ilmoituksen tila päivitetään jälkikäteen. Epäonnistuminen ei kaada pyyntöä. */
export async function markNotified(collection: "contacts" | "inquiries", id: number | string, flag: boolean | null) {
  if (flag === null) return; // luotu jo tilassa "off"
  try {
    const { getPayloadClient } = await import("@/lib/payload");
    const payload = await getPayloadClient();
    await payload.update({ collection, id, data: { notified: notifiedValue(flag) }, overrideAccess: true });
  } catch (error) {
    console.error(`[${collection}] notified-tilan päivitys epäonnistui:`, error);
  }
}
