"use client";

import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

function getHref(pathname: string, slug?: string) {
  if (pathname === "/villas/[slug]" && slug) {
    return { pathname: "/villas/[slug]" as const, params: { slug } };
  }

  return pathname as "/" | "/villas" | "/apartments" | "/contact" | "/faq" | "/checkout";
}

export function LanguageSwitcher({ tone = "dark" }: { tone?: "light" | "dark" }) {
  const locale = useLocale();
  const pathname = usePathname();
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : undefined;
  const href = getHref(pathname, slug);
  const t = useTranslations("common");

  return (
    <div
      className={`flex items-center gap-0.5 rounded-full border p-0.5 ${
        tone === "light"
          ? "border-paper/30"
          : "border-[color:var(--hairline)]"
      }`}
      role="group"
      aria-label="Language"
    >
      {(["fi", "en"] as const).map((code) => (
        <Link
          key={code}
          href={href}
          locale={code}
          className={`rounded-full px-3 py-1.5 font-sans text-[0.75rem] font-semibold uppercase tracking-wide transition-colors duration-200 ${
            locale === code
              ? tone === "light"
                ? "bg-paper text-ink"
                : "bg-ink text-paper"
              : tone === "light"
                ? "text-paper/75 hover:text-paper"
                : "text-forest-600 hover:text-ink"
          }`}
        >
          {code === "fi" ? t("localeFi") : t("localeEn")}
        </Link>
      ))}
    </div>
  );
}
