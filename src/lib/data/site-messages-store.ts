import { mergeMessages } from "@/lib/data/merge-messages";
import { readStoreJson, writeStoreJson } from "@/lib/storage/json";
import type fiMessages from "../../../messages/fi.json";

export type SiteMessages = typeof fiMessages;

const MESSAGE_PATH = "data/content/messages";

function messageFile(locale: string): string {
  return `${MESSAGE_PATH}/${locale}.json`;
}

async function readBundledMessages(locale: string): Promise<SiteMessages> {
  if (locale === "en") {
    return (await import("../../../messages/en.json")).default as SiteMessages;
  }
  return (await import("../../../messages/fi.json")).default as SiteMessages;
}

/**
 * Oletusviestit (messages/*.json) + adminin ylikirjoitus syvämergettynä.
 * Ylikirjoitus voi olla vanhempi kuin koodi: uudet avaimet tulevat oletuksista,
 * poistetut avaimet pudotetaan, jolloin validointi ja t() toimivat aina.
 */
export async function getSiteMessages(locale: string): Promise<SiteMessages> {
  const bundled = await readBundledMessages(locale);
  const stored = await readStoreJson<unknown>(messageFile(locale));
  if (!stored) return bundled;
  return mergeMessages(bundled, stored);
}

export async function writeSiteMessages(
  locale: string,
  data: SiteMessages,
): Promise<void> {
  await writeStoreJson(messageFile(locale), data);
}

export async function getAllSiteMessages(): Promise<{
  fi: SiteMessages;
  en: SiteMessages;
}> {
  const [fi, en] = await Promise.all([
    getSiteMessages("fi"),
    getSiteMessages("en"),
  ]);
  return { fi, en };
}
