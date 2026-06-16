# Tahko Villas — Editorial-Brutalist Redesign (Phase 1)

Date: 2026-06-13
Status: Approved by owner (full delegation). Direction A "Monograph", warmed.

## Goal
Elevate the site to Awwwards-worthy while protecting bookings. Bold editorial-brutalist
art direction + custom motion craft, layered over the existing Next 14 / Tailwind /
next-intl stack. Presentation-layer rebuild only — data, content, admin CMS, email,
Airbnb sync, i18n (FI/EN), and SEO/JSON-LD are untouched.

Priority when in conflict: balance — wow without breaking the inquiry/booking flow,
mobile, or performance.

## Design system
- Palette: paper `#F1ECE1`, ink-forest `#0F1F17` / `#14241B`, gold accent `#B8955A`,
  mid-forest `#527660`. Existing forest/cream tokens retained, extended with `paper`/`ink`.
- Type:
  - `Archivo` (800/900) — display headlines, oversized, tight tracking; (400/500/600) body/UI.
  - `Fraunces` (italic) — editorial accents, pull-quotes, emphasized words.
  - `IBM Plex Mono` — eyebrows, meta, `01 / 03` indexing, captions, labels.
  - Replaces Cormorant Garamond + Source Sans 3 entirely.
- Structure: hairline rules, numbered indexes, asymmetric 12-col grid, generous negative
  space, recurring gold-block motif, mono captions.

## Motion & interaction (progressive enhancement)
- Lenis smooth scroll + GSAP/ScrollTrigger choreography (client-only providers).
- Line-by-line headline reveals (split-type); clip-path image-reveal masks on photos.
- Signature moment: pinned horizontal-scroll showcase of the 3 Tahko villas on the home page.
- Desktop-only custom cursor + magnetic buttons; marquee location strip; smooth nav.
- Hard rules: `prefers-reduced-motion` respected; mobile gets lighter/no heavy motion;
  motion never blocks or delays the inquiry form, calendar, or navigation; no CLS regressions.

## Architecture
- `src/components/motion/` — SmoothScrollProvider (Lenis), Reveal, RevealText, MagneticButton,
  Cursor, Marquee, HorizontalShowcase. All `"use client"`, SSR-safe, reduced-motion aware.
- `globals.css` + `tailwind.config.ts` — new tokens, utility classes (.eyebrow-mono,
  .display, .rule, .index-num, .gold-block), keyframes.
- Rebuild presentation components only; keep all props/data contracts and server components
  for data fetching. Motion wraps content, content stays server-rendered for SEO.

## Phase 1 scope
Design system + Home (Hero, TrustStrip, VillaPreviewGrid as horizontal showcase,
ApartmentPreviewGrid, HomeEditorialBand, BrandStory, CtaSection) + Navbar/Footer/SiteShell
+ Villas list + Villa detail. Phase 2: Apartments, Contact, FAQ, Privacy, 404.

## Out of scope / preserved
Admin UI, API routes, data stores, i18n message keys (values reused), JSON-LD components,
sitemap/robots, image assets.

## Verification
Run dev server; screenshot Home + Villas list + a Villa detail at desktop (1440) and
mobile (390) in EN and FI; confirm reduced-motion fallback; confirm inquiry form + calendar
still work; confirm no console errors and no layout shift on load.
