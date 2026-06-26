"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { BRAND_LOGO, BRAND_NAME } from "@/lib/constants";

type Props = {
  variant?: "nav" | "footer";
  className?: string;
  linked?: boolean;
  priority?: boolean;
  /** Large hero nav logo — shrinks when user scrolls */
  expanded?: boolean;
};

export function Logo({
  variant = "nav",
  className = "",
  linked = true,
  priority = false,
  expanded = false,
}: Props) {
  const sizeClass =
    variant === "footer"
      ? "h-24 w-24 sm:h-28 sm:w-28"
      : expanded
        ? "h-[5.25rem] w-[5.25rem] sm:h-24 sm:w-24"
        : "h-14 w-14 sm:h-[3.75rem] sm:w-[3.75rem]";

  const content = (
    <span
      className={`relative inline-flex shrink-0 transition-all duration-300 ease-out-expo ${sizeClass} ${className}`}
    >
      <Image
        src={BRAND_LOGO}
        alt={BRAND_NAME}
        fill
        priority={priority}
        sizes={expanded ? "96px" : "60px"}
        className="object-contain"
      />
    </span>
  );

  if (!linked) return content;

  return (
    <Link
      href="/"
      aria-label={BRAND_NAME}
      className="inline-flex shrink-0 items-center transition-opacity duration-200 hover:opacity-90"
    >
      {content}
    </Link>
  );
}
