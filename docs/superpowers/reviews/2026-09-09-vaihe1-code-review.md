# Code review — haara `vaihe1-viimeistely` → `main`

**Katselmoitu:** 2026-09-09 · **Laajuus:** 22 committia, 83 tiedostoa (pl. evidence-kuvat) · **Päätös:** APPROVE with comments

## Yhteenveto

Toteutus vastaa speciä (`docs/superpowers/specs/2026-09-09-phase1-completion-design.md`). Uusi logiikka on
puhtaissa moduuleissa testien takana (42 vitest-testiä), API-reitit validoivat syötteet ja vaativat
admin-istunnon, julkinen kalenteri ei koskaan näytä päiviä vapaina virhetilanteessa. Ei kriittisiä eikä
korkeita löydöksiä.

## Löydökset

### CRITICAL
Ei löydöksiä.

### HIGH
Ei löydöksiä.

### MEDIUM
1. **Admin voi syöttää minkä tahansa https-osoitteen, jonka palvelin hakee** (`src/app/api/admin/ical-sources/route.ts`,
   `…/test/route.ts`). SSRF-pinta rajautuu kirjautuneeseen adminiin ja https-skeemaan; sisäverkko-osoitteita
   ei erikseen estetä. Vercel-ympäristössä riski on pieni. Suositus vaiheeseen 2: salli vain tunnetut
   iCal-domainit (airbnb.*, booking.com) tai estä yksityiset IP-alueet.
2. **Esikatselutilassa kaikki klikkaukset `[data-cms]`-osioiden sisällä siepataan** (`CmsPreviewBridge.tsx`).
   Tarkoituksellista (klikkaus = valitse osio), mutta kalenterin ‹ › -napit ja UKK-haitarit eivät toimi
   iframessa. Dokumentoitu ADMIN-GUIDEen epäsuorasti ("klikkaa osiota"). Jos asiakas haluaa käyttää sivua
   iframessa normaalisti, lisää "Vain katselu" -kytkin.
3. **ESLint ei ole konfiguroitu** (`npm run lint` avaa interaktiivisen asennusvalinnan). Vanha tila, ei tämän
   haaran aiheuttama. Suositus: `next lint` strict-config + ajo CI:ssä.

### LOW
1. `AdminDashboard.tsx` on 612 riviä (Gantt + navigointi + modaalit). Toimii, mutta Gantt kannattaa
   irrottaa omaksi komponentikseen seuraavalla kerralla kun siihen kosketaan.
2. `PropertyAvailability` laskee `today`-arvon renderöintihetkellä; staattinen sivu voi olla enintään 3 h
   jäljessä (ISR `revalidate = 10800`). Hyväksytty kompromissi, sama kuin Airbnbn päivitysväli.
3. Teitulin neljä yksikköä piirtyvät adminin Ganttissa samalle riville (spec §4.6 ehdotti omia rivejä).
   Yksikkötunnus näkyy palkin tekstissä ja tooltipissa. Kirjattu WORKDESK-päätöksiin.
4. Impeccable-detektori: `globals.css` `.cursor-ring` animoi width/height (vanha koodi, vain
   desktop-osoitinlaitteet). Ei muutettu.

## Validointi

| Tarkistus | Tulos |
|---|---|
| `npx tsc --noEmit` | Pass |
| `npm run lint` | Skipped (ESLint ei konfiguroitu repossa) |
| `npm test` (vitest) | Pass — 42/42 |
| `npm run build` | Pass — kaikki reitit, `/[locale]/villas/[slug]` SSG + revalidate |
| `next start` savutesti | Pass — 12 julkista reittiä 200, `/api/admin/*` 401 ilman istuntoa |
| Playwright e2e (`scripts/evidence.mjs`) | Pass — admin-ical, pricing-e2e, admin-preview, contact-e2e, logo, pages (9 sivua, ei vaakavieritystä) |

## Turvallisuus

- Ei kovakoodattuja salaisuuksia; `.env.local` gitignoressa, `.env.example` päivitetty.
- Kaikki uudet `/api/admin/*`-reitit kutsuvat `requireAdmin()` ensimmäisenä.
- Syötteiden validointi: iCal-URL (https), kausihinnat (`validateSeasons`), viestirakenne (`validate-site-messages` + `mergeMessages`).
- postMessage-silta tarkistaa `event.origin === location.origin` molempiin suuntiin.

## Katselmoidut tiedostot (pääkohdat)

- Uudet: `src/lib/availability/*`, `src/lib/pricing/seasons.ts`, `src/lib/cms/cms-keys.ts`, `src/lib/data/merge-messages.ts`,
  `src/lib/data/ical-sources-store.ts`, `src/app/api/admin/ical-*`, `src/components/admin/AdminIcalSources.tsx`,
  `src/components/villas/{AvailabilityCalendar,PropertyAvailability}.tsx`, `src/components/pricing/SeasonPriceTable.tsx`,
  `src/components/cms/CmsPreviewBridge.tsx`, `scripts/{evidence,check-airbnb-coverage}.mjs`, `vitest.config.ts`, `CLAUDE.md`, `docs/WORKDESK.md`
- Muokatut: `AdminDashboard`, `AdminSiteContent`, `AdminPricing`, `AdminInbox`, `PropertyPrice`, `Hero`, `WindButton`, `Magnetic`,
  `Navbar`, `Logo`, `LanguageSwitcher`, `LocationFilter`, `PageHeader`, `ApartmentListingItem`, `globals.css`, `layout.tsx`,
  sivut `[locale]/*`, `api/{contact,inquiry}`, `api/admin/pricing`, `lib/email/send.ts`, `lib/data/{contact,inquiry,pricing,site-messages}-store`,
  `types/{availability,pricing,contact,inquiry}`, `messages/{fi,en}.json`, `README.md`, `ADMIN-GUIDE.md`, `.env.example`
