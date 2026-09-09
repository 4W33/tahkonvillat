# Tahkon Villat — vaihe 1 viimeistely: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Toteuttaa asiakkaan vaihe 1 -pyynnöt: Airbnb-synkattu saatavuuskalenteri, kausihinnat, mobiili- ja nappikorjaukset, admin-esikatselu, sähköposti-ilmoitukset, logon vaakaversio, Airbnb-kattavuuden tarkistus.

**Architecture:** Next 14 App Router -sovellus säilyy ennallaan; uudet ominaisuudet ovat (1) puhtaita TypeScript-moduuleja `src/lib/availability`, `src/lib/pricing`, `src/lib/cms` (TDD vitestillä), (2) niiden päälle ohuita admin-API-reittejä ja admin-komponentteja, (3) julkisia palvelinkomponentteja villasivulle. Tallennus jatkaa nykyisellä `readStoreJson/writeStoreJson`-kerroksella (Blob tuotannossa, `data/` kehityksessä). Ulkoinen data (Airbnb iCal) haetaan `fetch(url, { next: { revalidate: 10800 } })` -kutsulla, jolloin Next validoi villasivun uudelleen 3 h välein.

**Tech Stack:** Next.js 14.2.35, React 18, next-intl 4, Tailwind 3.4, `ical.js` 2.2.x (uusi), `vitest` 5 (uusi devDep), Resend 6, sharp.

**Spec:** `docs/superpowers/specs/2026-09-09-phase1-completion-design.md`

## Global Constraints

- Repo `C:\Users\user\Documents\tahkonvillat`, branch `main`. Commitit identiteetillä `4W3 <100098452+4W33@users.noreply.github.com>` (repokohtainen config on jo asetettu). **Ei `git push` ilman Mikin erillistä lupaa.**
- Kaikki käyttäjälle näkyvä copy suomeksi JA englanniksi `messages/fi.json` + `messages/en.json` -tiedostoissa. **Ei koskaan keksittyä markkinointitekstiä, hintaa tai asiakastietoa.** Sallittu copy = tekninen käyttöohje/UI-teksti (esim. "Vapaa", "Varattu", "Päivittyy noin 3 tunnin välein").
- Admin-UI on vain suomeksi (nykyinen käytäntö).
- Ei salaisuuksia gitiin. `.env.local` on gitignoressa. Claude ei syötä API-avaimia — Miki lisää ne itse.
- Ei IntersectionObserveria reveal-animaatioihin (projektin aiempi opetus). `Reveal`-komponentti on olemassa; käytä sitä.
- Ei uusia riippuvuuksia paitsi `ical.js` ja `vitest`. Ennen kirjaston API:n käyttöä: context7-dokumentaatio (tehty: ical.js `ICAL.parse` → `ICAL.Component` → `getAllSubcomponents("vevent")` → `new ICAL.Event(c)` → `startDate/endDate` (`ICAL.Time`: `.year .month .day .isDate`)).
- Kehityspalvelin: `.claude/launch.json` → `tahkonvillat-dev`, portti 3311. Käynnistä `preview_start`-työkalulla, älä Bashilla.
- Testit: `npm test` (vitest, run-tila). Tyypit: `npx tsc --noEmit`. Build: `npm run build`.
- Jokaisen tehtävän lopussa: `npx tsc --noEmit` puhdas + `npm test` vihreä + commit. Päivitä `docs/WORKDESK.md` tehtävän tila.
- Windows + OneDrive-historia: älä aja `npm run build` kun dev-palvelin on käynnissä.

---

## File Structure

**Uudet tiedostot**

| Polku | Vastuu |
|---|---|
| `vitest.config.ts` | testiajurin config, alias `@/` → `src/` |
| `CLAUDE.md` | projektiohjeet tuleville sessioille |
| `docs/WORKDESK.md` | projektin ohjaustaulu |
| `src/lib/data/merge-messages.ts` (+ `.test.ts`) | oletusviestien ja ylikirjoitusten syvämerge |
| `src/types/availability.ts` | kalenterityypit |
| `src/lib/availability/keys.ts` (+ test) | kalenteriavaimet villoista/yksiköistä |
| `src/lib/availability/ical.ts` (+ test) | ICS → varatut välit, välien yhdistäminen |
| `src/lib/availability/availability.ts` (+ test) | iCal + käsivaraukset → `Availability` |
| `src/lib/availability/calendar-grid.ts` (+ test) | kuukausiruudukon solut, `isBooked` |
| `src/lib/data/ical-sources-store.ts` | `data/ical-sources.json` luku/kirjoitus |
| `src/app/api/admin/ical-sources/route.ts` | GET/PUT lähteet |
| `src/app/api/admin/ical-sources/test/route.ts` | POST testaa URL |
| `src/app/api/admin/ical-bookings/route.ts` | GET kaikkien avainten varaukset |
| `src/components/admin/AdminIcalSources.tsx` | admin-näkymä iCal-linkeille |
| `src/components/villas/AvailabilityCalendar.tsx` | client: kuukausikalenteri + välilehdet |
| `src/components/villas/PropertyAvailability.tsx` | server: hakee datan, renderöi osion |
| `src/lib/pricing/seasons.ts` (+ test) | kausihintalogiikka |
| `src/components/pricing/SeasonPriceTable.tsx` | julkinen kausihintataulukko |
| `src/lib/cms/cms-keys.ts` (+ test) | `data-cms`-avaimen haku, esikatselu-URL |
| `src/components/cms/CmsPreviewBridge.tsx` | iframe-silta (client) |
| `scripts/check-airbnb-coverage.mjs` | vertaa profiilin listaukset mappaukseen |

**Muokattavat tiedostot**

| Polku | Muutos |
|---|---|
| `package.json` | scripts `test`, deps `ical.js`, devDeps `vitest` |
| `src/lib/data/site-messages-store.ts` | käytä `mergeMessages` |
| `src/types/villa.ts` | ei muutosta (Reservation säilyy) |
| `src/types/pricing.ts` | `PriceSeason`, `seasons?` |
| `src/lib/data/pricing.ts` | palauta myös pelkkien kausien kohde |
| `src/app/api/admin/pricing/route.ts` | validoi kaudet |
| `src/components/pricing/PropertyPrice.tsx` | display-hinta + taulukko |
| `src/components/admin/AdminPricing.tsx` | kausirivit |
| `src/components/admin/AdminDashboard.tsx` | uusi näkymä `ical`, harmaat Airbnb-palkit |
| `src/components/admin/AdminSiteContent.tsx` | split-näkymä + postMessage |
| `src/components/admin/AdminInbox.tsx` | "ilmoitus epäonnistui" -merkki |
| `src/app/[locale]/villas/[slug]/page.tsx` | `PropertyAvailability`, `revalidate` |
| `src/app/[locale]/villas/page.tsx` | `revalidate` |
| `src/app/[locale]/layout.tsx` | `CmsPreviewBridge` |
| `src/components/home/*.tsx`, `layout/Navbar.tsx`, `layout/Footer.tsx`, `ui/PageHeader.tsx` | `data-cms`-attribuutit |
| `src/components/home/Hero.tsx`, `ui/WindButton.tsx`, `motion/Magnetic.tsx`, `layout/Navbar.tsx`, `layout/LanguageSwitcher.tsx`, `villas/LocationFilter.tsx`, `app/globals.css` | mobiili + kulmapyöristys |
| `src/components/layout/Logo.tsx` | vaakaversio |
| `src/lib/email/send.ts`, `src/app/api/contact/route.ts`, `src/app/api/inquiry/route.ts`, `src/lib/data/contact-store.ts`, `src/lib/data/inquiry-store.ts`, `src/types/contact.ts`, `src/types/inquiry.ts` | `EMAIL_TO`, `notified` |
| `messages/fi.json`, `messages/en.json` | uudet avaimet (kalenteri, hinnat) |
| `.env.example`, `README.md`, `ADMIN-GUIDE.md` | dokumentaatio |

---

## Part A — Perusta

### Task 1: Vitest + viestien syvämerge (piilevän bugin korjaus)

**Miksi:** `getSiteMessages` palauttaa tallennetun ylikirjoituksen sellaisenaan. Kun `messages/*.json`-tiedostoihin lisätään uusia avaimia (tämä plan lisää), tuotannon ylikirjoituksesta ne puuttuvat → `t("pricing.seasonsTitle")` hajoaa ja admin-tallennus kaatuu validointiin ("odotettiin tekstiä"). Korjaus: merge = kävele template, ota tallennettu arvo jos tyyppi täsmää, muuten oletus; templaten ulkopuoliset avaimet pudotetaan.

**Files:**
- Create: `vitest.config.ts`
- Create: `src/lib/data/merge-messages.ts`
- Create: `src/lib/data/merge-messages.test.ts`
- Modify: `package.json` (scripts, devDependencies)
- Modify: `src/lib/data/site-messages-store.ts:20-24`

**Interfaces:**
- Produces: `mergeMessages<T>(template: T, stored: unknown): T`

- [ ] **Step 1: Asenna vitest ja lisää skriptit**

```bash
cd /c/Users/user/Documents/tahkonvillat && npm install --save-dev vitest@5
```

Lisää `package.json`:n `scripts`-lohkoon:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 2: Luo `vitest.config.ts`**

```ts
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 3: Kirjoita epäonnistuva testi `src/lib/data/merge-messages.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { mergeMessages } from "./merge-messages";

const template = {
  home: { hero: { title: "Oletus", cta: "Tutustu" }, steps: ["a", "b"] },
  pricing: { fromPerNight: "alkaen {price}", seasonsTitle: "Hinnat kausittain" },
};

describe("mergeMessages", () => {
  it("tallennettu arvo voittaa kun tyyppi täsmää", () => {
    const stored = { home: { hero: { title: "Oma otsikko" } } };
    const out = mergeMessages(template, stored);
    expect(out.home.hero.title).toBe("Oma otsikko");
    expect(out.home.hero.cta).toBe("Tutustu");
  });

  it("templaten uudet avaimet tulevat mukaan vaikka tallennetusta puuttuvat", () => {
    const stored = { pricing: { fromPerNight: "from {price}" } };
    const out = mergeMessages(template, stored);
    expect(out.pricing.seasonsTitle).toBe("Hinnat kausittain");
    expect(out.pricing.fromPerNight).toBe("from {price}");
  });

  it("tallennetun ylimääräiset avaimet pudotetaan", () => {
    const stored = { home: { hero: { title: "x", vanha: "poistettu" } } };
    const out = mergeMessages(template, stored) as unknown as Record<string, Record<string, Record<string, string>>>;
    expect(out.home.hero.vanha).toBeUndefined();
  });

  it("merkkijonolista otetaan tallennetusta vain jos se on merkkijonolista", () => {
    expect(mergeMessages(template, { home: { steps: ["x"] } }).home.steps).toEqual(["x"]);
    expect(mergeMessages(template, { home: { steps: "ei lista" } }).home.steps).toEqual(["a", "b"]);
  });

  it("null/undefined tallennettu palauttaa templaten", () => {
    expect(mergeMessages(template, null)).toEqual(template);
    expect(mergeMessages(template, undefined)).toEqual(template);
  });
});
```

- [ ] **Step 4: Aja testi — odotettu FAIL**

Run: `npm test -- src/lib/data/merge-messages.test.ts`
Expected: FAIL, "Cannot find module './merge-messages'"

- [ ] **Step 5: Toteuta `src/lib/data/merge-messages.ts`**

```ts
/**
 * Syvämerge: kävelee templaten (messages/fi.json-rakenne) ja poimii tallennetusta
 * ylikirjoituksesta arvon vain, jos sen tyyppi täsmää. Templaten ulkopuoliset
 * avaimet pudotetaan. Näin uudet avaimet toimivat heti ja admin-tallennus
 * läpäisee validate-site-messages-tarkistuksen.
 */
export function mergeMessages<T>(template: T, stored: unknown): T {
  if (typeof template === "string") {
    return (typeof stored === "string" ? stored : template) as T;
  }

  if (Array.isArray(template)) {
    const ok =
      Array.isArray(stored) && stored.every((item) => typeof item === "string");
    return (ok ? stored : template) as T;
  }

  if (template && typeof template === "object") {
    const source =
      stored && typeof stored === "object" && !Array.isArray(stored)
        ? (stored as Record<string, unknown>)
        : {};
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(template as Record<string, unknown>)) {
      out[key] = mergeMessages(
        (template as Record<string, unknown>)[key],
        source[key],
      );
    }
    return out as T;
  }

  return template;
}
```

- [ ] **Step 6: Käytä mergeä `site-messages-store.ts`:ssä**

Korvaa `getSiteMessages`:

```ts
import { mergeMessages } from "@/lib/data/merge-messages";

export async function getSiteMessages(locale: string): Promise<SiteMessages> {
  const bundled = await readBundledMessages(locale);
  const stored = await readStoreJson<unknown>(messageFile(locale));
  if (!stored) return bundled;
  return mergeMessages(bundled, stored);
}
```

- [ ] **Step 7: Aja testit ja tyypit**

Run: `npm test` → Expected: 5 passed
Run: `npx tsc --noEmit` → Expected: no output (exit 0)

- [ ] **Step 8: Commit**

```bash
git add vitest.config.ts package.json package-lock.json src/lib/data/merge-messages.ts src/lib/data/merge-messages.test.ts src/lib/data/site-messages-store.ts
git commit -m "fix(cms): syvämerge oletusviestit + ylikirjoitus, vitest-pohja

Tallennettu ylikirjoitus korvasi oletukset kokonaan, jolloin uudet
avaimet puuttuivat ja admin-tallennus kaatui validointiin.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 2: CLAUDE.md ja WORKDESK.md

**Files:**
- Create: `CLAUDE.md`
- Create: `docs/WORKDESK.md`

- [ ] **Step 1: Luo `CLAUDE.md`**

```markdown
# Tahkon Villat — projektiohjeet (Claude Code)

## Repo ja identiteetti
- GitHub: `4W33/tahkonvillat` (Walterin tili). Tämän repon commitit tehdään identiteetillä
  `4W3 <100098452+4W33@users.noreply.github.com>` — asetettu repokohtaisesti (`git config user.name/email`).
  Globaali identiteetti (Andy-16300) EI muutu, älä koske `--global`-asetuksiin.
- Ennen pushia: `gh auth status` → aktiivisen tilin pitää olla `4W33`. Jos ei: `gh auth switch --user 4W33`.
- **Ei `git push` ilman Mikin erillistä lupaa.** Committaa vapaasti.

## Missä mikäkin on
- Ohjaustaulu (tehtävät, päätökset, asiakkaalta odotettavat): `docs/WORKDESK.md` — päivitä jokaisen tehtävän jälkeen.
- Spec: `docs/superpowers/specs/2026-09-09-phase1-completion-design.md`
- Plan: `docs/superpowers/plans/2026-09-09-phase1-completion.md`
- Asiakasohje: `ADMIN-GUIDE.md` · deploy: `DEPLOY.md`

## Komennot
- Dev: `preview_start` → `tahkonvillat-dev` (portti 3311). Älä aja `npm run build` kun dev pyörii.
- Testit: `npm test` · tyypit: `npx tsc --noEmit` · build: `npm run build`
- Sisältö: `npm run content:import` (Airbnb-scrape) · `npm run content:messages` (CMS-tekstipohja)

## Kovat säännöt
- Ei koskaan keksittyä copya, hintaa tai asiakastietoa. Kaikki teksti `messages/*.json` (fi+en) tai Airbnb-datasta.
- Ei salaisuuksia gitiin. Miki syöttää avaimet itse (`.env.local`, Vercel).
- Ei IntersectionObserveria reveal-animaatioihin — käytä `ui/Reveal`.
- Kaikki julkiset napit: `rounded-lg` (0.875 rem). Ei pill-nappeja.
- Tekstit: `getSiteMessages` mergeää oletukset + ylikirjoituksen (`merge-messages.ts`). Uusi avain lisätään AINA molempiin `messages/fi.json` ja `messages/en.json`.
- Kalenteri: iCal-linkit adminissa (`data/ical-sources.json`), haku 3 h välimuistilla. Virhetilanteessa EI näytetä päiviä vapaina.
```

- [ ] **Step 2: Luo `docs/WORKDESK.md`**

```markdown
# WORKDESK — Tahkon Villat

Päivitetty: 2026-09-09 · Vastuu: Novo Media (Miki + Walter) · Asiakas: Tahkon Villat

## Tila

| # | Tehtävä | Tila | Todiste |
|---|---------|------|---------|
| 1 | Vitest + viestien syvämerge | ☐ | |
| 2 | CLAUDE.md + WORKDESK | ☐ | |
| 3–8 | Saatavuuskalenteri (iCal) | ☐ | |
| 9–11 | Kausihinnat | ☐ | |
| 12–13 | Mobiili + napit | ☐ | |
| 14–16 | Admin-esikatselu | ☐ | |
| 17 | Sähköposti (EMAIL_TO, notified) | ☐ | |
| 18 | Airbnb-kattavuus | ☐ | |
| 19 | Logo vaakaversio | ☐ | |
| 20 | Loppuverifiointi + code review | ☐ | |

## Päätökset
- 2026-09-09 Nykyinen admin + iframe-esikatselu, ei Sanitya (Miki).
- 2026-09-09 Sovellus Verceliin, tahkonvillat.fi DNS Domainhotellilta Verceliin (Miki). Domainhotellilla ei todennettua Node.js-tukea.
- 2026-09-09 Commitit 4W33-identiteetillä tässä repossa (Miki).
- 2026-09-09 Kalenteri vain villoille (asunnoilla ei omaa sivua) — asunnot myöhemmin jos asiakas pyytää.

## Odottaa asiakkaalta / Walterilta
- [ ] Airbnb iCal -vientilinkit: Villa Puolukka, Villa Karpalo, Teituli A, B, 8A, 8B (Airbnb → Kalenteri → Saatavuus → Connect to another website → kopioi linkki). Asiakas voi liittää ne itse adminiin (Airbnb-kalenterit).
- [ ] Logon lähdetiedosto (ChatGPT-linkki vaatii kirjautumisen) → `public/images/logo-source.png`
- [ ] Resend: API-avain + domainin (tahkonvillat.fi) DNS-tietueet (Miki/Walter)
- [ ] Vahvistus, onko Airbnb-profiilissa uusia listauksia kesäkuun 2026 jälkeen

## Vaihe 2 (ei aloitettu)
- Vercel-projekti + env-muuttujat + `storage:seed` (DEPLOY.md)
- DNS tahkonvillat.fi → Vercel; Resend-domain verifiointi
- PDF-sisällönhallintaopas asiakkaalle
- Loppukatselmus + `/delivery-check` → laskutus
```

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md docs/WORKDESK.md
git commit -m "docs: CLAUDE.md (4W33-identiteetti, säännöt) + WORKDESK-ohjaustaulu

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

## Part B — Saatavuuskalenteri

### Task 3: Kalenterityypit ja -avaimet

**Files:**
- Create: `src/types/availability.ts`
- Create: `src/lib/availability/keys.ts`
- Create: `src/lib/availability/keys.test.ts`

**Interfaces:**
- Produces:
  - `type IcalSource = { url: string; updatedAt: string }`
  - `type IcalSourceStore = Record<string, IcalSource>`
  - `type BookedRange = { start: string; end: string; source: "airbnb" | "manual" }` (end eksklusiivinen, `YYYY-MM-DD`)
  - `type AvailabilityStatus = "ok" | "unavailable" | "unconfigured"`
  - `type Availability = { key: string; booked: BookedRange[]; status: AvailabilityStatus }`
  - `type CalendarKey = { key: string; propertySlug: string; unitId?: string; label: { fi: string; en: string } }`
  - `listCalendarKeys(villas: Pick<Villa, "slug" | "name" | "units">[]): CalendarKey[]`
  - `parseCalendarKey(key: string): { propertySlug: string; unitId?: string }`

- [ ] **Step 1: Luo `src/types/availability.ts`**

```ts
export type IcalSource = { url: string; updatedAt: string };
export type IcalSourceStore = Record<string, IcalSource>;

/** end on EKSKLUSIIVINEN (iCal DTEND -semantiikka): 2026-09-12..2026-09-15 = yöt 12, 13, 14. */
export type BookedRange = {
  start: string;
  end: string;
  source: "airbnb" | "manual";
};

export type AvailabilityStatus = "ok" | "unavailable" | "unconfigured";

export type Availability = {
  key: string;
  booked: BookedRange[];
  status: AvailabilityStatus;
};

export type CalendarKey = {
  key: string;
  propertySlug: string;
  unitId?: string;
  label: { fi: string; en: string };
};
```

- [ ] **Step 2: Kirjoita testi `src/lib/availability/keys.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { listCalendarKeys, parseCalendarKey } from "./keys";

const villas = [
  { slug: "villa-puolukka", name: { fi: "Villa Puolukka", en: "Villa Puolukka" } },
  {
    slug: "tahkon-teituli",
    name: { fi: "Tahkon Teituli", en: "Tahkon Teituli" },
    units: [
      { id: "a", name: { fi: "Teituli A", en: "Teituli A" }, guests: 4, bedrooms: 2 },
      { id: "8b", name: { fi: "Teituli 8B", en: "Teituli 8B" }, guests: 6, bedrooms: 2 },
    ],
  },
];

describe("listCalendarKeys", () => {
  it("villa ilman yksiköitä saa yhden avaimen", () => {
    const keys = listCalendarKeys(villas);
    expect(keys[0]).toEqual({
      key: "villa-puolukka",
      propertySlug: "villa-puolukka",
      label: { fi: "Villa Puolukka", en: "Villa Puolukka" },
    });
  });

  it("villa yksiköillä saa avaimen per yksikkö", () => {
    const keys = listCalendarKeys(villas).filter((k) => k.propertySlug === "tahkon-teituli");
    expect(keys.map((k) => k.key)).toEqual(["tahkon-teituli:a", "tahkon-teituli:8b"]);
    expect(keys[1].unitId).toBe("8b");
    expect(keys[1].label.fi).toBe("Teituli 8B");
  });
});

describe("parseCalendarKey", () => {
  it("jakaa slugin ja yksikön", () => {
    expect(parseCalendarKey("tahkon-teituli:8b")).toEqual({ propertySlug: "tahkon-teituli", unitId: "8b" });
    expect(parseCalendarKey("villa-karpalo")).toEqual({ propertySlug: "villa-karpalo" });
  });
});
```

- [ ] **Step 3: Aja — odotettu FAIL** (`npm test -- keys`)

- [ ] **Step 4: Toteuta `src/lib/availability/keys.ts`**

```ts
import type { CalendarKey } from "@/types/availability";
import type { Villa } from "@/types/villa";

type VillaLike = Pick<Villa, "slug" | "name" | "units">;

export function listCalendarKeys(villas: VillaLike[]): CalendarKey[] {
  return villas.flatMap((villa) => {
    if (villa.units && villa.units.length > 0) {
      return villa.units.map((unit) => ({
        key: `${villa.slug}:${unit.id}`,
        propertySlug: villa.slug,
        unitId: unit.id,
        label: unit.name,
      }));
    }
    return [{ key: villa.slug, propertySlug: villa.slug, label: villa.name }];
  });
}

export function parseCalendarKey(key: string): { propertySlug: string; unitId?: string } {
  const [propertySlug, unitId] = key.split(":");
  return unitId ? { propertySlug, unitId } : { propertySlug };
}
```

- [ ] **Step 5: Aja testit ja tyypit** → `npm test` vihreä, `npx tsc --noEmit` puhdas

- [ ] **Step 6: Commit**

```bash
git add src/types/availability.ts src/lib/availability/keys.ts src/lib/availability/keys.test.ts
git commit -m "feat(calendar): kalenterityypit ja avaimet (villa / villa:yksikkö)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 4: ICS-jäsennys ja välien yhdistäminen

**Files:**
- Create: `src/lib/availability/ical.ts`
- Create: `src/lib/availability/ical.test.ts`
- Modify: `package.json` (dep `ical.js`)

**Interfaces:**
- Produces: `parseIcsToRanges(ics: string): BookedRange[]`, `mergeRanges(ranges: BookedRange[]): BookedRange[]`, `addDays(iso: string, days: number): string`

- [ ] **Step 1: Asenna ical.js**

```bash
cd /c/Users/user/Documents/tahkonvillat && npm install ical.js@2
```

- [ ] **Step 2: Testi `src/lib/availability/ical.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { addDays, mergeRanges, parseIcsToRanges } from "./ical";

const AIRBNB_ICS = [
  "BEGIN:VCALENDAR",
  "PRODID;X-RICAL-TZSOURCE=TZINFO:-//Airbnb Inc//Hosting Calendar 0.8.8//EN",
  "CALSCALE:GREGORIAN",
  "VERSION:2.0",
  "BEGIN:VEVENT",
  "DTEND;VALUE=DATE:20260915",
  "DTSTART;VALUE=DATE:20260912",
  "UID:abc123@airbnb.com",
  "SUMMARY:Reserved",
  "END:VEVENT",
  "BEGIN:VEVENT",
  "DTEND;VALUE=DATE:20261003",
  "DTSTART;VALUE=DATE:20261001",
  "UID:def456@airbnb.com",
  "SUMMARY:Airbnb (Not available)",
  "END:VEVENT",
  "END:VCALENDAR",
].join("\r\n");

describe("parseIcsToRanges", () => {
  it("lukee all-day VEVENTit väleiksi (end eksklusiivinen)", () => {
    expect(parseIcsToRanges(AIRBNB_ICS)).toEqual([
      { start: "2026-09-12", end: "2026-09-15", source: "airbnb" },
      { start: "2026-10-01", end: "2026-10-03", source: "airbnb" },
    ]);
  });

  it("DTEND puuttuu → yksi yö", () => {
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:x",
      "BEGIN:VEVENT", "DTSTART;VALUE=DATE:20260920", "UID:1", "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    expect(parseIcsToRanges(ics)).toEqual([{ start: "2026-09-20", end: "2026-09-21", source: "airbnb" }]);
  });

  it("tyhjä syöte → tyhjä lista", () => {
    expect(parseIcsToRanges("")).toEqual([]);
    expect(parseIcsToRanges("   \n")).toEqual([]);
  });

  it("roska heittää virheen (kutsuja päättää tilan)", () => {
    expect(() => parseIcsToRanges("<html>login</html>")).toThrow();
  });
});

describe("mergeRanges", () => {
  it("yhdistää päällekkäiset ja vierekkäiset saman lähteen välit", () => {
    expect(
      mergeRanges([
        { start: "2026-09-10", end: "2026-09-12", source: "airbnb" },
        { start: "2026-09-12", end: "2026-09-14", source: "airbnb" },
        { start: "2026-09-13", end: "2026-09-15", source: "airbnb" },
        { start: "2026-09-20", end: "2026-09-21", source: "airbnb" },
      ]),
    ).toEqual([
      { start: "2026-09-10", end: "2026-09-15", source: "airbnb" },
      { start: "2026-09-20", end: "2026-09-21", source: "airbnb" },
    ]);
  });

  it("eri lähteitä ei yhdistetä", () => {
    const out = mergeRanges([
      { start: "2026-09-10", end: "2026-09-12", source: "manual" },
      { start: "2026-09-11", end: "2026-09-13", source: "airbnb" },
    ]);
    expect(out).toHaveLength(2);
  });
});

describe("addDays", () => {
  it("laskee kuukauden yli", () => {
    expect(addDays("2026-09-30", 1)).toBe("2026-10-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });
});
```

- [ ] **Step 3: Aja — odotettu FAIL**

- [ ] **Step 4: Toteuta `src/lib/availability/ical.ts`**

```ts
import ICAL from "ical.js";
import type { BookedRange } from "@/types/availability";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** ICAL.Time → YYYY-MM-DD kalenterin omassa päivämäärässä (ei aikavyöhykesiirtoa). */
function toIsoDate(time: { year: number; month: number; day: number }): string {
  return `${time.year}-${pad(time.month)}-${pad(time.day)}`;
}

export function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Yhdistää päällekkäiset/vierekkäiset saman lähteen välit. Palauttaa uuden, järjestetyn listan. */
export function mergeRanges(ranges: BookedRange[]): BookedRange[] {
  const sorted = [...ranges].sort(
    (a, b) => a.start.localeCompare(b.start) || a.end.localeCompare(b.end),
  );
  const out: BookedRange[] = [];
  for (const range of sorted) {
    const last = out[out.length - 1];
    if (last && last.source === range.source && range.start <= last.end) {
      if (range.end > last.end) last.end = range.end;
    } else {
      out.push({ ...range });
    }
  }
  return out;
}

/**
 * Jäsentää iCal-tekstin varatuiksi väleiksi. Kaikki VEVENTit tulkitaan varatuiksi
 * (Airbnb: "Reserved", "Airbnb (Not available)"). Heittää, jos syöte ei ole iCal.
 */
export function parseIcsToRanges(ics: string): BookedRange[] {
  if (!ics.trim()) return [];

  const jcal = ICAL.parse(ics);
  const root = new ICAL.Component(Array.isArray(jcal[0]) ? jcal[0] : jcal);
  const events = root.getAllSubcomponents("vevent");

  const ranges: BookedRange[] = [];
  for (const component of events) {
    const event = new ICAL.Event(component);
    if (!event.startDate) continue;
    const start = toIsoDate(event.startDate);
    let end = event.endDate ? toIsoDate(event.endDate) : addDays(start, 1);
    if (end <= start) end = addDays(start, 1);
    ranges.push({ start, end, source: "airbnb" });
  }

  return mergeRanges(ranges);
}
```

Huom: `ICAL.parse` palauttaa yhden VCALENDARin jCal-taulukkona `["vcalendar", [...], [...]]`; jos syötteessä on useita juurikomponentteja, tulos on taulukko taulukoita — `Array.isArray(jcal[0])` erottaa tapaukset. Jos `tsc` valittaa `ical.js`-tyypeistä, tarkista että `node_modules/ical.js/dist/types/module.d.ts` on olemassa (versio 2.2.x sisältää tyypit); älä lisää `declare module` -stubia ennen kuin olet varmistanut puutteen.

- [ ] **Step 5: Aja testit + tyypit** → vihreä, puhdas

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/lib/availability/ical.ts src/lib/availability/ical.test.ts
git commit -m "feat(calendar): iCal-jäsennys (ical.js) ja välien yhdistäminen

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 5: Lähdevarasto ja `getAvailability`

**Files:**
- Create: `src/lib/data/ical-sources-store.ts`
- Create: `src/lib/availability/availability.ts`
- Create: `src/lib/availability/availability.test.ts`

**Interfaces:**
- Consumes: `parseIcsToRanges`, `mergeRanges` (Task 4); `parseCalendarKey` (Task 3); `readReservations` (`@/lib/data/reservation-store`)
- Produces:
  - `readIcalSources(): Promise<IcalSourceStore>`, `writeIcalSources(store: IcalSourceStore): Promise<void>`
  - `REVALIDATE_SECONDS = 10800`
  - `fetchIcsText(url: string, opts?: { noStore?: boolean }): Promise<string>`
  - `type AvailabilityDeps = { fetchIcs: (url: string) => Promise<string>; readSources: () => Promise<IcalSourceStore>; readReservations: () => Promise<Reservation[]> }`
  - `getAvailability(key: string, deps?: Partial<AvailabilityDeps>): Promise<Availability>`

- [ ] **Step 1: Luo `src/lib/data/ical-sources-store.ts`**

```ts
import { readStoreJson, writeStoreJson } from "@/lib/storage/json";
import type { IcalSourceStore } from "@/types/availability";

const ICAL_SOURCES_PATH = "data/ical-sources.json";

export async function readIcalSources(): Promise<IcalSourceStore> {
  const store = await readStoreJson<IcalSourceStore>(ICAL_SOURCES_PATH);
  if (!store || typeof store !== "object" || Array.isArray(store)) return {};
  return store;
}

export async function writeIcalSources(store: IcalSourceStore): Promise<void> {
  await writeStoreJson(ICAL_SOURCES_PATH, store, { access: "private" });
}
```

- [ ] **Step 2: Testi `src/lib/availability/availability.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { getAvailability } from "./availability";

const ICS = [
  "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:x",
  "BEGIN:VEVENT", "DTSTART;VALUE=DATE:20260912", "DTEND;VALUE=DATE:20260915", "UID:1", "END:VEVENT",
  "END:VCALENDAR",
].join("\r\n");

const sources = { "villa-puolukka": { url: "https://example.test/a.ics", updatedAt: "2026-09-09T00:00:00Z" } };
const reservations = [
  { id: "r1", propertySlug: "villa-puolukka", startDate: "2026-09-20", endDate: "2026-09-22", guestName: "x" },
  { id: "r2", propertySlug: "tahkon-teituli", startDate: "2026-11-01", endDate: "2026-11-03", guestName: "y" },
];

describe("getAvailability", () => {
  it("yhdistää iCalin ja käsivaraukset, status ok", async () => {
    const out = await getAvailability("villa-puolukka", {
      fetchIcs: async () => ICS,
      readSources: async () => sources,
      readReservations: async () => reservations,
    });
    expect(out.status).toBe("ok");
    expect(out.booked).toEqual([
      { start: "2026-09-12", end: "2026-09-15", source: "airbnb" },
      { start: "2026-09-20", end: "2026-09-22", source: "manual" },
    ]);
  });

  it("lähde puuttuu → unconfigured, vain käsivaraukset", async () => {
    const out = await getAvailability("villa-karpalo", {
      fetchIcs: async () => { throw new Error("ei saa kutsua"); },
      readSources: async () => sources,
      readReservations: async () => reservations,
    });
    expect(out.status).toBe("unconfigured");
    expect(out.booked).toEqual([]);
  });

  it("haku epäonnistuu → unavailable, käsivaraukset säilyvät, ei tyhjää 'kaikki vapaana'", async () => {
    const out = await getAvailability("villa-puolukka", {
      fetchIcs: async () => { throw new Error("503"); },
      readSources: async () => sources,
      readReservations: async () => reservations,
    });
    expect(out.status).toBe("unavailable");
    expect(out.booked).toEqual([{ start: "2026-09-20", end: "2026-09-22", source: "manual" }]);
  });

  it("yksikköavain perii kohteen käsivaraukset", async () => {
    const out = await getAvailability("tahkon-teituli:8b", {
      fetchIcs: async () => ICS,
      readSources: async () => ({ "tahkon-teituli:8b": sources["villa-puolukka"] }),
      readReservations: async () => reservations,
    });
    expect(out.booked.some((r) => r.source === "manual" && r.start === "2026-11-01")).toBe(true);
  });
});
```

- [ ] **Step 3: Aja — odotettu FAIL**

- [ ] **Step 4: Toteuta `src/lib/availability/availability.ts`**

```ts
import { readIcalSources } from "@/lib/data/ical-sources-store";
import { readReservations } from "@/lib/data/reservation-store";
import type { Availability, BookedRange, IcalSourceStore } from "@/types/availability";
import type { Reservation } from "@/types/villa";
import { mergeRanges, parseIcsToRanges } from "./ical";
import { parseCalendarKey } from "./keys";

/** 3 h — sama kuin Airbnbn oma kalenteripäivitysväli. Ohjaa myös villasivun ISR-aikaa. */
export const REVALIDATE_SECONDS = 10800;

export async function fetchIcsText(
  url: string,
  opts: { noStore?: boolean } = {},
): Promise<string> {
  const response = await fetch(url, {
    headers: { accept: "text/calendar, text/plain;q=0.8, */*;q=0.5" },
    ...(opts.noStore ? { cache: "no-store" as const } : { next: { revalidate: REVALIDATE_SECONDS } }),
  });
  if (!response.ok) {
    throw new Error(`iCal fetch failed: HTTP ${response.status}`);
  }
  return response.text();
}

export type AvailabilityDeps = {
  fetchIcs: (url: string) => Promise<string>;
  readSources: () => Promise<IcalSourceStore>;
  readReservations: () => Promise<Reservation[]>;
};

const defaultDeps: AvailabilityDeps = {
  fetchIcs: (url) => fetchIcsText(url),
  readSources: readIcalSources,
  readReservations,
};

function manualRanges(reservations: Reservation[], propertySlug: string): BookedRange[] {
  return reservations
    .filter((r) => r.propertySlug === propertySlug)
    .map((r) => ({ start: r.startDate, end: r.endDate, source: "manual" as const }));
}

export async function getAvailability(
  key: string,
  overrides: Partial<AvailabilityDeps> = {},
): Promise<Availability> {
  const deps = { ...defaultDeps, ...overrides };
  const { propertySlug } = parseCalendarKey(key);
  const [sources, reservations] = await Promise.all([deps.readSources(), deps.readReservations()]);
  const manual = manualRanges(reservations, propertySlug);
  const source = sources[key];

  if (!source?.url) {
    return { key, booked: mergeRanges(manual), status: "unconfigured" };
  }

  try {
    const ics = await deps.fetchIcs(source.url);
    const airbnb = parseIcsToRanges(ics);
    return { key, booked: mergeRanges([...airbnb, ...manual]), status: "ok" };
  } catch (error) {
    console.error(`[availability] ${key}: ${error instanceof Error ? error.message : String(error)}`);
    return { key, booked: mergeRanges(manual), status: "unavailable" };
  }
}
```

- [ ] **Step 5: Aja testit + tyypit** → vihreä, puhdas

- [ ] **Step 6: Commit**

```bash
git add src/lib/data/ical-sources-store.ts src/lib/availability/availability.ts src/lib/availability/availability.test.ts
git commit -m "feat(calendar): iCal-lähdevarasto ja getAvailability (iCal + käsivaraukset, virhetila)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 6: Admin-API:t iCal-lähteille

**Files:**
- Create: `src/app/api/admin/ical-sources/route.ts`
- Create: `src/app/api/admin/ical-sources/test/route.ts`
- Create: `src/app/api/admin/ical-bookings/route.ts`

**Interfaces:**
- Consumes: `requireAdmin` (`@/lib/admin/api-auth`), `getVillas` (`@/lib/content/villas`), `listCalendarKeys`, `readIcalSources/writeIcalSources`, `fetchIcsText`, `parseIcsToRanges`, `getAvailability`, `revalidatePropertyPaths` (`@/lib/admin/revalidate-property`)
- Produces:
  - `GET /api/admin/ical-sources` → `{ keys: CalendarKey[]; sources: IcalSourceStore }`
  - `PUT /api/admin/ical-sources` body `{ sources: Record<string, string> }` (avain → url, tyhjä = poista) → `{ sources: IcalSourceStore }`
  - `POST /api/admin/ical-sources/test` body `{ url }` → `{ ok: true; count: number; next: BookedRange | null } | { ok: false; error: string }`
  - `GET /api/admin/ical-bookings` → `Record<string, Availability>`

- [ ] **Step 1: `src/app/api/admin/ical-sources/route.ts`**

```ts
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api-auth";
import { revalidatePropertyPaths } from "@/lib/admin/revalidate-property";
import { listCalendarKeys } from "@/lib/availability/keys";
import { getVillas } from "@/lib/content/villas";
import { readIcalSources, writeIcalSources } from "@/lib/data/ical-sources-store";
import type { IcalSourceStore } from "@/types/availability";

export function isValidIcalUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.length > 0;
  } catch {
    return false;
  }
}

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const [villas, sources] = await Promise.all([getVillas(), readIcalSources()]);
  return NextResponse.json({ keys: listCalendarKeys(villas), sources });
}

export async function PUT(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = (await request.json()) as { sources?: Record<string, unknown> };
    if (!body.sources || typeof body.sources !== "object") {
      return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 400 });
    }

    const villas = await getVillas();
    const keys = listCalendarKeys(villas);
    const validKeys = new Map(keys.map((k) => [k.key, k]));
    const existing = await readIcalSources();
    const next: IcalSourceStore = {};
    const touched = new Set<string>();

    for (const [key, raw] of Object.entries(body.sources)) {
      const info = validKeys.get(key);
      if (!info) return NextResponse.json({ error: `Tuntematon kohde: ${key}` }, { status: 400 });
      const url = typeof raw === "string" ? raw.trim() : "";
      if (!url) {
        touched.add(info.propertySlug);
        continue;
      }
      if (!isValidIcalUrl(url)) {
        return NextResponse.json({ error: `${info.label.fi}: osoitteen pitää alkaa https://` }, { status: 400 });
      }
      next[key] = {
        url,
        updatedAt: existing[key]?.url === url ? existing[key].updatedAt : new Date().toISOString(),
      };
      touched.add(info.propertySlug);
    }

    await writeIcalSources(next);
    for (const slug of touched) revalidatePropertyPaths(slug, "villa");
    return NextResponse.json({ sources: next });
  } catch {
    return NextResponse.json({ error: "Tallennus epäonnistui" }, { status: 500 });
  }
}
```

Huom: `isValidIcalUrl` viedään reittitiedostosta vain testattavuuden vuoksi — Next sallii reitistä vain HTTP-metodien viennit tuotantobuildissa? **Ei salli** (build varoittaa "route exports invalid field"). Siirrä `isValidIcalUrl` tiedostoon `src/lib/availability/validate-url.ts` ja importoi se reittiin. Lisää sille testi `validate-url.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { isValidIcalUrl } from "./validate-url";

describe("isValidIcalUrl", () => {
  it("hyväksyy https", () => {
    expect(isValidIcalUrl("https://www.airbnb.com/calendar/ical/123.ics?s=abc")).toBe(true);
  });
  it("hylkää http, tyhjän ja roskan", () => {
    expect(isValidIcalUrl("http://www.airbnb.com/calendar/ical/123.ics")).toBe(false);
    expect(isValidIcalUrl("")).toBe(false);
    expect(isValidIcalUrl("ei osoite")).toBe(false);
  });
});
```

- [ ] **Step 2: `src/app/api/admin/ical-sources/test/route.ts`**

```ts
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api-auth";
import { fetchIcsText } from "@/lib/availability/availability";
import { parseIcsToRanges } from "@/lib/availability/ical";
import { isValidIcalUrl } from "@/lib/availability/validate-url";

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = (await request.json().catch(() => ({}))) as { url?: string };
  const url = body.url?.trim() ?? "";
  if (!isValidIcalUrl(url)) {
    return NextResponse.json({ ok: false, error: "Osoitteen pitää alkaa https://" });
  }

  try {
    const ics = await fetchIcsText(url, { noStore: true });
    const ranges = parseIcsToRanges(ics);
    const today = new Date().toISOString().slice(0, 10);
    const next = ranges.find((r) => r.end > today) ?? null;
    return NextResponse.json({ ok: true, count: ranges.length, next });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: `Linkkiä ei voitu lukea: ${error instanceof Error ? error.message : "tuntematon virhe"}`,
    });
  }
}
```

- [ ] **Step 3: `src/app/api/admin/ical-bookings/route.ts`**

```ts
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api-auth";
import { getAvailability } from "@/lib/availability/availability";
import { listCalendarKeys } from "@/lib/availability/keys";
import { getVillas } from "@/lib/content/villas";
import type { Availability } from "@/types/availability";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const keys = listCalendarKeys(await getVillas());
  const entries = await Promise.all(keys.map((k) => getAvailability(k.key)));
  const out: Record<string, Availability> = {};
  for (const entry of entries) out[entry.key] = entry;
  return NextResponse.json(out);
}
```

- [ ] **Step 4: Tyypit + testit + savutesti**

Run: `npx tsc --noEmit`, `npm test` → puhdas/vihreä.
Käynnistä dev (`preview_start` → `tahkonvillat-dev`), kirjaudu `/admin/login` (salasana `.env.local`:sta — Miki tietää; kehityksessä katso `ADMIN_PASSWORD`-arvo `.env.local`-tiedostosta *lukematta sitä chattiin*: `grep -c ADMIN_PASSWORD .env.local` kertoo vain onko se asetettu). Selaimen konsolissa:

```js
await (await fetch("/api/admin/ical-sources")).json()
```
Expected: `{ keys: [6 alkiota], sources: {} }`.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/admin/ical-sources src/app/api/admin/ical-bookings src/lib/availability/validate-url.ts src/lib/availability/validate-url.test.ts
git commit -m "feat(calendar): admin-API iCal-lähteille (GET/PUT, testaus, varaukset)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 7: Admin-näkymä "Airbnb-kalenterit" + harmaat palkit Ganttiin

**Files:**
- Create: `src/components/admin/AdminIcalSources.tsx`
- Modify: `src/components/admin/AdminDashboard.tsx` (AdminView-tyyppi rivi 17, nav rivit 246-252, otsikko rivit 380-391, sisältö rivit 419-433, Gantt rivit 480-528)

**Interfaces:**
- Consumes: Task 6 API:t

- [ ] **Step 1: Luo `src/components/admin/AdminIcalSources.tsx`**

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { BookedRange, CalendarKey, IcalSourceStore } from "@/types/availability";
import { adminCardClass, adminInputClass, adminLabelClass } from "./admin-ui";

type TestResult =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "ok"; count: number; next: BookedRange | null }
  | { state: "error"; error: string };

function formatFi(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d}.${m}.${y}`;
}

export function AdminIcalSources() {
  const router = useRouter();
  const [keys, setKeys] = useState<CalendarKey[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<Record<string, string>>({});
  const [tests, setTests] = useState<Record<string, TestResult>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/ical-sources");
      if (!response.ok) throw new Error("Unauthorized");
      const data = (await response.json()) as { keys: CalendarKey[]; sources: IcalSourceStore };
      const next: Record<string, string> = {};
      for (const k of data.keys) next[k.key] = data.sources[k.key]?.url ?? "";
      setKeys(data.keys);
      setValues(next);
      setSaved(next);
    } catch {
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  const dirty = JSON.stringify(values) !== JSON.stringify(saved);

  async function runTest(key: string) {
    const url = values[key]?.trim();
    if (!url) return;
    setTests((prev) => ({ ...prev, [key]: { state: "loading" } }));
    const response = await fetch("/api/admin/ical-sources/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = (await response.json()) as
      | { ok: true; count: number; next: BookedRange | null }
      | { ok: false; error: string };
    setTests((prev) => ({
      ...prev,
      [key]: data.ok ? { state: "ok", count: data.count, next: data.next } : { state: "error", error: data.error },
    }));
  }

  async function handleSave() {
    setSaving(true);
    setStatus("");
    try {
      const response = await fetch("/api/admin/ical-sources", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sources: values }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Tallennus epäonnistui");
      setSaved(values);
      setStatus("Tallennettu. Sivuston kalenterit päivittyvät noin 3 tunnin välein.");
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Tallennus epäonnistui");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Ladataan…</p>;

  return (
    <div className="max-w-3xl space-y-6">
      <div className={adminCardClass}>
        <h2 className="text-base font-semibold text-slate-900">Näin kopioit linkin Airbnbstä</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-600">
          <li>Airbnb → Kalenteri → valitse kohde → <strong>Saatavuus</strong></li>
          <li>Kohta <strong>Yhdistä kalenterit</strong> → <strong>Yhdistä toiseen sivustoon</strong></li>
          <li>Kopioi Airbnbn kalenterilinkki (päättyy <code>.ics?s=…</code>) ja liitä alle</li>
        </ol>
        <p className="mt-2 text-xs text-slate-500">
          Sivusto hakee varaukset linkistä noin 3 tunnin välein. Linkki on salainen — älä jaa sitä.
        </p>
      </div>

      <ul className="space-y-4">
        {keys.map((k) => {
          const test = tests[k.key] ?? { state: "idle" };
          return (
            <li key={k.key} className={adminCardClass}>
              <label className={adminLabelClass} htmlFor={`ical-${k.key}`}>
                {k.label.fi}
              </label>
              <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
                <input
                  id={`ical-${k.key}`}
                  type="url"
                  inputMode="url"
                  placeholder="https://www.airbnb.com/calendar/ical/…ics?s=…"
                  value={values[k.key] ?? ""}
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, [k.key]: event.target.value }))
                  }
                  className={`${adminInputClass} mt-0 flex-1 font-mono text-xs`}
                />
                <button
                  type="button"
                  onClick={() => runTest(k.key)}
                  disabled={!values[k.key]?.trim() || test.state === "loading"}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  {test.state === "loading" ? "Testataan…" : "Testaa"}
                </button>
              </div>
              {test.state === "ok" && (
                <p className="mt-2 text-sm text-emerald-700">
                  Linkki toimii — {test.count} varausta.
                  {test.next ? ` Seuraava: ${formatFi(test.next.start)}–${formatFi(test.next.end)}.` : ""}
                </p>
              )}
              {test.state === "error" && (
                <p className="mt-2 text-sm text-red-700">{test.error}</p>
              )}
              {!values[k.key]?.trim() && (
                <p className="mt-2 text-xs text-slate-400">Ei linkkiä — sivustolla ei näytetä Airbnb-varauksia tälle kohteelle.</p>
              )}
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm">
          {dirty ? (
            <span className="font-medium text-amber-700">Tallentamattomia muutoksia</span>
          ) : (
            <span className="text-slate-500">Kaikki tallennettu</span>
          )}
          {status && <span className="ml-3 text-slate-600">{status}</span>}
        </p>
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || saving}
          className="rounded-lg bg-forest px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Tallennetaan…" : "Tallenna linkit"}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Lisää näkymä `AdminDashboard.tsx`:ään**

1. `AdminView`-unioniin `| "ical"`.
2. Import: `import { AdminIcalSources } from "./AdminIcalSources";` ja `import type { Availability } from "@/types/availability";`
3. Toiminnot-listaan (rivit 246–252) `["ical", "Airbnb-kalenterit"]` heti `["calendar", "Kalenteri"]` jälkeen.
4. Otsikkoketjuun (rivit 380–391): `view === "ical" ? "Airbnb-kalenterit" : …`
5. Sisältöhaaraan ennen `view !== "calendar"`-haaraa: `view === "ical" ? <AdminIcalSources /> :`
6. Harmaat palkit: lisää tila `const [icalBookings, setIcalBookings] = useState<Record<string, Availability>>({});` ja lataa `loadReservations`-funktiossa rinnalla:

```ts
const icalRes = await fetch("/api/admin/ical-bookings");
if (icalRes.ok) setIcalBookings((await icalRes.json()) as Record<string, Availability>);
```

7. Gantt-rivin sisällä (`propertyReservations.map` jälkeen) renderöi Airbnb-välit:

```tsx
{Object.values(icalBookings)
  .filter((a) => a.key === property.id || a.key.startsWith(`${property.id}:`))
  .flatMap((a) =>
    a.booked
      .filter((r) => r.source === "airbnb")
      .map((r) => ({ ...r, key: a.key })),
  )
  .map((r) => {
    const span = getBarSpan({ id: r.key, propertySlug: property.id, guestName: "", startDate: r.start, endDate: r.end }, days);
    if (!span) return null;
    const unit = r.key.includes(":") ? r.key.split(":")[1].toUpperCase() : "";
    return (
      <div
        key={`${r.key}-${r.start}`}
        className="absolute bottom-1 z-[1] flex h-4 items-center overflow-hidden rounded bg-slate-300 px-1.5 text-[10px] font-medium text-slate-700"
        style={{ left: span.start * DAY_WIDTH + 2, width: span.span * DAY_WIDTH - 4 }}
        title={`Airbnb${unit ? ` · ${unit}` : ""} · ${r.start} → ${r.end}`}
      >
        <span className="truncate">Airbnb{unit ? ` ${unit}` : ""}</span>
      </div>
    );
  })}
```

Käsivarauspalkki (`top-2 h-8`) ja Airbnb-palkki (`bottom-1 h-4`) mahtuvat samaan 52 px riviin. Teitulin 4 yksikköä piirtyvät samalle riville päällekkäin — hyväksytty yksinkertaistus (spec §4.6 mainitsi omat rivit; kirjaa WORKDESK-päätöksiin).

- [ ] **Step 3: Savutesti selaimessa**

Dev käynnissä → `/admin` → "Airbnb-kalenterit": 6 riviä (Puolukka, Karpalo, Teituli A/B/8A/8B). Liitä testiosoite `https://www.airbnb.com/calendar/ical/0.ics?s=x` → Testaa → odotettu virheviesti (ei kaadu). Tallenna tyhjänä → "Kaikki tallennettu". Konsoli: 0 virhettä.

- [ ] **Step 4: Tyypit + commit**

```bash
npx tsc --noEmit
git add src/components/admin/AdminIcalSources.tsx src/components/admin/AdminDashboard.tsx
git commit -m "feat(admin): Airbnb-kalenterit-näkymä (iCal-linkit, testaus) + Airbnb-palkit Ganttiin

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 8: Julkinen saatavuuskalenteri villasivulle

**Files:**
- Create: `src/lib/availability/calendar-grid.ts` (+ `.test.ts`)
- Create: `src/components/villas/AvailabilityCalendar.tsx`
- Create: `src/components/villas/PropertyAvailability.tsx`
- Modify: `messages/fi.json`, `messages/en.json` (`villas.detail.calendar`)
- Modify: `src/app/[locale]/villas/[slug]/page.tsx` (rivit 103–120, lisää `revalidate`)

**Interfaces:**
- Produces: `buildMonthCells(year, month0): { iso: string; day: number; inMonth: boolean }[]` (42 solua, ma-alkuinen), `isBooked(iso, ranges): boolean`, `monthKey(year, month0)`, `shiftMonth(year, month0, delta)`

- [ ] **Step 1: Testi `src/lib/availability/calendar-grid.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { buildMonthCells, isBooked, shiftMonth } from "./calendar-grid";

describe("buildMonthCells", () => {
  it("syyskuu 2026 alkaa tiistaina → 1 täytesolu, 42 solua yhteensä", () => {
    const cells = buildMonthCells(2026, 8);
    expect(cells).toHaveLength(42);
    expect(cells[0].inMonth).toBe(false);
    expect(cells[1]).toEqual({ iso: "2026-09-01", day: 1, inMonth: true });
    expect(cells.filter((c) => c.inMonth)).toHaveLength(30);
  });

  it("maanantaina alkava kuukausi ei saa täytesoluja alkuun (kesäkuu 2026)", () => {
    expect(buildMonthCells(2026, 5)[0]).toEqual({ iso: "2026-06-01", day: 1, inMonth: true });
  });
});

describe("isBooked", () => {
  const ranges = [{ start: "2026-09-12", end: "2026-09-15", source: "airbnb" as const }];
  it("start mukana, end ei", () => {
    expect(isBooked("2026-09-12", ranges)).toBe(true);
    expect(isBooked("2026-09-14", ranges)).toBe(true);
    expect(isBooked("2026-09-15", ranges)).toBe(false);
    expect(isBooked("2026-09-11", ranges)).toBe(false);
  });
});

describe("shiftMonth", () => {
  it("kiertää vuoden yli", () => {
    expect(shiftMonth(2026, 11, 1)).toEqual({ year: 2027, month: 0 });
    expect(shiftMonth(2026, 0, -1)).toEqual({ year: 2025, month: 11 });
  });
});
```

- [ ] **Step 2: Aja — FAIL**

- [ ] **Step 3: Toteuta `src/lib/availability/calendar-grid.ts`**

```ts
import type { BookedRange } from "@/types/availability";

export type DayCell = { iso: string; day: number; inMonth: boolean };

function iso(year: number, month0: number, day: number): string {
  return new Date(Date.UTC(year, month0, day)).toISOString().slice(0, 10);
}

/** 6 riviä × 7 päivää, viikko alkaa maanantaista. month0 = 0–11. */
export function buildMonthCells(year: number, month0: number): DayCell[] {
  const first = new Date(Date.UTC(year, month0, 1));
  const lead = (first.getUTCDay() + 6) % 7; // ma=0 … su=6
  const cells: DayCell[] = [];
  for (let i = 0; i < 42; i += 1) {
    const offset = i - lead;
    const date = new Date(Date.UTC(year, month0, 1 + offset));
    cells.push({
      iso: date.toISOString().slice(0, 10),
      day: date.getUTCDate(),
      inMonth: date.getUTCMonth() === month0,
    });
  }
  return cells;
}

export function isBooked(day: string, ranges: BookedRange[]): boolean {
  return ranges.some((r) => day >= r.start && day < r.end);
}

export function shiftMonth(year: number, month0: number, delta: number): { year: number; month: number } {
  const date = new Date(Date.UTC(year, month0 + delta, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() };
}

export function monthKey(year: number, month0: number): string {
  return iso(year, month0, 1).slice(0, 7);
}
```

- [ ] **Step 4: Aja testit** → vihreä

- [ ] **Step 5: Päivitä viestit** — `messages/fi.json` → `villas.detail.calendar` korvataan kokonaan:

```json
"calendar": {
  "title": "Saatavuus",
  "syncHint": "Varatut päivät päivittyvät Airbnbstä noin 3 tunnin välein. Varmista saatavuus aina tiedustelulla.",
  "unavailable": "Saatavuustietoa ei juuri nyt saada haettua. Kysy vapaita päiviä tiedustelulla.",
  "unitLabel": "Yksikkö",
  "prevMonth": "Edellinen kuukausi",
  "nextMonth": "Seuraava kuukausi",
  "legendFree": "Vapaa",
  "legendBooked": "Varattu",
  "bookedDay": "Varattu päivä {date}",
  "freeDay": "Vapaa päivä {date}",
  "weekdays": { "mon": "Ma", "tue": "Ti", "wed": "Ke", "thu": "To", "fri": "Pe", "sat": "La", "sun": "Su" }
}
```

`messages/en.json`:

```json
"calendar": {
  "title": "Availability",
  "syncHint": "Booked dates sync from Airbnb roughly every 3 hours. Always confirm availability with an inquiry.",
  "unavailable": "Availability could not be loaded right now. Please ask about free dates with an inquiry.",
  "unitLabel": "Unit",
  "prevMonth": "Previous month",
  "nextMonth": "Next month",
  "legendFree": "Available",
  "legendBooked": "Booked",
  "bookedDay": "Booked day {date}",
  "freeDay": "Available day {date}",
  "weekdays": { "mon": "Mo", "tue": "Tu", "wed": "We", "thu": "Th", "fri": "Fr", "sat": "Sa", "sun": "Su" }
}
```

(Vanha `hint`-avain poistuu; Task 1:n merge pudottaa sen tallennetusta ylikirjoituksesta.)

- [ ] **Step 6: Luo `src/components/villas/AvailabilityCalendar.tsx`**

```tsx
"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { buildMonthCells, isBooked, shiftMonth } from "@/lib/availability/calendar-grid";
import type { Availability } from "@/types/availability";

export type CalendarView = Availability & { label: string };

type Props = {
  calendars: CalendarView[];
  locale: string;
  today: string; // YYYY-MM-DD, palvelimelta (deterministinen SSR)
};

const WEEKDAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const MAX_MONTHS_AHEAD = 12;

export function AvailabilityCalendar({ calendars, locale, today }: Props) {
  const t = useTranslations("villas.detail.calendar");
  const [active, setActive] = useState(0);
  const startYear = Number(today.slice(0, 4));
  const startMonth = Number(today.slice(5, 7)) - 1;
  const [{ year, month }, setCursor] = useState({ year: startYear, month: startMonth });

  const calendar = calendars[Math.min(active, calendars.length - 1)];
  const cells = useMemo(() => buildMonthCells(year, month), [year, month]);
  const monthsAhead = (year - startYear) * 12 + (month - startMonth);
  const monthLabel = new Intl.DateTimeFormat(locale === "fi" ? "fi-FI" : "en-GB", {
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month, 1)));
  const dayFormat = new Intl.DateTimeFormat(locale === "fi" ? "fi-FI" : "en-GB", {
    day: "numeric",
    month: "long",
  });

  return (
    <div>
      {calendars.length > 1 && (
        <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label={t("unitLabel")}>
          {calendars.map((c, index) => (
            <button
              key={c.key}
              type="button"
              role="tab"
              aria-selected={index === active}
              onClick={() => setActive(index)}
              className={index === active ? "filter-pill-active" : "filter-pill-inactive"}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      {calendar.status === "unavailable" && (
        <p className="mb-4 rounded-lg border border-[color:var(--hairline)] bg-paper-100 px-4 py-3 font-sans text-sm text-forest-700">
          {t("unavailable")}
        </p>
      )}

      <div className="rounded-2xl border border-[color:var(--hairline)] bg-paper p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCursor(shiftMonth(year, month, -1))}
            disabled={monthsAhead <= 0}
            aria-label={t("prevMonth")}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-[color:var(--hairline)] text-xl text-ink transition-colors hover:bg-paper-100 disabled:opacity-30"
          >
            ‹
          </button>
          <p className="font-display text-2xl font-semibold capitalize text-ink" aria-live="polite">
            {monthLabel}
          </p>
          <button
            type="button"
            onClick={() => setCursor(shiftMonth(year, month, 1))}
            disabled={monthsAhead >= MAX_MONTHS_AHEAD}
            aria-label={t("nextMonth")}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-[color:var(--hairline)] text-xl text-ink transition-colors hover:bg-paper-100 disabled:opacity-30"
          >
            ›
          </button>
        </div>

        <div className="mt-5 grid grid-cols-7 gap-1 text-center">
          {WEEKDAY_KEYS.map((key) => (
            <div key={key} className="mono-label py-1 text-[0.7rem]">
              {t(`weekdays.${key}`)}
            </div>
          ))}
          {cells.map((cell) => {
            const booked = cell.inMonth && isBooked(cell.iso, calendar.booked);
            const past = cell.iso < today;
            const label = dayFormat.format(new Date(`${cell.iso}T00:00:00Z`));
            return (
              <div
                key={cell.iso}
                role="img"
                aria-label={cell.inMonth ? (booked ? t("bookedDay", { date: label }) : t("freeDay", { date: label })) : undefined}
                aria-hidden={!cell.inMonth}
                className={[
                  "flex aspect-square min-h-10 items-center justify-center rounded-md font-sans text-sm",
                  !cell.inMonth ? "invisible" : "",
                  booked ? "bg-paper-300 text-forest-500 line-through decoration-forest-400" : "bg-paper-50 text-ink",
                  past && cell.inMonth ? "opacity-40" : "",
                ].join(" ")}
              >
                {cell.day}
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-5 font-sans text-sm text-forest-600">
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 rounded-sm border border-[color:var(--hairline)] bg-paper-50" aria-hidden />
            {t("legendFree")}
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 rounded-sm bg-paper-300" aria-hidden />
            {t("legendBooked")}
          </span>
        </div>
      </div>

      <p className="mt-3 font-sans text-sm text-forest-600">{t("syncHint")}</p>
    </div>
  );
}
```

- [ ] **Step 7: Luo `src/components/villas/PropertyAvailability.tsx`**

```tsx
import { getTranslations } from "next-intl/server";
import { getAvailability } from "@/lib/availability/availability";
import { listCalendarKeys } from "@/lib/availability/keys";
import type { Villa } from "@/types/villa";
import { AvailabilityCalendar, type CalendarView } from "./AvailabilityCalendar";

type Props = { villa: Villa; locale: "fi" | "en" };

export async function PropertyAvailability({ villa, locale }: Props) {
  const keys = listCalendarKeys([villa]);
  const availabilities = await Promise.all(keys.map((k) => getAvailability(k.key)));
  const calendars: CalendarView[] = availabilities.map((a, i) => ({ ...a, label: keys[i].label[locale] }));

  const nothingToShow = calendars.every((c) => c.status === "unconfigured" && c.booked.length === 0);
  if (nothingToShow) return null;

  const t = await getTranslations({ locale, namespace: "villas.detail.calendar" });
  const today = new Date().toISOString().slice(0, 10);

  return (
    <section className="mt-12" data-cms="villas.detail.calendar" aria-labelledby="availability-title">
      <h2 id="availability-title" className="font-display text-4xl font-semibold text-forest sm:text-5xl">
        {t("title")}
      </h2>
      <div className="mt-6">
        <AvailabilityCalendar calendars={calendars} locale={locale} today={today} />
      </div>
    </section>
  );
}
```

- [ ] **Step 8: Kytke villasivulle** — `src/app/[locale]/villas/[slug]/page.tsx`:

1. Import `import { PropertyAvailability } from "@/components/villas/PropertyAvailability";`
2. Lisää tiedoston alkuun (importtien jälkeen): `export const revalidate = 10800;`
3. `longDescription`-Revealin (rivit 103–114) jälkeen, ennen `villa.units`-lohkoa:

```tsx
<Reveal delay={100}>
  <PropertyAvailability villa={villa} locale={lang} />
</Reveal>
```

- [ ] **Step 9: Verifioi**

`npx tsc --noEmit`, `npm test`. Dev: lisää adminissa Puolukalle testilinkki, joka ei toimi → villasivu `/villat/villa-puolukka` näyttää "Saatavuus"-osion ilmoituksella "ei juuri nyt saada haettua" + käsivaraus 29.–30.6.2026 varattuna (kesäkuu on menneisyydessä → ei näy oletusnäkymässä, tarkista `‹`-nappi disabloitu). Tyhjennä linkki → osio katoaa (vain vanha käsivaraus jää → `booked.length > 0` → osio näkyy; ok). Mobiili 375 px: 7 saraketta, ei vaakavieritystä. Ruutukaappaus talteen.

Aidon Airbnb-linkin testaus: jos Mikillä/asiakkaalla on linkki saatavilla, liitä → "Linkki toimii — N varausta" ja kalenterissa varatut päivät. Kirjaa WORKDESKiin oliko aito linkki testattu.

- [ ] **Step 10: Commit**

```bash
git add src/lib/availability/calendar-grid.ts src/lib/availability/calendar-grid.test.ts src/components/villas/AvailabilityCalendar.tsx src/components/villas/PropertyAvailability.tsx messages/fi.json messages/en.json "src/app/[locale]/villas/[slug]/page.tsx"
git commit -m "feat(calendar): julkinen saatavuuskalenteri villasivulle (Airbnb iCal + käsivaraukset)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

## Part C — Kausihinnat

### Task 9: Kausihintalogiikka

**Files:**
- Modify: `src/types/pricing.ts`
- Create: `src/lib/pricing/seasons.ts`, `src/lib/pricing/seasons.test.ts`
- Modify: `src/lib/data/pricing.ts`

**Interfaces:**
- Produces:
  - `type PriceSeason = { id: string; start: string; end: string; pricePerNight: number; label?: { fi: string; en: string } }` (start/end inklusiivisia päiviä)
  - `type PropertyPricing = { fromPerNight?: number; currency: "EUR"; seasons?: PriceSeason[]; updatedAt?: string }`
  - `todayIso(now?: Date): string`
  - `getUpcomingSeasons(p: PropertyPricing, today: string): PriceSeason[]`
  - `getDisplayFromPrice(p: PropertyPricing | null, today: string): number | null`
  - `validateSeasons(seasons: unknown): string | null` (suomenkielinen virhe tai null)
  - `formatSeasonRange(start: string, end: string, locale: string): string`
  - `hasAnyPrice(p: PropertyPricing): boolean`

- [ ] **Step 1: Päivitä `src/types/pricing.ts`**

```ts
/** Kausi: start ja end ovat INKLUSIIVISIA päivämääriä (YYYY-MM-DD). */
export type PriceSeason = {
  id: string;
  start: string;
  end: string;
  pricePerNight: number;
  label?: { fi: string; en: string };
};

export type PropertyPricing = {
  /** Perushinta "muut ajat". Valinnainen, jos kohteella on vain kausia. */
  fromPerNight?: number;
  currency: "EUR";
  seasons?: PriceSeason[];
  updatedAt?: string;
};

export type PricingStore = Record<string, PropertyPricing>;
```

- [ ] **Step 2: Testi `src/lib/pricing/seasons.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import {
  formatSeasonRange,
  getDisplayFromPrice,
  getUpcomingSeasons,
  hasAnyPrice,
  validateSeasons,
} from "./seasons";

const pricing = {
  fromPerNight: 200,
  currency: "EUR" as const,
  seasons: [
    { id: "a", start: "2026-09-12", end: "2026-09-30", pricePerNight: 250 },
    { id: "b", start: "2026-12-20", end: "2027-01-06", pricePerNight: 390, label: { fi: "Joulu", en: "Christmas" } },
    { id: "c", start: "2026-01-01", end: "2026-03-31", pricePerNight: 150 },
  ],
};

describe("getUpcomingSeasons", () => {
  it("pudottaa menneet ja järjestää alun mukaan", () => {
    expect(getUpcomingSeasons(pricing, "2026-09-09").map((s) => s.id)).toEqual(["a", "b"]);
  });
  it("kausi jonka end on tänään on vielä mukana", () => {
    expect(getUpcomingSeasons(pricing, "2026-09-30").map((s) => s.id)).toEqual(["a", "b"]);
  });
});

describe("getDisplayFromPrice", () => {
  it("pienin perushinnasta ja tulevista kausista", () => {
    expect(getDisplayFromPrice(pricing, "2026-09-09")).toBe(200);
    expect(getDisplayFromPrice({ currency: "EUR", seasons: pricing.seasons }, "2026-09-09")).toBe(250);
  });
  it("ei hintoja → null", () => {
    expect(getDisplayFromPrice({ currency: "EUR" }, "2026-09-09")).toBeNull();
    expect(getDisplayFromPrice(null, "2026-09-09")).toBeNull();
    expect(getDisplayFromPrice({ currency: "EUR", fromPerNight: 0 }, "2026-09-09")).toBeNull();
  });
});

describe("validateSeasons", () => {
  it("ok-lista palauttaa null", () => {
    expect(validateSeasons(pricing.seasons)).toBeNull();
    expect(validateSeasons([])).toBeNull();
    expect(validateSeasons(undefined)).toBeNull();
  });
  it("loppu ennen alkua", () => {
    expect(validateSeasons([{ id: "x", start: "2026-09-30", end: "2026-09-12", pricePerNight: 1 }])).toMatch(/loppu/i);
  });
  it("hinta nolla tai negatiivinen", () => {
    expect(validateSeasons([{ id: "x", start: "2026-09-01", end: "2026-09-02", pricePerNight: 0 }])).toMatch(/hinta/i);
  });
  it("päällekkäiset kaudet", () => {
    expect(
      validateSeasons([
        { id: "x", start: "2026-09-01", end: "2026-09-10", pricePerNight: 1 },
        { id: "y", start: "2026-09-10", end: "2026-09-20", pricePerNight: 2 },
      ]),
    ).toMatch(/päällekkäi/i);
  });
  it("virheellinen päivämäärämuoto", () => {
    expect(validateSeasons([{ id: "x", start: "12.9.2026", end: "2026-09-30", pricePerNight: 1 }])).toMatch(/päivämäär/i);
  });
});

describe("formatSeasonRange", () => {
  it("sisältää päivät ja vuoden", () => {
    const fi = formatSeasonRange("2026-09-12", "2026-09-30", "fi");
    expect(fi).toContain("12");
    expect(fi).toContain("30");
    expect(fi).toContain("2026");
    const en = formatSeasonRange("2026-12-20", "2027-01-06", "en");
    expect(en).toContain("2026");
    expect(en).toContain("2027");
  });
});

describe("hasAnyPrice", () => {
  it("true jos perushinta tai kausia", () => {
    expect(hasAnyPrice({ currency: "EUR" })).toBe(false);
    expect(hasAnyPrice({ currency: "EUR", fromPerNight: 10 })).toBe(true);
    expect(hasAnyPrice({ currency: "EUR", seasons: pricing.seasons })).toBe(true);
  });
});
```

- [ ] **Step 3: Aja — FAIL**

- [ ] **Step 4: Toteuta `src/lib/pricing/seasons.ts`**

```ts
import type { PriceSeason, PropertyPricing } from "@/types/pricing";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function todayIso(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function getUpcomingSeasons(pricing: PropertyPricing, today: string): PriceSeason[] {
  return (pricing.seasons ?? [])
    .filter((s) => s.end >= today)
    .sort((a, b) => a.start.localeCompare(b.start));
}

export function hasAnyPrice(pricing: PropertyPricing): boolean {
  const base = pricing.fromPerNight ?? 0;
  return base > 0 || (pricing.seasons?.length ?? 0) > 0;
}

export function getDisplayFromPrice(pricing: PropertyPricing | null, today: string): number | null {
  if (!pricing) return null;
  const candidates: number[] = [];
  if ((pricing.fromPerNight ?? 0) > 0) candidates.push(pricing.fromPerNight as number);
  for (const season of getUpcomingSeasons(pricing, today)) {
    if (season.pricePerNight > 0) candidates.push(season.pricePerNight);
  }
  return candidates.length ? Math.min(...candidates) : null;
}

export function validateSeasons(seasons: unknown): string | null {
  if (seasons == null) return null;
  if (!Array.isArray(seasons)) return "Kaudet: odotettiin listaa";

  const items = seasons as Partial<PriceSeason>[];
  for (const [index, s] of items.entries()) {
    const n = index + 1;
    if (typeof s.start !== "string" || !ISO_DATE.test(s.start) || typeof s.end !== "string" || !ISO_DATE.test(s.end)) {
      return `Kausi ${n}: päivämäärän pitää olla muotoa VVVV-KK-PP`;
    }
    if (s.end < s.start) return `Kausi ${n}: loppupäivä ei voi olla ennen alkupäivää`;
    if (typeof s.pricePerNight !== "number" || !Number.isFinite(s.pricePerNight) || s.pricePerNight <= 0) {
      return `Kausi ${n}: hinta pitää olla suurempi kuin 0`;
    }
  }

  const sorted = [...(items as PriceSeason[])].sort((a, b) => a.start.localeCompare(b.start));
  for (let i = 1; i < sorted.length; i += 1) {
    if (sorted[i].start <= sorted[i - 1].end) {
      return `Kaudet ovat päällekkäin: ${sorted[i - 1].start}–${sorted[i - 1].end} ja ${sorted[i].start}–${sorted[i].end}`;
    }
  }
  return null;
}

export function formatSeasonRange(start: string, end: string, locale: string): string {
  const formatter = new Intl.DateTimeFormat(locale === "fi" ? "fi-FI" : "en-GB", {
    day: "numeric",
    month: locale === "fi" ? "numeric" : "short",
    year: "numeric",
  });
  return formatter.formatRange(new Date(`${start}T00:00:00Z`), new Date(`${end}T00:00:00Z`));
}
```

- [ ] **Step 5: Päivitä `src/lib/data/pricing.ts`**

```ts
import type { PropertyPricing } from "@/types/pricing";
import { hasAnyPrice } from "@/lib/pricing/seasons";
import { readPricing } from "./pricing-store";

export async function getPropertyPricing(propertyId: string): Promise<PropertyPricing | null> {
  const store = await readPricing();
  const entry = store[propertyId];
  if (!entry || !hasAnyPrice(entry)) return null;
  return entry;
}
```

- [ ] **Step 6: Aja testit + tyypit.** `tsc` paljastaa `PropertyPrice.tsx`:n käyttävän `pricing.fromPerNight` numerona — korjataan Task 10:ssä; jos `tsc` kaatuu siihen nyt, tee Task 10 Step 1 ennen committia.

- [ ] **Step 7: Commit**

```bash
git add src/types/pricing.ts src/lib/pricing/seasons.ts src/lib/pricing/seasons.test.ts src/lib/data/pricing.ts
git commit -m "feat(pricing): kausihintatyypit ja -logiikka (alkaen-hinta, validointi, muotoilu)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 10: Kausihinnat julkisella sivulla + API-validointi

**Files:**
- Modify: `src/components/pricing/PropertyPrice.tsx`
- Create: `src/components/pricing/SeasonPriceTable.tsx`
- Modify: `src/app/api/admin/pricing/route.ts`
- Modify: `messages/fi.json`, `messages/en.json` (`pricing`)
- Modify: `src/app/[locale]/villas/page.tsx` (lisää `export const revalidate = 10800;`)

- [ ] **Step 1: `PropertyPrice.tsx`** — korvaa kokonaan:

```tsx
import { getTranslations } from "next-intl/server";
import { getPropertyPricing } from "@/lib/data/pricing";
import { getDisplayFromPrice, todayIso } from "@/lib/pricing/seasons";
import { SeasonPriceTable } from "./SeasonPriceTable";

type Props = {
  propertyId: string;
  locale: string;
  variant?: "inline" | "card" | "detail";
};

export async function PropertyPrice({ propertyId, locale, variant = "inline" }: Props) {
  const pricing = await getPropertyPricing(propertyId);
  const today = todayIso();
  const fromPrice = getDisplayFromPrice(pricing, today);
  if (!pricing || fromPrice == null) return null;

  const t = await getTranslations({ locale, namespace: "pricing" });
  const formatted = new Intl.NumberFormat(locale === "fi" ? "fi-FI" : "en-GB", {
    maximumFractionDigits: 0,
  }).format(fromPrice);

  if (variant === "detail") {
    return (
      <div className="mt-4 rounded-xl bg-[#FAF7F3] px-5 py-4" data-cms="pricing">
        <p className="font-display text-3xl font-semibold text-forest sm:text-3xl">
          {t("fromPerNight", { price: formatted })}
        </p>
        <p className="mt-1.5 font-sans text-base text-forest-500">{t("disclaimer")}</p>
        <SeasonPriceTable pricing={pricing} locale={locale} today={today} />
      </div>
    );
  }

  if (variant === "card") {
    return (
      <p className="mt-3 font-sans text-base font-semibold text-forest">
        {t("fromPerNight", { price: formatted })}
      </p>
    );
  }

  return (
    <span className="font-sans text-base font-semibold text-forest">
      {t("fromPerNight", { price: formatted })}
    </span>
  );
}
```

- [ ] **Step 2: `SeasonPriceTable.tsx`**

```tsx
import { getTranslations } from "next-intl/server";
import { formatSeasonRange, getUpcomingSeasons } from "@/lib/pricing/seasons";
import type { PropertyPricing } from "@/types/pricing";

type Props = { pricing: PropertyPricing; locale: string; today: string };

export async function SeasonPriceTable({ pricing, locale, today }: Props) {
  const seasons = getUpcomingSeasons(pricing, today);
  if (seasons.length === 0) return null;

  const t = await getTranslations({ locale, namespace: "pricing" });
  const lang = locale === "en" ? "en" : "fi";
  const money = new Intl.NumberFormat(locale === "fi" ? "fi-FI" : "en-GB", { maximumFractionDigits: 0 });

  return (
    <div className="mt-4 border-t border-[color:var(--hairline)] pt-4">
      <p className="mono-label">{t("seasonsTitle")}</p>
      <table className="mt-2 w-full font-sans text-sm text-forest-700">
        <tbody>
          {seasons.map((season) => (
            <tr key={season.id} className="border-b border-[color:var(--hairline)] last:border-b-0">
              <td className="py-2 pr-3">
                {formatSeasonRange(season.start, season.end, locale)}
                {season.label?.[lang] ? <span className="ml-2 text-forest-500">{season.label[lang]}</span> : null}
              </td>
              <td className="py-2 text-right font-semibold text-ink">
                {t("perNight", { price: money.format(season.pricePerNight) })}
              </td>
            </tr>
          ))}
          {(pricing.fromPerNight ?? 0) > 0 && (
            <tr>
              <td className="py-2 pr-3">{t("otherTimes")}</td>
              <td className="py-2 text-right font-semibold text-ink">
                {t("perNight", { price: money.format(pricing.fromPerNight as number) })}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 3: Viestit** — `messages/fi.json` `pricing`:

```json
"pricing": {
  "fromPerNight": "alkaen {price} € / yö",
  "perNight": "{price} € / yö",
  "disclaimer": "Ohjehinta. Lopullinen hinta vahvistetaan aina tiedustelussa.",
  "seasonsTitle": "Hinnat kausittain",
  "otherTimes": "Muut ajat"
}
```

`messages/en.json`:

```json
"pricing": {
  "fromPerNight": "from {price} € / night",
  "perNight": "{price} € / night",
  "disclaimer": "Guide price. Final rate is always confirmed on inquiry.",
  "seasonsTitle": "Seasonal prices",
  "otherTimes": "Other dates"
}
```

- [ ] **Step 4: API-validointi `src/app/api/admin/pricing/route.ts`** — korvaa `isValidStore` ja normalisointi:

```ts
import { validateSeasons } from "@/lib/pricing/seasons";
import type { PriceSeason, PricingStore } from "@/types/pricing";

function validateStore(body: unknown, validIds: Set<string>): string | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return "Virheellinen rakenne";
  for (const [id, value] of Object.entries(body as Record<string, unknown>)) {
    if (!validIds.has(id)) return `Tuntematon kohde: ${id}`;
    if (!value || typeof value !== "object") return `${id}: virheellinen arvo`;
    const v = value as Partial<PricingStore[string]>;
    if (v.fromPerNight != null && (typeof v.fromPerNight !== "number" || v.fromPerNight < 0)) {
      return `${id}: perushinta ei kelpaa`;
    }
    if (v.currency && v.currency !== "EUR") return `${id}: vain EUR`;
    const seasonError = validateSeasons(v.seasons);
    if (seasonError) return `${id}: ${seasonError}`;
  }
  return null;
}
```

PUT-käsittelijässä:

```ts
const error = validateStore(body, validIds);
if (error) return NextResponse.json({ error }, { status: 400 });

const normalized: PricingStore = {};
for (const [id, value] of Object.entries(body as PricingStore)) {
  const base = value.fromPerNight && value.fromPerNight > 0 ? Math.round(value.fromPerNight) : undefined;
  const seasons: PriceSeason[] = (value.seasons ?? []).map((s, i) => ({
    id: s.id || `s-${Date.now()}-${i}`,
    start: s.start,
    end: s.end,
    pricePerNight: Math.round(s.pricePerNight),
    ...(s.label && (s.label.fi || s.label.en) ? { label: { fi: s.label.fi ?? "", en: s.label.en ?? "" } } : {}),
  }));
  if (!base && seasons.length === 0) continue;
  normalized[id] = {
    ...(base ? { fromPerNight: base } : {}),
    currency: "EUR",
    ...(seasons.length ? { seasons } : {}),
    updatedAt: new Date().toISOString(),
  };
}
```

Lisää `revalidatePricing()`-kutsun perään villasivujen uudelleenvalidointi: `for (const p of properties) if (p.group === "villa") revalidatePropertyPaths(p.id, "villa");` (import `revalidatePropertyPaths` `@/lib/admin/revalidate-property`).

- [ ] **Step 5: `villas/page.tsx`**: lisää `export const revalidate = 10800;` importtien jälkeen.

- [ ] **Step 6: Verifioi**: `npx tsc --noEmit`, `npm test`. Dev: lisää käsin `data/pricing.json`-tiedostoon Puolukalle `"seasons": [{ "id": "t1", "start": "2026-09-12", "end": "2026-09-30", "pricePerNight": 250 }]` → `/villat/villa-puolukka` näyttää "alkaen 250 € / yö" (perus 320 > kausi 250) ja taulukon "12.–30.9.2026 · 250 € / yö", "Muut ajat · 320 € / yö". Poista testidata jälkeenpäin (tai jätä Task 11:n admin-testiin, mutta poista ennen commitia — `data/pricing.json` on gitissä).

- [ ] **Step 7: Commit**

```bash
git add src/components/pricing/PropertyPrice.tsx src/components/pricing/SeasonPriceTable.tsx src/app/api/admin/pricing/route.ts messages/fi.json messages/en.json "src/app/[locale]/villas/page.tsx"
git commit -m "feat(pricing): kausihintataulukko villasivulle, alkaen-hinta kausista, API-validointi

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 11: Admin — kausirivit

**Files:**
- Modify: `src/components/admin/AdminPricing.tsx` (koko komponentti)

- [ ] **Step 1: Kirjoita `AdminPricing.tsx` uudelleen**

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminProperty } from "@/lib/admin/properties";
import { validateSeasons } from "@/lib/pricing/seasons";
import type { PriceSeason, PricingStore } from "@/types/pricing";
import { adminCardClass, adminInputClass, adminLabelClass } from "./admin-ui";

type SeasonRow = { id: string; start: string; end: string; price: string; labelFi: string; labelEn: string };
type Row = { base: string; seasons: SeasonRow[] };

type Props = { properties: AdminProperty[] };

function toRows(store: PricingStore, properties: AdminProperty[]): Record<string, Row> {
  const rows: Record<string, Row> = {};
  for (const p of properties) {
    const entry = store[p.id];
    rows[p.id] = {
      base: entry?.fromPerNight != null ? String(entry.fromPerNight) : "",
      seasons: (entry?.seasons ?? []).map((s) => ({
        id: s.id,
        start: s.start,
        end: s.end,
        price: String(s.pricePerNight),
        labelFi: s.label?.fi ?? "",
        labelEn: s.label?.en ?? "",
      })),
    };
  }
  return rows;
}

function toSeason(row: SeasonRow): PriceSeason {
  const label = row.labelFi.trim() || row.labelEn.trim()
    ? { fi: row.labelFi.trim(), en: row.labelEn.trim() }
    : undefined;
  return {
    id: row.id,
    start: row.start,
    end: row.end,
    pricePerNight: Number(row.price.replace(",", ".")),
    ...(label ? { label } : {}),
  };
}

export function AdminPricing({ properties }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState<Record<string, Row>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadPricing = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/pricing");
      if (!response.ok) throw new Error("Unauthorized");
      setRows(toRows((await response.json()) as PricingStore, properties));
    } catch {
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  }, [properties, router]);

  useEffect(() => {
    void loadPricing();
  }, [loadPricing]);

  function updateBase(id: string, value: string) {
    setRows((prev) => ({ ...prev, [id]: { ...prev[id], base: value } }));
  }

  function updateSeason(id: string, seasonId: string, patch: Partial<SeasonRow>) {
    setRows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        seasons: prev[id].seasons.map((s) => (s.id === seasonId ? { ...s, ...patch } : s)),
      },
    }));
  }

  function addSeason(id: string) {
    setRows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        seasons: [
          ...prev[id].seasons,
          { id: `s-${Date.now()}`, start: "", end: "", price: "", labelFi: "", labelEn: "" },
        ],
      },
    }));
  }

  function removeSeason(id: string, seasonId: string) {
    setRows((prev) => ({
      ...prev,
      [id]: { ...prev[id], seasons: prev[id].seasons.filter((s) => s.id !== seasonId) },
    }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      const payload: PricingStore = {};
      for (const property of properties) {
        const row = rows[property.id];
        if (!row) continue;
        const base = Number((row.base || "0").replace(",", "."));
        const seasons = row.seasons.map(toSeason);
        const error = validateSeasons(seasons);
        if (error) throw new Error(`${property.name}: ${error}`);
        if (!(base > 0) && seasons.length === 0) continue;
        payload[property.id] = {
          ...(base > 0 ? { fromPerNight: Math.round(base) } : {}),
          currency: "EUR",
          ...(seasons.length ? { seasons } : {}),
        };
      }

      const response = await fetch("/api/admin/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Tallennus epäonnistui");
      setMessage("Hinnat tallennettu.");
      await loadPricing();
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Tallennus epäonnistui");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="p-6 text-sm text-slate-500">Ladataan hintoja…</p>;

  const groups = [
    { title: "Villat", items: properties.filter((p) => p.group === "villa") },
    { title: "Asunnot", items: properties.filter((p) => p.group === "apartment") },
  ];

  return (
    <div className="p-6">
      <div className="max-w-3xl">
        <h2 className="text-lg font-semibold text-slate-900">Hinnat</h2>
        <p className="mt-2 text-sm text-slate-600">
          Perushinta näkyy &quot;alkaen&quot;-hintana. Kaudet ovat ajanjaksoja, joilla on oma hinta
          (esim. 12.9.–30.9. → 250 €). Sivulla näkyy pienin tuleva hinta ja kausitaulukko.
          Lopullinen hinta vahvistetaan aina tiedustelussa.
        </p>

        <div className="mt-8 space-y-8">
          {groups.map((group) => (
            <section key={group.title}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{group.title}</h3>
              <ul className="mt-3 space-y-4">
                {group.items.map((property) => {
                  const row = rows[property.id];
                  return (
                    <li key={property.id} className={adminCardClass}>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="font-medium text-slate-800">{property.name}</span>
                        <label className="flex items-center gap-2 text-sm text-slate-600">
                          Perushinta
                          <input
                            type="number"
                            min={0}
                            step={1}
                            value={row?.base ?? ""}
                            onChange={(event) => updateBase(property.id, event.target.value)}
                            className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-right text-slate-900"
                            placeholder="—"
                          />
                          € / yö
                        </label>
                      </div>

                      {row?.seasons.length ? (
                        <ul className="mt-4 space-y-3">
                          {row.seasons.map((season) => (
                            <li key={season.id} className="grid gap-2 rounded-lg bg-slate-50 p-3 sm:grid-cols-[1fr_1fr_6rem_1fr_auto] sm:items-end">
                              <div>
                                <label className={adminLabelClass}>Alkaa</label>
                                <input type="date" value={season.start} onChange={(e) => updateSeason(property.id, season.id, { start: e.target.value })} className={adminInputClass} />
                              </div>
                              <div>
                                <label className={adminLabelClass}>Päättyy</label>
                                <input type="date" value={season.end} onChange={(e) => updateSeason(property.id, season.id, { end: e.target.value })} className={adminInputClass} />
                              </div>
                              <div>
                                <label className={adminLabelClass}>€ / yö</label>
                                <input type="number" min={1} step={1} value={season.price} onChange={(e) => updateSeason(property.id, season.id, { price: e.target.value })} className={`${adminInputClass} text-right`} />
                              </div>
                              <div>
                                <label className={adminLabelClass}>Nimi (valinnainen) FI / EN</label>
                                <div className="flex gap-2">
                                  <input value={season.labelFi} placeholder="Ruska" onChange={(e) => updateSeason(property.id, season.id, { labelFi: e.target.value })} className={adminInputClass} />
                                  <input value={season.labelEn} placeholder="Autumn" onChange={(e) => updateSeason(property.id, season.id, { labelEn: e.target.value })} className={adminInputClass} />
                                </div>
                              </div>
                              <button type="button" onClick={() => removeSeason(property.id, season.id)} className="mb-0.5 rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-600 hover:bg-white" aria-label="Poista kausi">
                                Poista
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : null}

                      <button type="button" onClick={() => addSeason(property.id)} className="mt-3 text-sm font-medium text-forest hover:underline">
                        + Lisää kausi
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button type="button" onClick={handleSave} disabled={saving} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60">
            {saving ? "Tallennetaan…" : "Tallenna hinnat"}
          </button>
          {message && <p className="text-sm text-slate-600">{message}</p>}
        </div>
      </div>
    </div>
  );
}
```

Placeholder-tekstit "Ruska"/"Autumn" ovat lomakkeen esimerkkejä adminissa, eivät julkista copya.

- [ ] **Step 2: Verifioi** — dev: Hinnat → Puolukka → Lisää kausi 2026-09-12…2026-09-30, 250 → Tallenna → "Hinnat tallennettu" → `/villat/villa-puolukka` taulukko näkyy. Päällekkäinen kausi → virheviesti näkyy eikä tallenna. Poista testikausi, tallenna, tarkista `git diff data/pricing.json` on tyhjä (tai palauta `git checkout data/pricing.json`).

- [ ] **Step 3: Tyypit + commit**

```bash
npx tsc --noEmit
git add src/components/admin/AdminPricing.tsx
git commit -m "feat(admin): kausihinnat — perushinta + kausirivit validoinnilla

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

Päivitä `ADMIN-GUIDE.md` "Hinnat"-kohta: "Perushinta + kaudet (alku, loppu, €/yö, valinnainen nimi). Kaudet eivät saa olla päällekkäin." Committaa samaan.

---

## Part D — Mobiili ja napit

### Task 12: Hero-napit, lehdet, yksi kulmapyöristys

**Files:**
- Modify: `src/components/home/Hero.tsx:55-68`
- Modify: `src/components/ui/WindButton.tsx`
- Modify: `src/components/motion/Magnetic.tsx:50-60`
- Modify: `src/app/globals.css` (`.wind-btn`, `.filter-pill`)
- Modify: `src/components/layout/Navbar.tsx:74,121`
- Modify: `src/components/layout/LanguageSwitcher.tsx:25,38`
- Modify: `src/components/villas/LocationFilter.tsx:35`

- [ ] **Step 1: Ennen-kuvat.** Dev käynnissä; selain `resize_window` preset `mobile`; `navigate` `http://localhost:3311/` → screenshot hero (tallenna `docs/superpowers/evidence/2026-09-09-hero-mobile-before.png` — luo kansio). Zoomaa nappeihin: dokumentoi mitä on rikki (odotus: napit `flex-nowrap` puristuvat/vuotavat, lehdet tekstin päällä).

- [ ] **Step 2: `Magnetic.tsx`** — anna kutsujan hallita displayta:

```tsx
return (
  <span
    ref={ref}
    className={className || "inline-block"}
    style={{
      transition: "transform 0.45s cubic-bezier(0.16,1,0.3,1)",
      willChange: "transform",
    }}
  >
    {children}
  </span>
);
```

(Aiempi `display: "inline-block"` inline-tyyli voitti Tailwind-luokat. `CtaSection` kutsuu ilman classNamea → oletus säilyy.)

- [ ] **Step 3: `WindButton.tsx`** — lisää `className`-prop:

```tsx
type Props = {
  href: Href;
  children: React.ReactNode;
  variant?: "light" | "dark";
  className?: string;
};

export function WindButton({ href, children, variant = "light", className = "" }: Props) {
  const isLight = variant === "light";
  return (
    <Link href={href} className={`wind-btn ${isLight ? "wind-btn-light" : "wind-btn-dark"} ${className}`}>
```

- [ ] **Step 4: `Hero.tsx` napit** (rivit 55–68) korvataan:

```tsx
<div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
  <WindButton href="/villas" variant="light" className="w-full sm:w-auto">
    {t("cta")}
  </WindButton>
  <Magnetic className="block w-full sm:inline-block sm:w-auto">
    <Link
      href="/contact"
      className="btn-ghost-light w-full whitespace-nowrap !border-[1.5px] !border-white/60 !px-[1.3rem] !py-[0.7rem] !text-[0.95rem] !leading-[1.5] hover:!bg-white/10 hover:!text-paper sm:w-auto sm:!px-[2.6rem] sm:!py-[0.7rem] sm:!text-lg sm:!leading-[1.5]"
    >
      {t("ctaSecondary")}
    </Link>
  </Magnetic>
</div>
```

(`!rounded-[0.5rem]` poistettu → `.btn-ghost-light`:n `rounded-lg`.)

- [ ] **Step 5: `globals.css`**

`.wind-btn`: `padding: 0.7rem 2.3rem 0.7rem 1.7rem;` ja `border-radius: 0.875rem;` (mobiili). `@media (min-width: 640px) .wind-btn { padding: 0.7rem 2.6rem; }` säilyy. Lisää lehtien piilotus erittäin kapeilla näytöillä:

```css
@media (max-width: 359px) {
  .wind-icon { display: none; }
  .wind-btn { padding: 0.7rem 1.3rem; }
}
```

`.filter-pill`: `rounded-full` → `rounded-lg`.

- [ ] **Step 6: Muut pillit → `rounded-lg`**
  - `Navbar.tsx:74` `hidden rounded-full px-6` → `hidden rounded-lg px-6`
  - `Navbar.tsx:121` `block rounded-full bg-ink` → `block rounded-lg bg-ink`
  - `LanguageSwitcher.tsx:25` `rounded-full border p-0.5` → `rounded-lg border p-0.5`; rivi 38 `rounded-full px-3` → `rounded-md px-3`
  - `LocationFilter.tsx:35` `rounded-full px-4` → `rounded-lg px-4`
  - Kortti-badget (`VillaCard`, `ApartmentCard`, `ApartmentHomeCard`, `ApartmentListingItem` "Tahko"-merkit), accordion-ympyrät, `FormSuccess`, `AmenityGrid` ikonit: **ei muuteta** (eivät nappeja).

- [ ] **Step 7: Jälkeen-kuvat + tarkistus.** Screenshot 375 px hero → `…-hero-mobile-after.png`; myös 320 px (`resize_window` width 320 height 700) → lehdet piilossa, teksti ehjä. Desktop 1280: napit ennallaan, radius 0.875 rem. Tarkista `/villat` suodatinpillit, navin "Ota yhteyttä", kielivalitsin.

- [ ] **Step 8: Commit**

```bash
git add src/components/home/Hero.tsx src/components/ui/WindButton.tsx src/components/motion/Magnetic.tsx src/app/globals.css src/components/layout/Navbar.tsx src/components/layout/LanguageSwitcher.tsx src/components/villas/LocationFilter.tsx docs/superpowers/evidence
git commit -m "fix(mobile): hero-napit pystyyn mobiilissa, lehdet pois tekstin päältä, kaikki napit rounded-lg

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 13: Mobiiliauditointi (impeccable)

**Files:** tapauskohtaisesti; vain aineelliset viat.

- [ ] **Step 1:** Invoke `impeccable:impeccable` (audit-tila) mobiilinäkymälle. Sivut: `/`, `/villat`, `/villat/villa-puolukka`, `/villat/tahkon-teituli`, `/asunnot`, `/yhteystiedot`, `/faq`, `/tietosuoja`, `/en`. Leveys 375 px. Kriteerit: päällekkäisyys, ylivuoto (body ei saa vierittyä vaakaan: `document.documentElement.scrollWidth <= innerWidth`), kosketuskohteet ≥ 44 px, lukukelvoton kontrasti. **Ei** ilmeen muutoksia, ei uusia sektioita, ei tummia sektioita.
- [ ] **Step 2:** Listaa löydökset (max 10) → korjaa vakavin ensin, screenshot ennen/jälkeen jokaisesta `docs/superpowers/evidence/`.
- [ ] **Step 3:** Jokaisen sivun jälkeen konsolissa `document.documentElement.scrollWidth <= window.innerWidth` → `true`.
- [ ] **Step 4:** Commit per sivu tai yhtenä: `fix(mobile): auditoinnin korjaukset (<lista>)`.

---

## Part E — Admin-esikatselu

### Task 14: CMS-avaimet + `data-cms`-attribuutit

**Files:**
- Create: `src/lib/cms/cms-keys.ts`, `src/lib/cms/cms-keys.test.ts`
- Modify: `src/components/home/Hero.tsx:18`, `VillaPreviewGrid.tsx:16`, `BrandStory.tsx:12`, `TrustStrip.tsx:34`, `HighlightsStrip.tsx:31`, `ApartmentPreviewGrid.tsx:16`, `HomeEditorialBand.tsx:13`, `HomeReviews.tsx:57`, `CtaSection.tsx:10`, `src/components/layout/Navbar.tsx:39`, `src/components/layout/Footer.tsx:22`, `src/components/ui/PageHeader.tsx` (molemmat `<section>`, uusi prop)
- Modify: sivut jotka käyttävät `PageHeader`: `villas/page.tsx`, `apartments/page.tsx`, `contact/page.tsx`, `faq/page.tsx`, `checkout/page.tsx`, `privacy/page.tsx` (prop `cmsKey`)

**Interfaces:**
- Produces: `findBestCmsKey(fieldKey: string, available: string[]): string | null`, `buildPreviewSrc(section: string, locale: "fi" | "en", previewMap: Record<string, string>): string`, `cmsLabel(key: string, sectionLabels: Record<string, string>): string`

- [ ] **Step 1: Testi `src/lib/cms/cms-keys.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { buildPreviewSrc, cmsLabel, findBestCmsKey } from "./cms-keys";

describe("findBestCmsKey", () => {
  const available = ["home.hero", "home.villas", "home", "footer", "villas.detail.calendar"];
  it("pisin prefiksi voittaa", () => {
    expect(findBestCmsKey("home.hero.title", available)).toBe("home.hero");
    expect(findBestCmsKey("home.story.title", available)).toBe("home");
  });
  it("tarkka osuma", () => {
    expect(findBestCmsKey("footer", available)).toBe("footer");
  });
  it("ei osumaa → null; 'homer' ei ole 'home'", () => {
    expect(findBestCmsKey("nav.contact", available)).toBeNull();
    expect(findBestCmsKey("homer.x", available)).toBeNull();
  });
});

describe("buildPreviewSrc", () => {
  const map = { home: "/", villas: "/villat", faq: "/faq" };
  it("fi ilman etuliitettä, en /en-etuliitteellä", () => {
    expect(buildPreviewSrc("home", "fi", map)).toBe("/?cms=1");
    expect(buildPreviewSrc("home", "en", map)).toBe("/en?cms=1");
    expect(buildPreviewSrc("villas", "en", map)).toBe("/en/villat?cms=1");
  });
  it("osio ilman sivua → etusivu", () => {
    expect(buildPreviewSrc("footer", "fi", map)).toBe("/?cms=1");
  });
});

describe("cmsLabel", () => {
  it("Osio › Alaosio", () => {
    expect(cmsLabel("home.hero", { home: "Etusivu" })).toBe("Etusivu › Hero");
    expect(cmsLabel("footer", { footer: "Alatunniste" })).toBe("Alatunniste");
    expect(cmsLabel("villas.detail.calendar", { villas: "Villat-sivu" })).toBe("Villat-sivu › Detail › Calendar");
  });
});
```

Huom: `en`-esikatselupolku käyttää suomenkielistä polkua `/en/villat`? **Ei** — next-intl:n lokalisoidut polut ovat en-puolella `/en/villas`. Korjaa testi: `expect(buildPreviewSrc("villas", "en", map)).toBe("/en/villas?cms=1")` ja anna funktiolle molemmat kartat. Lopullinen rajapinta: `buildPreviewSrc(section, locale, previewMap: { fi: Record<string,string>; en: Record<string,string> })`. Määritä `SECTION_PREVIEW_EN` `site-content-utils.ts`:ään:

```ts
export const SECTION_PREVIEW_EN: Record<string, string> = {
  home: "/", villas: "/villas", apartments: "/apartments", contact: "/contact",
  faq: "/faq", checkout: "/checkout-instructions", privacy: "/privacy",
};
```

(Polut vahvistettu `revalidate-site.ts`:n SITE_PATHS-listasta.)

- [ ] **Step 2: Aja — FAIL**

- [ ] **Step 3: Toteuta `src/lib/cms/cms-keys.ts`**

```ts
import { humanizeKey } from "@/lib/admin/site-content-utils";

export function findBestCmsKey(fieldKey: string, available: string[]): string | null {
  let best: string | null = null;
  for (const key of available) {
    if (fieldKey === key || fieldKey.startsWith(`${key}.`)) {
      if (!best || key.length > best.length) best = key;
    }
  }
  return best;
}

export function buildPreviewSrc(
  section: string,
  locale: "fi" | "en",
  previewMap: { fi: Record<string, string>; en: Record<string, string> },
): string {
  const path = previewMap[locale][section] ?? "/";
  const prefixed = locale === "en" ? (path === "/" ? "/en" : `/en${path}`) : path;
  return `${prefixed}?cms=1`;
}

export function cmsLabel(key: string, sectionLabels: Record<string, string>): string {
  const [section, ...rest] = key.split(".");
  const head = sectionLabels[section] ?? humanizeKey(section);
  if (rest.length === 0) return head;
  return `${head} › ${rest.map(humanizeKey).join(" › ")}`;
}
```

- [ ] **Step 4: Aja testit** → vihreä

- [ ] **Step 5: Lisää `data-cms`-attribuutit** (kunkin komponentin juurielementtiin):

| Tiedosto:rivi | Attribuutti |
|---|---|
| `Hero.tsx:18` `<section …` | `data-cms="home.hero"` |
| `VillaPreviewGrid.tsx:16` | `data-cms="home.villas"` |
| `BrandStory.tsx:12` | `data-cms="home.story"` |
| `TrustStrip.tsx:34` | `data-cms="home.trust"` |
| `HighlightsStrip.tsx:31` | `data-cms="home.highlights"` |
| `ApartmentPreviewGrid.tsx:16` | `data-cms="home.apartments"` |
| `HomeEditorialBand.tsx:13` | `data-cms="home.editorial"` |
| `HomeReviews.tsx:57` | `data-cms="home.homeReviews"` |
| `CtaSection.tsx:10` | `data-cms="home.cta"` |
| `Navbar.tsx:39` `<header` | `data-cms="nav"` |
| `Footer.tsx:22` `<footer` | `data-cms="footer"` |

`PageHeader.tsx`: uusi prop `cmsKey?: string`, molempiin `<section>`-elementteihin `data-cms={cmsKey}`. Sivuilla: `villas/page.tsx` → `cmsKey="villas"`, `apartments` → `"apartments"`, `contact` → `"contact"`, `faq` → `"faq"`, `checkout` → `"checkout"`, `privacy` → `"privacy"`. (Tarkista jokaisen sivun `<PageHeader` -kutsu ja lisää prop.)

- [ ] **Step 6: Tyypit + commit**

```bash
npx tsc --noEmit && npm test
git add src/lib/cms src/lib/admin/site-content-utils.ts src/components src/app
git commit -m "feat(cms): data-cms-osiomerkinnät julkisille sektioille + avainlogiikka

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 15: `CmsPreviewBridge`

**Files:**
- Create: `src/components/cms/CmsPreviewBridge.tsx`
- Modify: `src/app/[locale]/layout.tsx:103-112` (mount)
- Modify: `src/app/globals.css` (preview-tyylit)

- [ ] **Step 1: Luo `src/components/cms/CmsPreviewBridge.tsx`**

```tsx
"use client";

import { useEffect } from "react";
import { findBestCmsKey } from "@/lib/cms/cms-keys";

type ParentMessage =
  | { type: "cms:focus"; key: string; label?: string }
  | { type: "cms:reload" };

/**
 * Aktiivinen vain kun sivu on adminin iframessa (?cms=1 + parent !== window).
 * Korostaa muokattavan osion ja kertoo adminille klikatun osion.
 */
export function CmsPreviewBridge() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("cms") !== "1" || window.parent === window) return;

    const origin = window.location.origin;
    const root = document.documentElement;
    root.setAttribute("data-cms-preview", "1");
    let timer: number | undefined;

    function clearActive() {
      document.querySelectorAll("[data-cms-active]").forEach((el) => {
        el.removeAttribute("data-cms-active");
        el.removeAttribute("data-cms-label");
      });
    }

    function highlight(el: Element, label: string) {
      clearActive();
      el.setAttribute("data-cms-active", "1");
      el.setAttribute("data-cms-label", label);
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      window.clearTimeout(timer);
      timer = window.setTimeout(clearActive, 3000);
    }

    function onMessage(event: MessageEvent<ParentMessage>) {
      if (event.origin !== origin) return;
      const data = event.data;
      if (!data || typeof data !== "object") return;
      if (data.type === "cms:reload") {
        window.location.reload();
        return;
      }
      if (data.type === "cms:focus" && data.key) {
        const available = Array.from(document.querySelectorAll<HTMLElement>("[data-cms]")).map(
          (el) => el.dataset.cms ?? "",
        );
        const best = findBestCmsKey(data.key, available);
        if (!best) return;
        const el = document.querySelector(`[data-cms="${best}"]`);
        if (el) highlight(el, data.label ?? best);
      }
    }

    function onClick(event: MouseEvent) {
      const target = (event.target as Element | null)?.closest<HTMLElement>("[data-cms]");
      if (!target) return;
      event.preventDefault();
      event.stopPropagation();
      window.parent.postMessage({ type: "cms:select", key: target.dataset.cms }, origin);
    }

    window.addEventListener("message", onMessage);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("message", onMessage);
      document.removeEventListener("click", onClick, true);
      root.removeAttribute("data-cms-preview");
    };
  }, []);

  return null;
}
```

- [ ] **Step 2: Mount `layout.tsx`** — importtaa ja lisää `<CmsPreviewBridge />` heti `<Cursor />`:n jälkeen (body-tason client-komponentti, ei riipu next-intl:stä).

- [ ] **Step 3: CSS `globals.css`** (loppuun ennen `prefers-reduced-motion`-lohkoa):

```css
/* ─── Admin-esikatselu (vain ?cms=1 iframessa) ─────────────── */
[data-cms-preview] [data-cms] {
  cursor: pointer;
}
[data-cms-preview] [data-cms]:hover {
  outline: 2px dashed rgba(184, 149, 90, 0.75);
  outline-offset: -2px;
}
[data-cms-preview] [data-cms-active] {
  position: relative;
  outline: 3px solid #b8955a;
  outline-offset: -3px;
}
[data-cms-preview] [data-cms-active]::before {
  content: attr(data-cms-label);
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  z-index: 60;
  padding: 0.35rem 0.6rem;
  border-radius: 0.375rem;
  background: #b8955a;
  color: #fff;
  font: 600 0.75rem/1 var(--font-sans), system-ui, sans-serif;
  letter-spacing: 0.02em;
  pointer-events: none;
}
[data-cms-preview] .has-custom-cursor,
[data-cms-preview] .has-custom-cursor a,
[data-cms-preview] .has-custom-cursor button {
  cursor: pointer;
}
```

- [ ] **Step 4: Savutesti** — dev: avaa `http://localhost:3311/?cms=1` suoraan (ei iframe) → ei korostuksia (parent === window). Testaa iframe-tila selaimen konsolissa `/admin`-sivulla vasta Task 16:ssa.

- [ ] **Step 5: Commit**

```bash
npx tsc --noEmit
git add src/components/cms/CmsPreviewBridge.tsx "src/app/[locale]/layout.tsx" src/app/globals.css
git commit -m "feat(cms): esikatselusilta (postMessage, osion korostus, klikkaus → admin)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 16: Admin split-näkymä

**Files:**
- Modify: `src/components/admin/AdminSiteContent.tsx`

- [ ] **Step 1: Muutokset `AdminSiteContent.tsx`**

Importit:

```ts
import { useRef } from "react"; // lisää olemassa olevaan react-importtiin
import { SECTION_PREVIEW_EN } from "@/lib/admin/site-content-utils";
import { buildPreviewSrc, cmsLabel } from "@/lib/cms/cms-keys";
```

`FieldEditor` saa propin `onFocus: (path: string) => void` ja välittää `onFocus={() => onFocus(field.path)}` sekä `input`- että `textarea`-elementille.

Komponentin tilat ja refit (muiden `useState`-rivien jälkeen):

```ts
const iframeRef = useRef<HTMLIFrameElement>(null);
const [previewOpen, setPreviewOpen] = useState(true);
const [activeKey, setActiveKey] = useState<string | null>(null);

useEffect(() => {
  try {
    const stored = window.localStorage.getItem("tv-admin-preview");
    if (stored === "0") setPreviewOpen(false);
  } catch {}
}, []);

function togglePreview() {
  setPreviewOpen((open) => {
    try { window.localStorage.setItem("tv-admin-preview", open ? "0" : "1"); } catch {}
    return !open;
  });
}

function postToPreview(message: { type: "cms:focus"; key: string; label: string } | { type: "cms:reload" }) {
  iframeRef.current?.contentWindow?.postMessage(message, window.location.origin);
}

function handleFieldFocus(path: string) {
  const key = `${section}.${path}`;
  setActiveKey(key);
  postToPreview({ type: "cms:focus", key, label: cmsLabel(key, SECTION_LABELS) });
}

useEffect(() => {
  function onMessage(event: MessageEvent<{ type?: string; key?: string }>) {
    if (event.origin !== window.location.origin) return;
    if (event.data?.type !== "cms:select" || !event.data.key) return;
    const key = event.data.key;
    const [nextSection, ...rest] = key.split(".");
    if (!sectionKeys.includes(nextSection)) return;
    setSection(nextSection);
    setSearch("");
    setActiveKey(key);
    postToPreview({ type: "cms:focus", key, label: cmsLabel(key, SECTION_LABELS) });
    const prefix = rest.join(".");
    window.setTimeout(() => {
      const first = prefix
        ? document.querySelector<HTMLElement>(`[id^="${prefix}"]`)
        : document.querySelector<HTMLElement>("input[id], textarea[id]");
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      first?.focus({ preventScroll: true });
    }, 50);
  }
  window.addEventListener("message", onMessage);
  return () => window.removeEventListener("message", onMessage);
}, [sectionKeys]);
```

(`postToPreview` ja `setSection` ovat komponentin sisäisiä funktioita; koska `useEffect` viittaa niihin, määritä `postToPreview` `useCallback`-muodossa tai sisällytä `useEffect`-riippuvuuksiin — ESLint `react-hooks/exhaustive-deps`. Yksinkertaisin: määrittele `postToPreview` moduulitasolla parametrilla `iframe: HTMLIFrameElement | null`.)

`handleSave`: onnistuneen tallennuksen jälkeen `postToPreview({ type: "cms:reload" })`.

Otsikkoriviin (rivi 236 jälkeen) näkyviin muokattava kohta:

```tsx
{activeKey && (
  <p className="mt-1 text-xs font-medium text-forest">Muokkaat: {cmsLabel(activeKey, SECTION_LABELS)}</p>
)}
```

Nappiriville "Esikatselu"-kytkin (vain lg+):

```tsx
<button
  type="button"
  onClick={togglePreview}
  aria-pressed={previewOpen}
  className={`hidden rounded-lg border px-3 py-2 text-sm lg:inline-flex ${previewOpen ? "border-forest bg-forest/10 text-forest" : "border-slate-300 text-slate-700 hover:bg-slate-50"}`}
>
  {previewOpen ? "Piilota esikatselu" : "Näytä esikatselu"}
</button>
```

Sisältöalue: kääri nykyinen `<div className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6">` ja uusi iframe-paneeli rinnakkain:

```tsx
<div className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6">…nykyinen sisältö…</div>
{previewOpen && (
  <div className="hidden w-[46%] shrink-0 border-l border-slate-200 bg-slate-100 lg:flex lg:flex-col">
    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
      <span>Esikatselu — klikkaa sivun osiota avataksesi sen tekstit</span>
      <a href={previewSrc.replace("?cms=1", "")} target="_blank" rel="noreferrer" className="font-medium text-forest hover:underline">Avaa ↗</a>
    </div>
    <iframe
      ref={iframeRef}
      key={previewSrc}
      src={previewSrc}
      title="Sivuston esikatselu"
      className="h-full min-h-0 w-full flex-1 bg-white"
    />
  </div>
)}
```

missä `const previewSrc = buildPreviewSrc(section, locale, { fi: SECTION_PREVIEW, en: SECTION_PREVIEW_EN });`

`FieldEditor`-kutsuun `onFocus={handleFieldFocus}`.

- [ ] **Step 2: Savutesti** — dev `/admin` → Sivuston tekstit: iframe näkyy oikealla. Klikkaa kenttää `hero.title` → iframe vierittää heroon, kultainen reunus + "Etusivu › Hero". Klikkaa iframessa alatunnistetta → vasen vaihtuu "Alatunniste"-osioon, ensimmäinen kenttä fokusoituu. Muuta teksti → Tallenna → iframe latautuu uudelleen ja näyttää uuden tekstin. Vaihda English → iframe `/en?cms=1`. Piilota esikatselu → tila säilyy sivun päivityksen yli. Konsoli 0 virhettä. Ruutukaappaus `docs/superpowers/evidence/2026-09-09-admin-preview.png`.

- [ ] **Step 3: Commit**

```bash
npx tsc --noEmit
git add src/components/admin/AdminSiteContent.tsx
git commit -m "feat(admin): esikatselu-iframe tekstieditorin viereen, osion korostus ja klikkaus sivulta

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

Päivitä `ADMIN-GUIDE.md` Sivuston tekstit -kohta: "Oikealla näkyy sivuston esikatselu. Kun klikkaat kenttää, sivulta korostuu kohta jota muokkaat. Voit myös klikata sivulla osiota — editori hyppää sen teksteihin. Muutokset näkyvät esikatselussa tallennuksen jälkeen." Committaa samaan.

---

## Part F — Sähköposti, Airbnb-kattavuus, logo

### Task 17: Sähköposti — `EMAIL_TO`, `notified`-merkki

**Files:**
- Modify: `src/lib/email/send.ts`
- Modify: `src/types/contact.ts`, `src/types/inquiry.ts` (`notified?: boolean | null`)
- Modify: `src/lib/data/contact-store.ts:26-40`, `src/lib/data/inquiry-store.ts:31-45` (`appendContact(payload, meta)`)
- Modify: `src/app/api/contact/route.ts`, `src/app/api/inquiry/route.ts`
- Modify: `src/components/admin/AdminInbox.tsx`
- Modify: `.env.example`, `README.md`

- [ ] **Step 1: `send.ts`**: `const to = process.env.EMAIL_TO?.trim() || CONTACT_EMAIL;` ja käytä `to` molemmissa `resend.emails.send`-kutsuissa. Muuta paluuarvot: `{ sent: true }` / `{ sent: false, reason: "missing_api_key" }` (ennallaan) — lisäksi käärii `resend.emails.send`:n tuloksen: Resend palauttaa `{ data, error }`; jos `error` → `throw new Error(error.message)`.

- [ ] **Step 2: Tyypit**: `StoredContact` ja `StoredInquiry` saavat `notified?: boolean | null` (true = lähetetty, false = yritettiin ja epäonnistui, null/undefined = ei konfiguroitu).

- [ ] **Step 3: Storet**: `appendContact(payload: ContactPayload, meta: { notified: boolean | null })` → `entry = { ...payload, id, createdAt, read: false, notified: meta.notified }`. Sama `appendInquiry`. `normalizeContact/normalizeInquiry`: `notified: typeof entry.notified === "boolean" ? entry.notified : null`.

- [ ] **Step 4: Reitit** — `contact/route.ts` POST-runko:

```ts
const entry: StoredContact = { ...body, id: `cnt-${Date.now()}`, createdAt: new Date().toISOString(), read: false };
let notified: boolean | null = null;
try {
  const result = await sendContactNotification(entry);
  notified = result.sent ? true : result.reason === "missing_api_key" ? null : false;
} catch (error) {
  console.error("Contact email failed:", error);
  notified = false;
}
await appendContact(body, { notified });
return NextResponse.json({ ok: true });
```

Sama `inquiry/route.ts`:lle (`inq-` etuliite, `sendInquiryNotification`). Huom: `appendContact` luo oman id:n — hyväksyttävää, sähköposti ei viittaa id:hen.

- [ ] **Step 5: `AdminInbox.tsx`**: molempiin listoihin otsikon viereen:

```tsx
{item.notified === false && (
  <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-800" title="Sähköposti-ilmoitusta ei saatu lähetettyä — viesti on tallessa tässä">
    Ilmoitus epäonnistui
  </span>
)}
```

- [ ] **Step 6: `.env.example`**: lisää `EMAIL_TO=` kommentilla "Vastaanottaja (oletus: site.config contact.email)". `README.md` env-taulukkoon rivi `EMAIL_TO | ei | ilmoitusten vastaanottaja`.

- [ ] **Step 7: Verifioi**: `npx tsc --noEmit`. Dev ilman avainta: lähetä yhteydenottolomake → admin Yhteydenotot: merkintä ilman "Ilmoitus epäonnistui" (notified null). **Mikin kanssa:** kun `RESEND_API_KEY` on `.env.local`:ssa (Miki lisää), lähetä lomake → sähköposti saapuu Resend-tilin osoitteeseen (onboarding@resend.dev rajoitus) → Miki vahvistaa. Kirjaa tulos WORKDESKiin.

- [ ] **Step 8: Commit**

```bash
git add src/lib/email/send.ts src/types/contact.ts src/types/inquiry.ts src/lib/data/contact-store.ts src/lib/data/inquiry-store.ts src/app/api/contact/route.ts src/app/api/inquiry/route.ts src/components/admin/AdminInbox.tsx .env.example README.md
git commit -m "feat(email): EMAIL_TO, ilmoituksen tila tallennetaan ja näkyy adminissa

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 18: Airbnb-kattavuus

**Files:**
- Create: `scripts/check-airbnb-coverage.mjs`

- [ ] **Step 1: Skripti**

```js
/** Vertaa Airbnb-profiilista scrapattuja listaus-ID:itä sivuston mappaukseen. */
import { readFile } from "node:fs/promises";

const ids = JSON.parse(await readFile(new URL("../data/airbnb/profile-listing-ids.json", import.meta.url), "utf-8"));
const sync = await readFile(new URL("./sync-airbnb-content.mjs", import.meta.url), "utf-8");
const mapped = new Set([...sync.matchAll(/"(\d{8,})"/g)].map((m) => m[1]));

const missing = ids.profileIds.filter((id) => !mapped.has(id));
const extra = [...mapped].filter((id) => !ids.profileIds.includes(id));

console.log(`Profiili scrapattu: ${ids.scrapedAt}`);
console.log(`Profiilissa ${ids.profileIds.length} listausta, mapattu ${mapped.size}.`);
console.log(missing.length ? `PUUTTUU SIVUSTOLTA: ${missing.join(", ")}` : "✓ Kaikki profiilin listaukset ovat sivustolla.");
if (extra.length) console.log(`Sivustolla mutta ei profiilissa (esim. eri host-tili): ${extra.join(", ")}`);
process.exit(missing.length ? 1 : 0);
```

- [ ] **Step 2: Aja tuore scrape**: `npm run scrape:airbnb:browser` (Playwright). Jos kirjautumisseinä → skripti ei päivitä `profile-listing-ids.json`; kirjaa WORKDESKiin "Airbnb esti botin 2026-09-XX; pyydetään listaus Walterilta" ja jatka vanhalla datalla.
- [ ] **Step 3: `node scripts/check-airbnb-coverage.mjs`** → tallenna output WORKDESKiin. Nykyodotus: 10/10 + Karpalo (1217947670762444308) "ei profiilissa".
- [ ] **Step 4: Commit** `chore(airbnb): kattavuustarkistus-skripti + tulos WORKDESKissä`.

### Task 19: Logo — vaakaversio navigaatioon

**Files:**
- Modify: `src/components/layout/Logo.tsx`
- Modify: `src/components/layout/Navbar.tsx:66` (`<Logo variant="nav" …>` → `variant="nav-horizontal"`)

Lähdetiedosto puuttuu → tehdään HTML-ladottu vaakaversio nykyisellä merkillä (skaalautuu täydellisesti, käyttää sivuston Cormorant-fonttia). Kun uusi merkki saapuu, vaihdetaan vain `public/images/tahkon-villat-logo.png` (512×512, tausta läpinäkyvä; `sharp`-yksirivinen: `node -e "require('sharp')('public/images/logo-source.png').resize(512,512,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toFile('public/images/tahkon-villat-logo.png')"`) ja `logo-mark*.png` samasta.

- [ ] **Step 1: `Logo.tsx`** — lisää variantti `"nav-horizontal"`:

```tsx
type Props = {
  variant?: "nav" | "nav-horizontal" | "footer";
  className?: string;
  linked?: boolean;
  priority?: boolean;
  expanded?: boolean;
  /** Vaakaversion tekstin sävy (hero-tilassa vaalea). */
  tone?: "dark" | "light";
};
```

Renderöinti kun `variant === "nav-horizontal"`:

```tsx
const markClass = expanded ? "h-14 w-14 sm:h-16 sm:w-16" : "h-11 w-11 sm:h-12 sm:w-12";
const content = (
  <span className={`inline-flex items-center gap-3 ${className}`}>
    <span className={`relative inline-flex shrink-0 transition-all duration-300 ease-out-expo ${markClass}`}>
      <Image src={BRAND_LOGO} alt="" fill priority={priority} sizes="64px" className="object-contain" />
    </span>
    <span
      className={`hidden font-display font-semibold leading-none tracking-tight transition-all duration-300 md:inline ${
        expanded ? "text-[1.75rem]" : "text-[1.45rem]"
      } ${tone === "light" ? "text-paper" : "text-ink"}`}
    >
      {BRAND_NAME}
    </span>
  </span>
);
```

(`alt=""` merkille, koska linkin `aria-label={BRAND_NAME}` ja näkyvä teksti kantavat nimen. Mobiilissa `md:inline` piilottaa tekstin → pelkkä merkki.)

- [ ] **Step 2: `Navbar.tsx`**: `<Logo variant="nav-horizontal" priority expanded={heroOverlay} tone={heroOverlay ? "light" : "dark"} />`.

- [ ] **Step 3: Verifioi** desktop 1280 (hero-tila + vieritetty) ja mobiili 375: merkki + teksti rivissä, ei rivinvaihtoa, navilinkit eivät ahtaudu (`md`-leveydellä 768 tarkista erikseen; jos ahtautuu, tekstille `lg:inline` `md:inline`-sijaan). Screenshotit evidence-kansioon.

- [ ] **Step 4: Commit** `feat(brand): logon vaakaversio navigaatioon (merkki + ladottu nimi)`.

---

## Part G — Loppuverifiointi

### Task 20: Verifiointi, code review, dokumentit

- [ ] **Step 1:** Pysäytä dev (`preview_stop`). `npx tsc --noEmit` → tyhjä. `npm test` → kaikki vihreitä (odotus ≥ 30 testiä). `npm run build` → onnistuu, listaa reitit; `revalidate`-merkintä villasivuilla (`○`/`●` + "10800s" tai ISR-symboli).
- [ ] **Step 2:** `npx next start -p 3311` Bashilla taustalle → `curl -s -o /dev/null -w "%{http_code} %{url_effective}\n"` jokaiselle: `/`, `/villat`, `/villat/villa-puolukka`, `/villat/tahkon-teituli`, `/asunnot`, `/yhteystiedot`, `/faq`, `/tietosuoja`, `/en`, `/en/villas/villa-karpalo`, `/admin/login`, `/?cms=1` → kaikki 200. Selaimella `/` ja `/villat/villa-puolukka` konsoli 0 virhettä. Pysäytä palvelin.
- [ ] **Step 3:** Invoke `/code-review` (paikalliset muutokset vs. `cdfa889`). Korjaa löydökset, committaa.
- [ ] **Step 4:** `docs/WORKDESK.md`: kaikki rivit ✓/✗ todisteineen (komento + tulos, screenshot-polut), avoimet asiat asiakkaalta, deviaatiot (Gantt-rivit, logo HTML-ladottuna).
- [ ] **Step 5:** `ADMIN-GUIDE.md` täydennys: Airbnb-kalenterit-osio (miten linkki kopioidaan), Hinnat-kaudet, Esikatselu. `README.md` Admin-luettelo + env `EMAIL_TO`.
- [ ] **Step 6:** Commit `docs: WORKDESK, ADMIN-GUIDE ja README vaihe 1 -tilaan`.
- [ ] **Step 7:** Päivitä muisti `~/.claude/projects/C--Users-user-Documents-villasivut/memory/villasivut-redesign-direction.md`: git-identiteetti 4W33 tässä repossa, kalenteri palautettu iCal-pohjaisena, kausihinnat, esikatselu, mitä odottaa asiakkaalta. (Ei koodirakennetta — se on repossa.)
- [ ] **Step 8:** Raportti Mikille: ✓/✗-ledger jokaisesta asiakkaan 8 pyynnöstä + todisteet + "seuraava askel" (iCal-linkit asiakkaalta, logo, Resend-avain, push-lupa).

---

## Self-review (tehty kirjoituksen jälkeen)

- **Spec coverage:** §4 → T3–T8 ✓ · §5 → T9–T11 ✓ · §6 → T12–T13 ✓ · §7 → T14–T16 ✓ · §8 → T17 ✓ · §9 → T18 ✓ · §10 → T19 (HTML-lockup; PNG-vaakaversio jää odottamaan lähdettä — kirjattu) ✓ · §11 → T2 (+ identiteetti jo asetettu) ✓ · §12 → T1 + T20 ✓ · §4.6 Gantt-yksikkörivit → yksinkertaistettu (T7, kirjataan WORKDESK) ⚠ · §4.5 "unconfigured → ei renderöidä paitsi jos käsivarauksia" → T8 `nothingToShow` ✓.
- **Placeholder scan:** ei TBD/TODO. T13 on luonteeltaan auditointi ilman ennalta tunnettuja koodimuutoksia — kriteerit ja todistevaatimus määritelty.
- **Type consistency:** `BookedRange.source: "airbnb" | "manual"` käytössä T4/T5/T7/T8 ✓ · `Availability.status` arvot ✓ · `listCalendarKeys` label `{fi,en}` → T8 `label[locale]` ✓ · `PriceSeason.label?: {fi,en}` → T10 `season.label?.[lang]` ✓ · `buildPreviewSrc`-rajapinta korjattu T14:ssä (kaksi karttaa) ja käytetty T16:ssa samalla muodolla ✓ · `cmsLabel(key, SECTION_LABELS)` ✓ · `appendContact(payload, meta)` T17 ✓ · `fetchIcsText(url, { noStore })` T5→T6 ✓ · `isValidIcalUrl` siirretty `validate-url.ts`:ään (T6 huomautus) ✓.
