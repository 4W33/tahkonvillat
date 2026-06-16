"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BRAND_NAME } from "@/lib/constants";

/** Tahko fell over a lake line, with a gold waterline accent. Inherits
 *  currentColor for the mark so it works on both paper and ink backgrounds. */
function FellMark({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className="shrink-0"
      aria-hidden="true"
    >
      <path d="M32 9 L57 45 H7 Z" fill="currentColor" />
      <rect x="7" y="50.5" width="50" height="2.6" fill="currentColor" />
      <rect x="15" y="57.4" width="34" height="2.6" fill="#b8955a" />
    </svg>
  );
}

type Props = {
  variant?: "nav" | "footer";
  className?: string;
  linked?: boolean;
  /** Accepted for backwards compatibility; no longer used (vector mark). */
  priority?: boolean;
};

export function Logo({ variant = "nav", className = "", linked = true }: Props) {
  const t = useTranslations("common");
  const brand = t("brand");
  const words = brand.trim().split(/\s+/);
  const last = words.length > 1 ? words.pop() : "";
  const lead = words.join(" ");

  const markSize = variant === "footer" ? 38 : 26;
  const textCls = variant === "footer" ? "text-2xl" : "text-[15px]";

  const content = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <FellMark size={markSize} />
      <span
        className={`font-display font-extrabold uppercase leading-none tracking-tight ${textCls}`}
      >
        {lead}
        {last ? <span className="text-gold"> {last}</span> : null}
      </span>
    </span>
  );

  if (!linked) return content;

  return (
    <Link
      href="/"
      aria-label={BRAND_NAME}
      className="inline-flex shrink-0 items-center text-ink transition-opacity duration-200 hover:opacity-80"
    >
      {content}
    </Link>
  );
}
