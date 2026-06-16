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

export async function getSiteMessages(locale: string): Promise<SiteMessages> {
  const stored = await readStoreJson<SiteMessages>(messageFile(locale));
  if (stored) return stored;
  return readBundledMessages(locale);
}

export async function writeSiteMessages(
  locale: string,
  data: SiteMessages,
): Promise<void> {
  await writeStoreJson(messageFile(locale), data, { access: "public" });
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
