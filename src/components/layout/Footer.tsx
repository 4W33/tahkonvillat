import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CONTACT_EMAIL } from "@/lib/constants";

const navItems = [
  { href: "/villas", key: "villas" },
  { href: "/apartments", key: "apartments" },
  { href: "/contact", key: "contact" },
  { href: "/faq", key: "faq" },
] as const;

export async function Footer() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");
  const tCommon = await getTranslations("common");
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-paper/10 bg-ink-900 text-paper">
      <div className="grain absolute inset-0 opacity-30" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <svg
              width="40"
              height="40"
              viewBox="0 0 64 64"
              className="mb-5 text-paper"
              aria-hidden
            >
              <path d="M32 9 L57 45 H7 Z" fill="currentColor" />
              <rect x="7" y="50.5" width="50" height="2.6" fill="currentColor" />
              <rect x="15" y="57.4" width="34" height="2.6" fill="#b8955a" />
            </svg>
            <p className="display-xl text-4xl text-paper sm:text-5xl">
              {tCommon("brand")}
            </p>
            <p className="mt-5 max-w-xs font-sans text-sm leading-relaxed text-paper/70">
              {t("tagline")}
            </p>
          </div>

          <div>
            <p className="mono-label text-paper/50">{t("contact")}</p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-4 inline-block font-sans text-sm text-paper transition-opacity hover:opacity-70"
            >
              {CONTACT_EMAIL}
            </a>
          </div>

          <div>
            <p className="mono-label text-paper/50">{tCommon("brand")}</p>
            <nav aria-label="Footer navigation" className="mt-4">
              <ul className="flex flex-col gap-3">
                {navItems.map((item) => (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-paper/70 transition-colors hover:text-paper"
                    >
                      {tNav(item.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-paper/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-paper/50">
            © {year} {tCommon("brand")}. {t("rights")}
          </p>
          <Link
            href="/privacy"
            className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-paper/50 transition-colors hover:text-paper"
          >
            {t("privacy")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
