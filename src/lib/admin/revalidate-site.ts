import { revalidatePath } from "next/cache";

/** FI uses localePrefix "as-needed" — paths have no /fi prefix. */
const SITE_PATHS = [
  "/",
  "/en",
  "/villat",
  "/en/villas",
  "/asunnot",
  "/en/apartments",
  "/yhteystiedot",
  "/en/contact",
  "/faq",
  "/en/faq",
  "/tietosuoja",
  "/en/privacy",
] as const;

export function revalidateSiteContent() {
  for (const path of SITE_PATHS) {
    revalidatePath(path);
  }
}

export function revalidatePricing() {
  revalidatePath("/villat");
  revalidatePath("/en/villas");
  revalidatePath("/asunnot");
  revalidatePath("/en/apartments");
  revalidatePath("/");
  revalidatePath("/en");
}
