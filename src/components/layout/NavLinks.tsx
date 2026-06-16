"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const navItems = [
  { href: "/", key: "home", match: (path: string) => path === "/" },
  {
    href: "/villas",
    key: "villas",
    match: (path: string) => path === "/villas" || path.startsWith("/villas/"),
  },
  {
    href: "/apartments",
    key: "apartments",
    match: (path: string) => path === "/apartments",
  },
  {
    href: "/contact",
    key: "contact",
    match: (path: string) => path === "/contact",
  },
  { href: "/faq", key: "faq", match: (path: string) => path === "/faq" },
] as const;

type Props = {
  onNavigate?: () => void;
  className?: string;
  linkClassName?: string;
  activeClassName?: string;
  variant?: "horizontal" | "vertical";
};

export function NavLinks({
  onNavigate,
  className,
  linkClassName = "nav-link",
  activeClassName = "text-forest",
  variant = "horizontal",
}: Props) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  const links = navItems.map((item) => {
    const active = item.match(pathname);

    return (
      <Link
        key={item.key}
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={`${linkClassName} ${active ? activeClassName : ""}`}
        onClick={onNavigate}
      >
        {t(item.key)}
      </Link>
    );
  });

  if (variant === "vertical") {
    return <div className={className}>{links}</div>;
  }

  return (
    <nav className={className} aria-label="Main navigation">
      {links}
    </nav>
  );
}
