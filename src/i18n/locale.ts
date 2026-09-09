import { notFound } from "next/navigation";
import { isAppLocale, type AppLocale } from "@/i18n/routing";

/**
 * Varmistaa että [locale]-segmentti on oikeasti tuettu kieli.
 *
 * Ilman tätä esim. `/jotain.txt` osuu `[locale]`-reittiin locale-arvolla
 * "jotain.txt" (middleware ohittaa pisteelliset polut), jolloin sivu yrittää
 * lukea `villa.name["jotain.txt"]` → undefined → 500 sen sijaan että
 * palautettaisiin 404. Layoutin tarkistus ei riitä, koska sivu ja layout
 * renderöityvät rinnakkain.
 */
export function requireLocale(locale: string): AppLocale {
  if (!isAppLocale(locale)) {
    notFound();
  }
  return locale;
}
