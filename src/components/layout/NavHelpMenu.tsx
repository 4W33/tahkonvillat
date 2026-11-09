"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const helpItems = [
  { href: "/faq" as const, key: "faq" },
  { href: "/checkout" as const, key: "checkout" },
] as const;

type Props = {
  linkClassName?: string;
  activeClassName?: string;
  onNavigate?: () => void;
  variant?: "desktop" | "mobile";
};

function isHelpPath(pathname: string) {
  return helpItems.some((item) => item.href === pathname);
}

export function NavHelpMenu({
  linkClassName = "nav-link-serif",
  activeClassName = "nav-link-serif-active",
  onNavigate,
  variant = "desktop",
}: Props) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const active = isHelpPath(pathname);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (variant === "mobile") {
    return (
      <div className="py-1">
        <p className="px-4 py-2 font-sans text-[0.9375rem] font-semibold uppercase tracking-wide text-forest-500">
          {t("helpMenu")}
        </p>
        {helpItems.map((item) => {
          const itemActive = pathname === item.href;
          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={itemActive ? "page" : undefined}
              className={`block rounded-lg px-4 py-3 font-sans text-[1rem] font-medium text-forest-700 transition-colors hover:bg-ink/5 hover:text-ink ${
                itemActive ? "bg-ink/5 font-semibold text-ink" : ""
              }`}
              onClick={onNavigate}
            >
              {t(item.key)}
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className={`${linkClassName} ${active ? activeClassName : ""} inline-flex items-center gap-1.5`}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((prev) => !prev)}
      >
        {t("helpMenu")}
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-1/2 top-full z-50 mt-3 w-60 -translate-x-1/2 overflow-hidden rounded-xl border border-[color:var(--hairline)] bg-white py-1.5 shadow-lift"
        >
          {helpItems.map((item) => {
            const itemActive = pathname === item.href;
            return (
              <Link
                key={item.key}
                href={item.href}
                role="menuitem"
                aria-current={itemActive ? "page" : undefined}
                className={`block px-4 py-2.5 font-sans text-[0.95rem] transition-colors hover:bg-[#FAF7F3] ${
                  itemActive ? "font-semibold text-ink" : "text-forest-700"
                }`}
                onClick={() => {
                  setOpen(false);
                  onNavigate?.();
                }}
              >
                {t(item.key)}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
