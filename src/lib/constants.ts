import { siteConfig } from "@/lib/site.config";

export const CONTACT_EMAIL = siteConfig.contact.email;
export const BRAND_LOGO = siteConfig.brand.logo;
export const BRAND_NAME = siteConfig.brand.name;

/**
 * Tekstitön merkki vaakatunnusta varten, tai null jos sitä ei ole vielä toimitettu.
 * Ks. site.config.ts brand.markPlain — kun tiedosto saapuu ja lippu käännetään
 * trueksi, navigaatio näyttää merkin + nimen vieressä ilman toistoa.
 */
export const BRAND_MARK_PLAIN: string | null = siteConfig.brand.markPlainAvailable
  ? siteConfig.brand.markPlain
  : null;
