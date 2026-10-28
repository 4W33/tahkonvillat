import { mergeMessages } from "@/lib/data/merge-messages";
import { writeStoreJson } from "@/lib/storage/json";
import { globalToMessages } from "@/payload/fields/messages-to-fields";
import { SITE_TEXT_SECTIONS, siteTextSlug } from "@/payload/globals/SiteTexts";
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
 * Oletusviestit (messages/*.json) + Payloadin site-texts-global syvämergettynä.
 * Tyhjä kenttä → oletus. Ilman kielifallbackia: tyhjä EN-kenttä ei saa näyttää
 * suomenkielistä tekstiä. Tietokantavirhe → oletukset (sisältö saa palata).
 */
export async function getSiteMessages(locale: string): Promise<SiteMessages> {
  const bundled = await readBundledMessages(locale);
  try {
    const { getPayloadClient } = await import("@/lib/payload");
    const payload = await getPayloadClient();
    const docs = await Promise.all(
      SITE_TEXT_SECTIONS.map((section) =>
        payload.findGlobal({
          slug: siteTextSlug(section) as never,
          locale: locale as "fi" | "en",
          fallbackLocale: false,
          depth: 1,
        }),
      ),
    );
    const stored = Object.fromEntries(
      SITE_TEXT_SECTIONS.map((section, i) => [section, globalToMessages(docs[i])]),
    );
    return mergeMessages(bundled, stored);
  } catch (error) {
    console.error(`[site-texts] ${error instanceof Error ? error.message : String(error)}`);
    return bundled;
  }
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
