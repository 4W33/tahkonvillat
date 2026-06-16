"use client";

import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

function getHref(pathname: string, slug?: string) {
  if (pathname === "/villas/[slug]" && slug) {
    return { pathname: "/villas/[slug]" as const, params: { slug } };
  }

  return pathname as "/" | "/villas" | "/apartments" | "/contact" | "/faq";
}

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : undefined;
  const href = getHref(pathname, slug);
  const t = useTranslations("common");

  return (
    <div
      className="flex items-center gap-0.5 rounded-none border border-[color:var(--hairline)] p-0.5"
      role="group"
      aria-label="Language"
    >
      {(["fi", "en"] as const).map((code) => (
        <Link
          key={code}
          href={href}
          locale={code}
          className={`rounded-none px-3 py-1.5 font-mono text-[0.7rem] font-medium uppercase tracking-[0.14em] transition-colors duration-200 ${
            locale === code
              ? "bg-ink text-paper"
              : "text-forest-600 hover:text-ink"
          }`}
        >
          {code === "fi" ? t("localeFi") : t("localeEn")}
        </Link>
      ))}
    </div>
  );
}
