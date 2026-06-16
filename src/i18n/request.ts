import { getRequestConfig } from "next-intl/server";
import { getSiteMessages } from "@/lib/data/site-messages-store";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as "fi" | "en")) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: await getSiteMessages(locale),
  };
});
