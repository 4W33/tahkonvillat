import { humanizeKey } from "@/lib/admin/site-content-utils";

/** Pisin `data-cms`-avain, joka on kentän avaimen prefiksi (pisteraja), tai null. */
export function findBestCmsKey(fieldKey: string, available: string[]): string | null {
  let best: string | null = null;
  for (const key of available) {
    if (fieldKey === key || fieldKey.startsWith(`${key}.`)) {
      if (!best || key.length > best.length) best = key;
    }
  }
  return best;
}

/** Esikatselu-iframen osoite osiolle: fi ilman etuliitettä, en `/en` + en-polku. */
export function buildPreviewSrc(
  section: string,
  locale: "fi" | "en",
  previewMap: { fi: Record<string, string>; en: Record<string, string> },
): string {
  const path = previewMap[locale][section] ?? "/";
  const prefixed = locale === "en" ? (path === "/" ? "/en" : `/en${path}`) : path;
  return `${prefixed}?cms=1`;
}

/** "Etusivu › Hero" -tyyppinen ihmisluettava nimi avaimelle. */
export function cmsLabel(key: string, sectionLabels: Record<string, string>): string {
  const [section, ...rest] = key.split(".");
  const head = sectionLabels[section] ?? humanizeKey(section);
  if (rest.length === 0) return head;
  return `${head} › ${rest.map(humanizeKey).join(" › ")}`;
}
