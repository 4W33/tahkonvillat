"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { BRAND_LOGO, BRAND_MARK_PLAIN, BRAND_NAME } from "@/lib/constants";

type Props = {
  /**
   * nav = pelkkä tunnus · nav-horizontal = merkki + nimi vierekkäin ·
   * footer = iso tunnus.
   *
   * "nav-horizontal" vaatii tekstittömän merkin (`BRAND_MARK_PLAIN`). Ilman sitä
   * se palautuu pelkkään tunnukseen, koska nykyisessä kuvassa nimi on jo sisällä
   * eikä sitä pidä toistaa vieressä.
   */
  variant?: "nav" | "nav-horizontal" | "footer";
  className?: string;
  linked?: boolean;
  priority?: boolean;
  /** Large hero nav logo — shrinks when user scrolls */
  expanded?: boolean;
  /** Vaakatunnuksen nimen sävy (hero-tilassa vaalea). */
  tone?: "dark" | "light";
};

export function Logo({
  variant = "nav",
  className = "",
  linked = true,
  priority = false,
  expanded = false,
  tone = "dark",
}: Props) {
  const horizontal = variant === "nav-horizontal" && BRAND_MARK_PLAIN !== null;
  let content: React.ReactNode;

  if (horizontal) {
    const markClass = expanded ? "h-14 w-14 sm:h-16 sm:w-16" : "h-11 w-11 sm:h-12 sm:w-12";
    content = (
      <span className={`inline-flex items-center gap-3 ${className}`}>
        <span
          className={`relative inline-flex shrink-0 transition-all duration-300 ease-out-expo ${markClass}`}
        >
          <Image
            src={BRAND_MARK_PLAIN as string}
            alt=""
            fill
            priority={priority}
            sizes="64px"
            className="object-contain"
          />
        </span>
        <span
          className={`hidden whitespace-nowrap font-display font-semibold leading-none tracking-tight transition-all duration-300 lg:inline ${
            expanded ? "text-[1.75rem]" : "text-[1.45rem]"
          } ${tone === "light" ? "text-paper" : "text-ink"}`}
        >
          {BRAND_NAME}
        </span>
      </span>
    );
  } else {
    const sizeClass =
      variant === "footer"
        ? "h-24 w-24 sm:h-28 sm:w-28"
        : expanded
          ? "h-[5.25rem] w-[5.25rem] sm:h-24 sm:w-24"
          : "h-14 w-14 sm:h-[3.75rem] sm:w-[3.75rem]";

    content = (
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
  }

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
