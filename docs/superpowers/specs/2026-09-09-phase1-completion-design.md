# Tahkon Villat — vaihe 1: viimeistely (design spec)

Päiväys: 2026-09-09
Tila: hyväksytty chatissa (Miki, 2026-09-09) — toteutus alkaa tästä
Lähde: asiakkaan palaute Walterin kautta 6.9.2026 (kolme viestiä)

## 1. Tavoite

Asiakas (Tahkon Villat) on antanut listan puutteista. Kun ne on korjattu ja
todennettu, siirrytään vaiheeseen 2 (julkaisu, DNS, sisällönhallintaopas PDF,
loppukatselmus, laskutus). Tämä spec kattaa **vain vaiheen 1**.

Asiakkaan pyynnöt sanasta sanaan → speciin:

| # | Pyyntö | Osio |
|---|--------|------|
| 1 | Varauskalenteri jokaiseen villaan, vapaat/varatut selkeästi, Airbnb-synkka | §4 |
| 2 | Hinnat ajanjaksoittain (esim. 12.–30.9. hinta X, sen jälkeen Y) | §5 |
| 3 | Mobiili kuntoon: hero-nappi rikki, koristelehdet tekstin päällä | §6 |
| 4 | Kaikki napit saman muotoisia (pyöreitä vs. pyöristettyjä sekaisin) | §6 |
| 5 | Admin: näkee mitä kohtaa muokkaa, esikatselu/iframe vieressä, Elementor-tyyli, tallennus nykyiseen backendiin | §7 |
| 6 | Kaikki Airbnb-villat löytyvät sivustolta | §9 |
| 7 | Yhteydenottolomake lähettää sähköpostia (Resend tms.) | §8 |
| 8 | Uusi logo, vaakaversio navigaatioon | §10 |

Päätökset (Miki 2026-09-09): nykyinen admin + esikatselu (ei Sanitya);
sovellus jää Verceliin ja tahkonvillat.fi:n DNS osoitetaan sinne (Domainhotellilla
ei todennettua Node.js-tukea); commitit tähän repoon 4W33-identiteetillä.

## 2. Nykytila (todennettu 2026-09-09)

- Koodi: `C:\Users\user\Documents\tahkonvillat`, GitHub `4W33/tahkonvillat` (private, main).
- Next 14.2 App Router, next-intl fi/en, Tailwind, Vercel Blob (tuotanto) / `data/` (kehitys), Resend-koodi olemassa mutta ilman avainta.
- Admin (`/admin`): Etusivu-kuvat, Sivuston tekstit, Kohteet, Kalenteri (käsivaraukset Gantt), Hinnat (yksi "alkaen €/yö"), Varausehdotukset, Yhteydenotot.
- Julkista saatavuuskalenteria **ei ole** (poistettu aiemmin tarkoituksella). `messages/*.json` sisältää yhä `villas.detail.calendar`-tekstit.
- Kohteet: villat `villa-puolukka`, `villa-karpalo`, `tahkon-teituli` (4 yksikköä: A, B, 8A, 8B); asunnot `vantaa-1..4`, `helsinki-1`. Kaikki 11 Airbnb-listausta on mapattu (`scripts/sync-airbnb-content.mjs`).
- Työpuussa committoimatonta työtä 1.9.2026 (16 tiedostoa, `tsc` puhdas). Committataan ensin omana committinaan.
- Ei testiajuria repossa.

## 3. Rajaus

**Mukana:** §4–§10 alla + git-identiteetti + projektin CLAUDE.md + WORKDESK.md.

**Ei mukana (vaihe 2):** Vercel-tuotantodeploy ja DNS, Resend-domainin DNS-tietueet,
PDF-opas, loppukatselmus. **Ei mukana (YAGNI):** kalenteri asunnoille (niillä ei ole
omaa sivua), kentän tasoinen live-teksti esikatselussa ilman tallennusta, Sanity.

## 4. Saatavuuskalenteri (Airbnb iCal)

### 4.1 Toimintaperiaate

Airbnb tarjoaa jokaiselle listaukselle iCal-vientilinkin (Kalenteri → Saatavuus →
"Connect to another website" → kopioi linkki). Airbnb päivittää vientiä noin
**3 tunnin välein** (Airbnb Help 99). Asiakas kopioi linkit adminiin; palvelin hakee
ja välimuistittaa ne, yhdistää adminin käsivarauksiin ja näyttää villasivulla
kuukausikalenterin, jossa päivät ovat joko **vapaa** tai **varattu**.

### 4.2 Kalenteriavaimet

Yksi kalenteri per varattava yksikkö:

- `villa-puolukka`, `villa-karpalo`
- `tahkon-teituli:<unitId>` jokaiselle `units[]`-alkiolle (4 kpl)

Avain = `slug` tai `slug:unitId`. Apufunktio `listCalendarKeys(villas)` tuottaa
listan `{ key, propertySlug, unitId?, label: {fi,en} }`.

### 4.3 Tietomalli

`data/ical-sources.json` (Blob: private):

```json
{
  "villa-puolukka": { "url": "https://www.airbnb.com/calendar/ical/….ics?s=…", "updatedAt": "ISO" }
}
```

Tyypit `src/types/availability.ts`:

```ts
type IcalSource = { url: string; updatedAt: string };
type IcalSourceStore = Record<string, IcalSource>;          // key → source
type BookedRange = { start: string; end: string; source: "airbnb" | "manual" }; // end EKSKLUSIIVINEN (iCal DTEND -semantiikka)
type Availability = { key: string; booked: BookedRange[]; status: "ok" | "unavailable" | "unconfigured" };
```

### 4.4 Haku, jäsennys, välimuisti

- `src/lib/availability/ical.ts`: `parseIcsToRanges(icsText): BookedRange[]` käyttäen
  `node-ical`-kirjastoa (`sync.parseICS`). **Ennen käyttöä: context7-haku node-icalin
  nykyisestä API:sta.** Kaikki VEVENTit tulkitaan varatuiksi (Airbnb: "Reserved",
  "Airbnb (Not available)"). All-day-arvot → `YYYY-MM-DD`; DTEND puuttuessa end = start + 1 pv.
- `fetchIcal(url)` = `fetch(url, { next: { revalidate: 10800 } })` (3 h, sama kuin
  Airbnbn oma päivitysväli). Next 14: reitin uudelleenvalidointiaika seuraa lyhintä
  fetchin `revalidate`-arvoa, joten staattinen villasivu päivittyy itsestään.
- `src/lib/availability/availability.ts`: `getAvailability(key)`:
  1. lähde puuttuu → `status: "unconfigured"`, booked = pelkät käsivaraukset
  2. haku epäonnistuu (verkko, 4xx, parse) → `status: "unavailable"`, booked = käsivaraukset.
     **Ei koskaan näytetä kaikkia päiviä vapaina virhetilanteessa** — UI näyttää ilmoituksen.
  3. onnistuu → yhdistetään iCal-välit + `reservations.json`-käsivaraukset
     (`propertySlug === slug`; Teitulin käsivaraus slugilla `tahkon-teituli` estää kaikki yksiköt).
     Päällekkäiset välit yhdistetään (`mergeRanges`).

### 4.5 Julkinen UI (villasivu)

- Uusi osio "Saatavuus" villasivun pääpalstaan `longDescription`-kappaleiden jälkeen,
  ennen `VillaUnits`. Palvelinkomponentti `PropertyAvailability` hakee datan ja renderöi
  client-komponentin `AvailabilityCalendar` propseina `booked`, `status`, `labels`.
- `AvailabilityCalendar`: kuukausiruudukko (ma–su), navigointi ‹ › (kuluva kuukausi …
  +12 kk), varattu päivä = täytetty `paper-300` + yliviivaus + `aria-label="varattu"`,
  vapaa = valkoinen. Menneet päivät himmennetty. Legenda "Vapaa · Varattu".
  Alateksti: "Päivittyy Airbnbstä noin 3 tunnin välein. Varmista saatavuus tiedustelulla."
  (kaikki tekstit `messages/*.json` → `villas.detail.calendar.*`, admin voi muokata).
- Teituli: välilehdet yksiköittäin kalenterin yläpuolella (4 kalenteria).
- `status: "unavailable"` → kalenterin tilalle ilmoitus "Saatavuustietoa ei juuri nyt saada
  haettua — kysy tiedustelulla." `status: "unconfigured"` → osiota ei renderöidä lainkaan
  (asiakas ei ole vielä lisännyt linkkiä), paitsi jos käsivarauksia on.
- Mobiili: ruudukko 7 saraketta, päiväsolu ≥ 40 px, ei vaakavieritystä.
- Ei IntersectionObserveria (projektin aiempi opetus).

### 4.6 Admin

- Uusi näkymä sidebarin Toiminnot-listaan: **"Airbnb-kalenterit"** (`view: "ical"`).
  Taulukko: yksikkö (nimi) · iCal-osoite (input) · tila · "Testaa"-nappi · "Tallenna".
  "Testaa" kutsuu `POST /api/admin/ical-sources/test { url }` → vastaus
  `{ ok, count, next?: {start,end}, error? }` ja näyttää "Löytyi N varausta, seuraava 12.9.–15.9."
  Ohjeteksti + linkki Airbnbn ohjeeseen, mistä linkki kopioidaan.
- API `GET/PUT /api/admin/ical-sources` (requireAdmin). Validointi: `https://`-URL,
  avain kuuluu `listCalendarKeys`-joukkoon. Tallennus → `revalidateProperty(slug)`.
- Olemassa oleva Kalenteri-Gantt näyttää lisäksi iCal-varaukset harmaina, ei-klikattavina
  palkkeina ("Airbnb") → `GET /api/admin/ical-bookings` palauttaa kaikkien avainten
  `BookedRange[]`. Teitulin yksiköt näkyvät Gantissa omina riveinään tässä näkymässä.

## 5. Kausihinnat

### 5.1 Tietomalli (taaksepäin yhteensopiva)

```ts
type PriceSeason = { id: string; start: string; end: string; pricePerNight: number; label?: { fi: string; en: string } }; // start/end INKLUSIIVISIA päiviä
type PropertyPricing = { fromPerNight?: number; currency: "EUR"; seasons?: PriceSeason[]; updatedAt?: string };
```

Nykyinen `fromPerNight` säilyy **perushintana** ("muut ajat"). Vanha `pricing.json`
toimii ilman migraatiota (`seasons` puuttuu → tyhjä).

### 5.2 Logiikka `src/lib/pricing/seasons.ts`

- `getDisplayFromPrice(p, today)`: pienin arvo joukosta {perushinta, kausien hinnat joiden `end >= today`}. Jos ei mitään → null (hintaa ei näytetä, kuten nyt).
- `getUpcomingSeasons(p, today)`: kaudet joiden `end >= today`, järjestys `start`.
- `validateSeasons(seasons)`: `end >= start`, `pricePerNight > 0`, ei päällekkäisyyksiä saman kohteen sisällä → virheviesti suomeksi.
- `formatSeasonRange(start, end, locale)`: "12.–30.9.2026" / "12–30 Sep 2026" (Intl.DateTimeFormat, ei käsin).

### 5.3 Julkinen UI

- `PropertyPrice` käyttää `getDisplayFromPrice`-arvoa kaikissa varianteissa (kortit, listat, etusivu).
- Villasivun `detail`-variantti näyttää lisäksi taulukon **"Hinnat kausittain"**:
  rivi per tuleva kausi (`väli · nimi (jos on) · X € / yö`) + viimeisenä "Muut ajat · perushinta € / yö" jos perushinta on. Ei taulukkoa jos kausia ei ole.
- Tekstit `messages/*.json` → `pricing.seasonsTitle`, `pricing.otherTimes`.

### 5.4 Admin

`AdminPricing` per kohde: perushinta (kuten nyt) + kausilista: rivit `alku (date) · loppu (date) · € / yö · nimi (valinnainen, fi/en)` + "Lisää kausi" + poisto. Validointi selaimessa ja API:ssa (`PUT /api/admin/pricing`, `isValidStore` laajennetaan). Tallennus → `revalidatePricing()` + villasivut.

## 6. Mobiili ja napit

### 6.1 Todennus ensin

Dev-palvelin (`.claude/launch.json`, portti 3311), selain 375 px leveydellä; ruutukaappaus
ennen/jälkeen jokaisesta korjauksesta (`superpowers:verification-before-completion`).

### 6.2 Korjaukset

1. **Hero-napit**: `flex-nowrap` → mobiilissa pystyyn (`flex-col sm:flex-row`), napit
   täysleveitä alle 640 px, tekstit eivät katkea eivätkä vuoda ulos.
2. **Koristelehdet** (`WindButton`, `.wind-icon-*`): varataan lehdille tila napin padding-
   arvoihin (vasen ≈ 1.6 rem, oikea ≈ 2.2 rem alle 640 px) niin, etteivät ne osu tekstiin.
   Lehdet säilyvät (asiakas pitää teemasta). Jos tila ei riitä 320 px:ssä, lehdet piilotetaan
   `max-width: 359px`.
3. **Yksi kulmapyöristys**: kaikki julkisen sivuston napit ja pillit → `rounded-lg`
   (0.875 rem, tailwind.config). Koskee: `.btn-*`, `.wind-btn`, hero-toissijainen
   (`!rounded-[0.5rem]` poistetaan), Navbar-CTA (`rounded-full` → `rounded-lg`),
   `.filter-pill`, `VillaMobileCta`, `CtaSection`, `LanguageSwitcher`, lomakkeiden
   submit-napit. Grep `rounded-full` julkisista komponenteista → jokainen kohta
   luokitellaan (nappi → vaihdetaan; avatar/piste/badge → jää).
4. **Mobiiliauditointi** `impeccable`-skillillä kaikille julkisille sivuille
   (/, /villat, /villat/[slug], /asunnot, /yhteystiedot, /faq, /tietosuoja, /en):
   korjataan vain aineelliset viat (päällekkäisyys, ylivuoto, < 44 px kosketuskohteet,
   lukukelvoton kontrasti). Ei uutta ilmettä.

## 7. Admin-esikatselu ("Elementor-lite")

### 7.1 Layout

`AdminSiteContent` saa lg+-näytöillä jaetun näkymän: vasemmalla nykyinen editori,
oikealla `<iframe>` julkisesta sivusta (`SECTION_PREVIEW[section]` + `?cms=1`,
kielivalinnan mukaan `/en`-etuliite). "Esikatselu"-kytkin piilottaa/näyttää iframen
(tila `localStorage`). Alle lg: ei iframea, "Avaa julkisella sivulla" -linkki jää.
Osioille joilla ei ole preview-polkua (metadata, common, nav, footer, pricing,
reviews, notFound) iframe näyttää etusivun.

### 7.2 Merkkaus julkisella sivulla

Sektiokomponentit saavat `data-cms="<avainprefiksi>"`-attribuutin juurielementtiinsä:
`home.hero`, `home.villas`, `home.story`, `home.trust`, `home.highlights`,
`home.apartments`, `home.editorial`, `home.homeReviews`, `home.cta`, `nav`, `footer`,
`villas` (PageHeader), `apartments`, `contact`, `faq`, `checkout`, `privacy`,
`common` (Logo/brändi). Attribuutit ovat aina läsnä (staattisia, harmittomia).

### 7.3 Silta `CmsPreviewBridge` (client, `[locale]/layout.tsx`)

Aktivoituu vain kun `location.search` sisältää `cms=1` **ja** `window.parent !== window`.
Kaikki viestit tarkistetaan `event.origin === location.origin`.

- Vanhemmalta `{type:"cms:focus", key}` → etsitään `[data-cms]`-elementti, jonka avain on
  pisin `key`-arvon prefiksi → `scrollIntoView({block:"center"})` + korostusluokka
  (2 px gold-ääriviiva + himmeä label "Muokkaat: Etusivu › Hero") 2 s.
- Hover `[data-cms]`-elementin päällä → ohut ääriviiva + label (CSS `[data-cms-preview] [data-cms]:hover`).
- Klikkaus `[data-cms]`-elementissä (capture, `preventDefault` linkeille) → `parent.postMessage({type:"cms:select", key})`.
- `{type:"cms:reload"}` → `location.reload()`.

### 7.4 Admin-puoli

- Kentän `focus` → `iframe.contentWindow.postMessage({type:"cms:focus", key: section + "." + path})`.
- `cms:select` → `setSection(avaimen 1. osa)`, editori vierittää ensimmäiseen kenttään jonka polku alkaa avaimella, kenttä välähtää.
- Tallennuksen jälkeen (`handleSave` ok) → `cms:reload`.
- Otsikkorivi näyttää "Muokkaat: Etusivu › Hero" kun kenttä on fokusoitu.

`vercel.json`:n `X-Frame-Options: DENY` koskee vain `/admin` — julkiset sivut saa
upottaa samasta originista. Ei uusia salaisuuksia, ei uusia API-reittejä.

## 8. Sähköposti (Resend)

- Koodi (`src/lib/email/send.ts`) on valmis. Käyttöönotto vaatii: `RESEND_API_KEY`,
  `EMAIL_FROM` (verifioitu domain), uusi `EMAIL_TO` (oletus `CONTACT_EMAIL`).
  Avaimet syöttää Miki itse (`.env.local`, Vercel env) — Claude ei käsittele salaisuuksia.
- Ilman verifioitua domainia Resend toimittaa vain tilin omistajan osoitteeseen
  (`onboarding@resend.dev`) → riittää paikalliseen testiin, ei asiakkaalle.
  Domain-DNS (SPF/DKIM tahkonvillat.fi:lle) on vaiheen 2 tehtävä.
- Koodimuutokset: `EMAIL_TO`-tuki; lomakkeen tallennettuun merkintään `notified: boolean`
  (+ virheviesti lokiin), `AdminInbox` näyttää merkin "Sähköposti-ilmoitus epäonnistui" kun
  `notified === false` ja avain on asetettu. Näin asiakas näkee, jos ilmoitus ei mennyt perille.
- Done-todiste: lomake lähetetty paikallisesti → viesti saapuu (Miki vahvistaa
  postilaatikostaan) → inbox-merkintä `notified: true`.

## 9. Airbnb-kattavuus

- Ajetaan `npm run scrape:airbnb:browser` (Playwright, profiilisivu). Verrataan löydettyjä
  ID:itä `scripts/sync-airbnb-content.mjs`-mappaukseen. Puuttuvat → raportoidaan Mikille
  (uuden kohteen lisäys vaatii koodimuutoksen `site.config.ts` + sisältötuonti).
- Jos Airbnb näyttää kirjautumisseinän myös Playwrightille, pyydetään listaus Walterilta
  ja kirjataan WORKDESKiin avoimeksi.

## 10. Logo

- **Odottaa lähdetiedostoa** (ChatGPT-linkki vaatii kirjautumisen). Miki tallentaa kuvan
  `public/images/logo-source.png`.
- Tuotetaan skriptillä (`sharp` + SVG-ladonta, ei tekoälygeneraatiota):
  `tahkon-villat-logo.png` (neliö, 512) ja `tahkon-villat-logo-horizontal.png/svg`
  (merkki + "Tahkon Villat" Cormorant Garamondilla vierekkäin, korkeus 96 px @2x).
- `Logo`-komponentti: navissa vaakaversio ≥ md (korkeus 44 px, hero-tilassa 56 px),
  merkki mobiilissa; footerissa neliö. `icon.png`/`logo-mark-*.png` päivitetään samasta lähteestä.

## 11. Git-identiteetti ja projektiohjeet

- Repokohtaisesti: `user.name "4W3"`, `user.email "100098452+4W33@users.noreply.github.com"`
  (sama kuin Walterin aiemmissa commiteissa), `credential.https://github.com.username 4W33`.
  Globaali identiteetti (Andy-16300) ei muutu.
- `CLAUDE.md` repon juureen: omistaja/identiteetti, push-säännöt (ei pushia ilman lupaa),
  komennot, kovat säännöt (ei keksittyä copya, ei salaisuuksia gitiin), osoitin WORKDESKiin.
- `docs/WORKDESK.md`: projektin ohjaustaulu — tehtävät ✓/✗, päätökset, asiakkaalta
  odotettavat asiat (iCal-linkit ×6, logo, Resend-domain), vaihe 2 -lista.

## 12. Testaus

- Lisätään `vitest` (devDependency, `environment: node`, alias `@/` → `src/`). Ei React-
  komponenttitestejä; TDD puhtaalle logiikalle:
  - `ical.test.ts`: parse Airbnb-tyylinen ICS (2 VEVENT, DATE-arvot) → välit; DTEND puuttuu; tyhjä syöte.
  - `availability.test.ts`: merge päällekkäiset; käsivaraus + iCal; virhe → `unavailable` eikä tyhjä.
  - `seasons.test.ts`: from-hinta valinta; menneet kaudet pois; overlap-validointi; muotoilu fi/en.
  - `cms-keys.test.ts`: pisin prefiksi -haku (`home.hero.title` → `home.hero`).
- Rakennus- ja savutestit: `npx tsc --noEmit`, `npm run build`, `next start -p 3311`,
  kaikki julkiset reitit 200, admin-savutesti (iCal-linkin testaus mock-URL:lla paikallisesti,
  kausi tallennus → villasivu näyttää taulukon), selaimen konsoli 0 virhettä.
- Ruutukaappaukset 375 px ja 1280 px ennen/jälkeen §6:n korjauksista.

## 13. Toteutusjärjestys

1. Commit 1.9. työ · git-identiteetti · CLAUDE.md · WORKDESK.md · vitest-pohja
2. §4 kalenteri (logiikka TDD → API → admin → julkinen UI)
3. §5 kausihinnat
4. §6 mobiili + napit (+ impeccable-auditointi)
5. §7 admin-esikatselu
6. §8 sähköposti · §9 Airbnb-kattavuus · §10 logo (kun lähde saatu)
7. Loppuverifiointi (§12) → `/code-review` → WORKDESK päivitys → raportti Mikille

Arvio: 3–4 työpäivää agenttiaikaa. Kohdat 2–5 ovat toisistaan riippumattomia ja
koskevat eri tiedostoja, joten ne voidaan tarvittaessa rinnakkaistaa.
