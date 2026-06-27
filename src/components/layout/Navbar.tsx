"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";
import { NavLinks } from "./NavLinks";

export function Navbar() {
  const tCommon = useTranslations("common");
  const tNav = useTranslations("nav");
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const heroOverlay = isHome && !scrolled && !open;

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {heroOverlay && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/75 via-black/40 to-transparent"
          aria-hidden
        />
      )}

      <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-gold to-transparent" />

      <div
        className={`relative border-b transition-all duration-300 ${
          heroOverlay
            ? "border-transparent bg-transparent"
            : scrolled
              ? "border-[color:var(--hairline)] bg-white shadow-soft"
              : "border-transparent bg-white"
        }`}
      >
        <div
          className={`mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 transition-all duration-300 sm:px-6 lg:px-8 ${
            heroOverlay ? "h-[6.25rem]" : "h-[4.75rem]"
          }`}
        >
          <Logo variant="nav" priority expanded={heroOverlay} />

          <NavLinks
            className="hidden items-center justify-center gap-9 md:flex"
            linkClassName={heroOverlay ? "nav-link-serif-light" : "nav-link-serif"}
            activeClassName={heroOverlay ? "nav-link-serif-active-light" : "nav-link-serif-active"}
          />

          <div className="flex items-center justify-end gap-3">
            <Link
              href="/contact"
              className={`hidden rounded-full px-6 py-2.5 font-sans text-base font-semibold transition-colors duration-200 md:inline-flex ${
                heroOverlay
                  ? "border border-paper/80 bg-transparent text-paper hover:bg-paper/10"
                  : "bg-ink text-paper hover:bg-forest-700"
              }`}
            >
              {tNav("contact")}
            </Link>

            <LanguageSwitcher tone={heroOverlay ? "light" : "dark"} />

            <button
              type="button"
              className={`inline-flex h-12 w-12 items-center justify-center rounded-lg transition-colors md:hidden ${
                heroOverlay
                  ? "text-paper hover:bg-paper/10"
                  : "text-ink hover:bg-ink/5"
              }`}
              aria-expanded={open}
              aria-label={open ? tCommon("menuClose") : tCommon("menuOpen")}
              onClick={() => setOpen((prev) => !prev)}
            >
              {open ? (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              ) : (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {open && (
          <div className="border-t border-[color:var(--hairline)] bg-white px-4 py-5 md:hidden">
            <NavLinks
              variant="vertical"
              className="flex flex-col gap-0.5"
              linkClassName="block rounded-lg px-4 py-3 font-sans text-[1rem] font-medium text-forest-700 transition-colors hover:bg-ink/5 hover:text-ink"
              activeClassName="bg-ink/5 text-ink font-semibold"
              onNavigate={() => setOpen(false)}
            />
            <div className="mt-4 border-t border-[color:var(--hairline)] pt-4">
              <Link
                href="/contact"
                className="block rounded-full bg-ink px-6 py-3.5 text-center font-sans text-lg font-semibold text-paper"
                onClick={() => setOpen(false)}
              >
                {tNav("contact")}
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
