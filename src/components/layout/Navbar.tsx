"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";
import { NavLinks } from "./NavLinks";

export function Navbar() {
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
    <header
      className={`sticky top-0 z-50 border-b bg-paper/85 backdrop-blur-md transition-shadow duration-300 ${
        scrolled
          ? "border-[color:var(--hairline)] shadow-soft"
          : "border-transparent shadow-none"
      }`}
    >
      <div className="mx-auto grid h-[4.25rem] max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Logo variant="nav" priority />

        <NavLinks className="hidden items-center justify-center gap-10 md:flex" />

        <div className="flex items-center justify-end gap-3">
          <LanguageSwitcher />
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-none text-ink transition-colors hover:bg-ink/5 md:hidden"
            aria-expanded={open}
            aria-label={open ? tCommon("menuClose") : tCommon("menuOpen")}
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-[color:var(--hairline)] bg-paper px-4 py-4 md:hidden">
          <NavLinks
            variant="vertical"
            className="flex flex-col gap-1"
            linkClassName="block rounded-none px-3 py-3 font-mono text-sm font-medium uppercase tracking-[0.14em] text-forest-700 transition-colors hover:bg-ink/5 hover:text-ink"
            activeClassName="bg-ink/5 font-medium text-ink"
            onNavigate={() => setOpen(false)}
          />
        </div>
      )}
    </header>
  );
}
