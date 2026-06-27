import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CONTACT_EMAIL } from "@/lib/constants";
import { FooterMosaic } from "./FooterMosaic";
import { Logo } from "./Logo";

const navItems = [
  { href: "/villas", key: "villas" },
  { href: "/apartments", key: "apartments" },
  { href: "/faq", key: "faq" },
  { href: "/checkout", key: "checkout" },
  { href: "/contact", key: "contact" },
] as const;

export async function Footer() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");
  const tCommon = await getTranslations("common");
  const year = new Date().getFullYear();

  return (
    <footer>
      <FooterMosaic />

      {/* ── Footer content ──────────────────────────────── */}
      <div className="bg-[#FAF7F3]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
            {/* Brand */}
            <div className="max-w-md">
              <Logo variant="footer" linked />
              <p className="mt-5 max-w-xs font-sans text-base leading-relaxed text-forest-600">
                {t("tagline")}
              </p>
            </div>

            <div className="flex flex-col gap-10 sm:flex-row sm:gap-16 lg:gap-24">
              {/* Contact */}
              <div>
                <p className="font-display italic text-xl font-semibold text-gold-dark sm:text-2xl">{t("contact")}</p>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="mt-3 inline-block font-sans text-base text-ink transition-opacity hover:opacity-60"
                >
                  {CONTACT_EMAIL}
                </a>
              </div>

              {/* Nav */}
              <div>
                <p className="font-display italic text-xl font-semibold text-gold-dark sm:text-2xl">Sivut</p>
                <nav aria-label="Footer navigation" className="mt-3">
                  <ul className="flex flex-col gap-3">
                    {navItems.map((item) => (
                      <li key={item.key}>
                        <Link
                          href={item.href}
                          className="font-sans text-base text-forest-700 transition-colors hover:text-ink"
                        >
                          {tNav(item.key)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </div>
          </div>

          <div className="mt-14 flex flex-col gap-3 border-t border-[color:var(--hairline)] pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-sans text-sm text-forest-400">
              © {year} {tCommon("brand")}. {t("rights")}
            </p>
            <Link
              href="/privacy"
              className="font-sans text-sm text-forest-400 transition-colors hover:text-ink"
            >
              {t("privacy")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
