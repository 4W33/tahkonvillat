# Payload CMS -siirto — toteutussuunnitelma

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Oma admin-CMS (`/admin`, `api/admin/*`, Blob-JSON-varastot) poistetaan kokonaan ja tilalle tulee Payload CMS 3 samaan Next.js-sovellukseen; julkinen sivusto näyttää ja toimii kuten ennen.

**Architecture:** Next 14 → 16 + React 19 ensin omana vaiheenaan. Payload asennetaan route groupiin `(payload)`, julkinen sivusto siirtyy `(site)`-ryhmään. Sisältö Postgresissa (`@payloadcms/db-postgres`), kuvat nykyisessä YKSITYISESSÄ Vercel Blob -säilössä (`@payloadcms/storage-vercel-blob`, `access: 'private'`, Payload tarjoilee tiedostot omalla reitillään). Julkiset lukufunktiot (`getVillas`, `getApartments`, `getSiteMessages`, `getPropertyPricing`, `readIcalSources`, `readReservations`) säilyttävät nimensä ja paluutyyppinsä — vain sisus vaihtuu Payloadin Local API:in (`locale: 'all'` palauttaa `{fi, en}` -muodon, joka vastaa nykyisiä tyyppejä).

**Tech Stack:** Next.js 16.4.x, React 19, next-intl 4.14.x, payload 3.92.1, @payloadcms/next 3.92.1, @payloadcms/db-postgres 3.92.1, @payloadcms/storage-vercel-blob 3.92.1, @payloadcms/live-preview-react 3.92.1, sharp, vitest 3, embedded-postgres (vain kehitys).

**Spec:** Ei erillistä spec-dokumenttia — Miki 28.10.2026: "cms pitää vaihtaa täysin payload cms ja koko cms systeemi pitää poistaa", kysymykset myöhemmin. Suunnitteluratkaisut on kirjattu alle kohtaan "Ratkaisut (Clauden päätökset)". Inventaario nykyisestä CMS:stä: tämän sessiolokin agenttiraportti, tiivistetty tähän.

## Global Constraints

- Node `^22.23.4 || >=24.22.1` (Payload). Koneella 22.20.0 → päivitys ennen Task 3:a. Vercelissä projektin Node-asetus 22.x/24.x.
- Next.js `>=16.3.3 <17` (@payloadcms/next 3.92.1 peerDependency).
- Kaikki julkinen UI-teksti `messages/fi.json` + `messages/en.json` tai Airbnb-datasta. Payload-adminin kenttänimet/ohjeet SUOMEKSI (asiakas käyttää). Ei keksittyä copya, hintaa tai asiakastietoa.
- Ei salaisuuksia gittiin. Uudet env-muuttujat: `DATABASE_URL`, `PAYLOAD_SECRET`. Säilyvät: `BLOB_READ_WRITE_TOKEN`/`BLOB_STORE_ID`, `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TO`, `NEXT_PUBLIC_SITE_URL`. Poistuvat: `ADMIN_PASSWORD`, `ADMIN_SESSION_TOKEN`, `EVIDENCE_ADMIN_PASSWORD`.
- iCal-URL:t sisältävät salaisen tokenin: kenttätason `access.read` vain kirjautuneelle käyttäjälle — eivät saa näkyä REST/GraphQL-vastauksissa anonyymille.
- Kalenteri: virhetilanteessa EI näytetä päiviä vapaina (nykyinen `unavailable`-logiikka säilyy). iCal-lähteiden ja varausten lukuvirhe heittää (fail-loud), ei hiljaista tyhjää.
- Reveal-animaatiot vain `ui/Reveal` (ei IntersectionObserveria). Napit `rounded-lg`.
- Commitit repokohtaisella 4W33-identiteetillä. **Ei `git push`, ei Vercel-env-muutoksia, ei tietokannan luontia asiakkaan tilille ilman Mikin lupaa.**
- Koneella 16 Gt: kerralla yksi `next dev`/`next start` + yksi embedded-postgres. Palvelin sammutetaan tarkistuksen jälkeen.

## Ratkaisut (Clauden päätökset — Miki voi kumota)

1. **Postgres + Neon** tuotannossa (Vercel Marketplace, asiakkaan Vercel-tilillä). Paikallisesti `embedded-postgres` (oikea Postgres npm-paketista, ei asennusta, ei tiliä).
2. **Payloadin kuvat JULKISEEN Blob-säilöön** (muutettu 28.10. Task 3:ssa: `@payloadcms/storage-vercel-blob` 3.92.1 tukee vain `access: 'public'`). Kuvat ovat sivustolla julkisia muutenkin; sisältö ja lomakkeet ovat Postgresissa, joten yksityistä säilöä ei enää tarvita, kun vanha data on viety (Task 8). `clientUploads: true` → ei 4,5 Mt rajaa. Tuotannossa: uusi julkinen Blob-säilö projektiin.
3. **Sivuston tekstit = yksi global `site-texts`**, jonka kentät GENEROIDAAN `messages/fi.json`:n rakenteesta (ryhmä per avain, `text`/`textarea` lokalisoituna, merkkijonolistat `array`-kenttinä, avain `image` → upload-relaatio). Adminissa näkyy sama rakenne kuin ennen; uusi käännösavain ilmestyy adminiin automaattisesti. `merge-messages.ts` säilyy: oletukset + globalin arvot.
4. **Villat ja asunnot omina kokoelminaan** (`villas`, `apartments`) nykyisten tyyppien mukaan; hinnoittelu upotettuna `pricing`-ryhmänä (perushinta + kaudet, validointi `validateSeasons`). Erillinen `pricing.json` poistuu.
5. **Esikatselu (asiakaspyyntö #7)**: Payload Live Preview (`admin.livePreview`) villoille, asunnoille ja site-textsille + `RefreshRouteOnSave` julkisessa layoutissa. Esikatselu päivittyy tallennuksessa; luonnos-/autosave-tilaa EI tehdä (YAGNI).
6. **Admin suomeksi**: Payload ei sisällä suomea → oma käännös `src/payload/i18n/fi.ts` (587/587 merkkijonoa, tarkistettu en.js:ää vasten). Päivitettäessä Payloadia: diffaa en.js uudelleen.

**Task 3:n toteutuspoikkeamat (28.10.):** `package.json` `"type": "module"` (ilman sitä Payload-CLI kaatui undici-virheeseen, ei Node-versioon); vanha `src/app/admin` ja `/api/media` poistettu jo Task 3:ssa, koska Payload tarvitsee `/admin`- ja `/api/media/*`-polut; root `not-found` → `app/global-not-found.tsx` + `experimental.globalNotFound` (kaksi root layoutia). Node 22.20 toimii paikallisesti; Payloadin engines-vaatimus (≥22.23.4) koskee Verceliä → Node 22.x/24.x riittää.
7. Lomakkeet (`contacts`, `inquiries`) ja käsivaraukset (`reservations`) Payload-kokoelmia; julkinen luku/kirjoitus estetty, reittikäsittelijät kirjoittavat Local API:lla.

## Review Focus

1. Anonyymi `GET /api/villas` tai `/api/villas/<id>` → `icalUrl`-kentät puuttuvat vastauksesta (token ei vuoda). Testi Task 5.
2. Tietokanta alhaalla / kysely heittää → villasivun kalenteri näyttää "ei saatavilla", ei kaikkia päiviä vapaina. Testi Task 6.
3. Admin tallentaa kaudet, jotka menevät päällekkäin tai end < start → tallennus estyy suomenkielisellä virheellä. Testi Task 5.
4. Site-texts-globalista puuttuu avain (uusi avain lisätty `messages/*.json`:iin myöhemmin) → sivulla näkyy oletusteksti, ei avaimen nimeä eikä tyhjää. Testi Task 4.
5. Kuva poistetaan Mediasta, vaikka villa viittaa siihen → julkinen sivu ei kaadu (kuva puuttuu, sivu renderöityy). Testi Task 6.

---

### Task 1: Next 14 → 16 ja React 19 (ilman Payloadia)

**Files:**
- Modify: `package.json`, `next.config.mjs`, `src/middleware.ts` (→ `src/proxy.ts`, jos codemod nimeää), kaikki `src/app/[locale]/**/page.tsx` ja `layout.tsx`, joissa `params`/`searchParams`, `src/components/motion/RevealText.tsx` (`JSX.IntrinsicElements` → `React.JSX.IntrinsicElements`)

- [ ] **Step 1:** `npx @next/codemod@latest upgrade` (valitse 16.4.x) — päivittää `next`, `react`, `react-dom`, `@types/react*`, `eslint-config-next` ja ajaa async-`params`-codemodit.
- [ ] **Step 2:** `next.config.mjs`: `experimental.outputFileTracingIncludes` → ylätason `outputFileTracingIncludes`, `experimental.serverComponentsExternalPackages` → `serverExternalPackages`. `lint`-skripti: `next lint` poistui Next 16:sta → `eslint .`.
- [ ] **Step 3:** Aja `npx tsc --noEmit` ja korjaa jäljelle jääneet `params`/`searchParams`-tyypit (`Promise<{ locale: string }>` + `await`).
  Expected: 0 virhettä.
- [ ] **Step 4:** `npm test` → 61/61 PASS. `npm run build` → exit 0. `node scripts/check-trace.mjs` → OK.
- [ ] **Step 5:** `next start -p 3311`, tarkista 200: `/`, `/en`, `/villat`, `/villat/villa-puolukka`, `/villat/tahkon-teituli`, `/asunnot`, `/yhteystiedot`, `/faq`, `/lahtopaivan-ohjeet`, `/tietosuoja`, `/admin/login`. Sammuta palvelin.
- [ ] **Step 6:** Commit `chore: Next 16 + React 19`.

### Task 2: Paikallinen tietokanta

**Files:**
- Create: `scripts/dev-db.mjs`, Modify: `package.json` (`"db:dev": "node scripts/dev-db.mjs"`), `.env.example`, `.gitignore` (`.dev-db/`)

**Interfaces:**
- Produces: Postgres osoitteessa `postgres://postgres:postgres@127.0.0.1:54329/tahkonvillat`; `.env.example`: `DATABASE_URL=…54329/tahkonvillat`, `PAYLOAD_SECRET=` (tyhjä, ohje: `openssl rand -hex 32`).

- [ ] **Step 1:** `npm i -D embedded-postgres@18.4.0-beta.17`.
- [ ] **Step 2:** `scripts/dev-db.mjs`: `new EmbeddedPostgres({ databaseDir: '.dev-db', port: 54329, user: 'postgres', password: 'postgres', persistent: true })`; `initialise()` vain jos `.dev-db` puuttuu, `start()`, `createDatabase('tahkonvillat')` (ohita "already exists"), pidä prosessi käynnissä, `stop()` SIGINT:llä.
- [ ] **Step 3:** Aja taustalla, tarkista: `node -e "new (require('pg').Client)(process.env.DATABASE_URL).connect().then(()=>console.log('ok'))"` → `ok` (pg tulee Task 3:ssa; tähän asti riittää portin kuuntelu `Test-NetConnection 127.0.0.1 -Port 54329`).
- [ ] **Step 4:** Commit `chore: embedded-postgres paikalliseen kehitykseen`.

### Task 3: Payload asennus ja reittirakenne

**Files:**
- Move: `src/app/[locale]/**` → `src/app/(site)/[locale]/**`; `src/app/not-found.tsx` → `src/app/(site)/not-found.tsx` (sisältää jo oman `<html>`); poista `src/app/layout.tsx` (pass-through, ristiriidassa kahden root-layoutin kanssa)
- Create: `src/app/(payload)/**` kopioituna Payloadin blank-templatesta (`npx create-payload-app@3.92.1 -t blank` väliaikaiskansioon, kopioi `src/app/(payload)` sellaisenaan, älä muokkaa)
- Create: `src/payload.config.ts`, `src/payload/collections/Users.ts`, `src/payload/collections/Media.ts`
- Modify: `next.config.mjs` (`withPayload`), `tsconfig.json` (`"@payload-config": ["./src/payload.config.ts"]`), `src/proxy.ts|middleware.ts` matcher (ohita myös `admin`), `package.json`

**Interfaces:**
- Produces: `src/lib/payload.ts` → `export function getPayloadClient(): Promise<Payload>` (`getPayload({ config })`, yksi instanssi).
- Produces: config: `localization: { locales: ['fi','en'], defaultLocale: 'fi', fallback: true }`, `i18n: { supportedLanguages: { fi }, fallbackLanguage: 'fi' }`, `db: postgresAdapter({ pool: { connectionString: process.env.DATABASE_URL } })`, `secret: process.env.PAYLOAD_SECRET`, plugin `vercelBlobStorage({ enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID), collections: { media: true }, access: 'private', clientUploads: false, token: process.env.BLOB_READ_WRITE_TOKEN })`, `sharp`.
- Produces: kokoelma `media` (upload, `alt` lokalisoitu teksti pakollinen, `resizeOptions: { width: 2400, withoutEnlargement: true }`, `read: () => true`), `users` (auth, vain kirjautunut näkee/luo).

- [ ] **Step 1:** Päivitä Node ≥ 22.23.4 (`winget upgrade OpenJS.NodeJS.LTS` tai Mikin valinta). `node -v` tarkistus.
- [ ] **Step 2:** `npm i payload@3.92.1 @payloadcms/next@3.92.1 @payloadcms/db-postgres@3.92.1 @payloadcms/storage-vercel-blob@3.92.1 @payloadcms/translations@3.92.1 @payloadcms/live-preview-react@3.92.1 graphql`.
- [ ] **Step 3:** Siirrä reitit ja kopioi `(payload)`; lisää `withPayload` ja alias; `npx payload generate:importmap`.
- [ ] **Step 4:** `npm run db:dev` taustalle, `next dev -p 3311`: `/admin` näyttää suomenkielisen "luo ensimmäinen käyttäjä" -näkymän; `/` ja `/villat/villa-puolukka` 200 ja ennallaan (kuvakaappaus). Luo paikallinen testikäyttäjä; tunnukset `.env.local`-kommenttiin, EI chattiin eikä gittiin.
- [ ] **Step 5:** `npm test`, `npx tsc --noEmit` vihreät. Commit `feat(cms): Payload 3 asennus, (site)/(payload)-reittiryhmät`.

### Task 4: Site-texts-global generoituna viestipohjasta

**Files:**
- Create: `src/payload/fields/messages-to-fields.ts`, `src/payload/fields/messages-to-fields.test.ts`, `src/payload/globals/SiteTexts.ts`
- Modify: `src/lib/data/site-messages-store.ts`

**Interfaces:**
- Produces: `messagesToFields(template: Record<string, unknown>): Field[]` — objekti → `{ type: 'group', name, label, fields }`, merkkijono → `{ type: pituus > 80 ? 'textarea' : 'text', name, localized: true }`, merkkijonolista → `{ type: 'array', name, localized: true, fields: [{ name: 'value', type: 'textarea' }] }`, avain `image` → `{ type: 'upload', relationTo: 'media', name: 'image' }` (ei lokalisoitu). Labelit: avain sellaisenaan (ei keksittyä suomennosta).
- Produces: `globalToMessages(doc: unknown, locale): Partial<SiteMessages>` — array `[{value}]` → `string[]`, upload → `media.url`, null/tyhjä → avain pois (jolloin oletus jää voimaan).
- `getSiteMessages(locale)` säilyttää signaturen: `mergeMessages(bundled[locale], globalToMessages(await payload.findGlobal({ slug: 'site-texts', locale, depth: 1 }), locale))`. Virheessä palauttaa `bundled[locale]` (sisältö saa palata oletukseen — nykyinen `failLoudOnReadError`-jako).

- [ ] **Step 1:** Testit `messages-to-fields.test.ts`:
  - `messagesToFields({ a: { b: 'x' } })` → `[{ type:'group', name:'a', fields:[{ type:'text', name:'b', localized:true }] }]`
  - `{ steps: ['a','b'] }` → array-kenttä `steps`
  - `{ hero: { image: '/images/x.jpg' } }` → upload `image`, `relationTo: 'media'`
  - `globalToMessages({ steps:[{value:'a'}], hero:{ image:{ url:'/api/media/file/x.webp' } }, empty: '' })` → `{ steps:['a'], hero:{ image:'/api/media/file/x.webp' } }` (ei `empty`-avainta)
  - Review Focus 4: `mergeMessages({ a:'oletus', b:'oletus' }, globalToMessages({ a:'uusi' }))` → `{ a:'uusi', b:'oletus' }`
- [ ] **Step 2:** `npx vitest run src/payload/fields` → FAIL (moduulia ei ole).
- [ ] **Step 3:** Toteuta funktiot ja `SiteTexts` (`slug: 'site-texts'`, `label: 'Sivuston tekstit'`, `fields: messagesToFields(fiMessages)`, `read: () => true`, `afterChange`-hook → Task 7:n `revalidateSite()`).
- [ ] **Step 4:** Testit PASS. Adminissa global aukeaa, kentät näkyvät FI/EN-valitsimella.
- [ ] **Step 5:** Commit `feat(cms): sivuston tekstit Payload-globaliksi`.

### Task 5: Villat, asunnot, hinnat, iCal ja varaukset kokoelmiksi

**Files:**
- Create: `src/payload/collections/Villas.ts`, `Apartments.ts`, `Reservations.ts`, `src/payload/fields/pricing.ts`, `src/payload/access.ts`, `src/payload/collections/Villas.test.ts`
- Modify: `src/types/property-editor.ts` → siirrä `AMENITY_OPTIONS` `src/payload/fields/amenities.ts`:iin, poista loput

**Interfaces:**
- Produces: `authenticated: Access = ({ req }) => Boolean(req.user)`; `authenticatedField: FieldAccess` samoin.
- `villas`: `slug` (text, unique, pakollinen, `admin.readOnly` päivityksessä), `location` (select tahko|vantaa|helsinki), `guests`, `bedrooms` (number), `name`, `description` (lokalisoitu text/textarea), `longDescription` (lokalisoitu array `{ paragraph: textarea }`), `image` (upload media), `gallery` (upload media, `hasMany`), `imageAlt` (lokalisoitu), `amenities` (select hasMany, `AMENITY_OPTIONS`), `ratingAverage`, `ratingCount`, `reviews` (array: comment, author, rating, date), `units` (array: `unitId` text, `name` lokalisoitu, `guests`, `bedrooms`, `icalUrl` text), `icalUrl` (text), `pricing` (Task-yhteinen `pricingField`), `syncedAt` (date, readOnly). `icalUrl`-kentissä `access: { read: authenticatedField }` ja `validate` = nykyinen `validate-url.ts` (https). Labelit suomeksi ("Airbnb-kalenterin iCal-linkki" jne.).
- `apartments`: `apartmentId` (text unique), muut kentät `src/types/apartment.ts`:n mukaan + `pricing`.
- `pricingField: GroupField` nimi `pricing`: `fromPerNight` (number), `seasons` (array: `start`, `end` date, `pricePerNight` number, `label` lokalisoitu text); `validate` kutsuu `validateSeasons` (`src/lib/pricing/seasons.ts`) ja palauttaa sen suomenkielisen virheen.
- `reservations`: `calendarKey` (text, pakollinen; async `validate` hakee villat ja hyväksyy vain `listCalendarKeys(villas)`-avaimen, virhe "Tuntematon kohde tai yksikkö"), `startDate`, `endDate` (date, end > start), `guestName` (text). Kaikki access `authenticated`.

- [ ] **Step 1:** Testit `Villas.test.ts` (Payload Local API embedded-Postgresia vasten, `beforeAll` getPayload, siivous `afterAll`):
  - Review Focus 1: luo villa `icalUrl: 'https://www.airbnb.fi/calendar/ical/1.ics?t=x'`; `payload.find({ collection:'villas', overrideAccess:false })` (ei käyttäjää) → dokumentissa ei `icalUrl`-kenttää eikä `units[].icalUrl`.
  - Review Focus 3: `pricing.seasons` päällekkäisillä päivillä → `payload.create` heittää ValidationErrorin, viesti sisältää `validateSeasons`-funktion suomenkielisen tekstin.
  - `icalUrl: 'http://…'` → ValidationError.
- [ ] **Step 2:** `npx vitest run src/payload/collections` → FAIL.
- [ ] **Step 3:** Toteuta kokoelmat ja lisää configiin. Lisää `livePreview` villoille (`url: ({ data, locale }) => \`${siteUrl}/${locale === 'en' ? 'en/villas' : 'villat'}/${data.slug}\``) ja asunnoille (`/asunnot`).
- [ ] **Step 4:** Testit PASS. Commit `feat(cms): villat, asunnot, hinnat, iCal ja varaukset Payloadiin`.

### Task 6: Julkinen datakerros Payloadista

**Files:**
- Modify: `src/lib/data/content-store.ts` (jää vain `getAllVillas`, `getVillaBySlug`, `getAllApartments` + mapperit), `src/lib/data/pricing.ts`, `src/lib/data/ical-sources-store.ts`, `src/lib/data/reservation-store.ts`, `src/lib/data/villas.ts`, `src/lib/availability/availability.test.ts`
- Create: `src/lib/data/payload-mappers.ts`, `src/lib/data/payload-mappers.test.ts`

**Interfaces:**
- `toVilla(doc): Villa`, `toApartment(doc): Apartment` — `locale:'all'`-dokumentti nykyisiin tyyppeihin; upload → `url` (puuttuva/poistettu media → `image: ''` ja galleriasta suodatetaan pois).
- `getPropertyPricing(id)` lukee `pricing`-ryhmän villasta tai asunnosta (`currency: 'EUR'` vakio). Paluuarvo sama `PropertyPricing | null`.
- `readIcalSources(): Promise<IcalSourceStore>` rakentaa avaimet `slug` → villan `icalUrl`, `slug:unitId` → yksikön `icalUrl` (`overrideAccess: true`). Virhe HEITTÄÄ.
- `readReservations(): Promise<Reservation[]>` `reservations`-kokoelmasta, `propertySlug` = `calendarKey`. Virhe HEITTÄÄ.

- [ ] **Step 1:** Testit `payload-mappers.test.ts`:
  - `toVilla` lokalisoidulla dokumentilla → `name: { fi, en }`, `longDescription: { fi: [...], en: [...] }`, `units[].id === unitId`
  - Review Focus 5: `gallery: [null, { url:'/a' }]`, `image: null` → `gallery: ['/a']`, `image: ''`, ei poikkeusta
- [ ] **Step 2:** Review Focus 2: `availability.test.ts`-lisäys — `readIcalSources` heittää → `getAvailability` palauttaa `status: 'unavailable'` (ei `ok` tyhjällä `booked`-listalla). FAIL ensin, jos nykyinen koodi ei ota kiinni `readIcalSources`-virhettä.
- [ ] **Step 3:** Toteuta. `villas/[slug]/page.tsx` `revalidate` ja `generateStaticParams` säilyvät.
- [ ] **Step 4:** `npm test` PASS. Commit `feat(cms): julkinen sivusto lukee Payloadista`.

### Task 7: Lomakkeet, revalidointi ja esikatselu

**Files:**
- Create: `src/payload/collections/Contacts.ts`, `Inquiries.ts`, `src/payload/hooks/revalidate.ts`, `src/components/cms/LivePreviewRefresh.tsx`
- Modify: `src/app/api/contact/route.ts`, `src/app/api/inquiry/route.ts`, `src/lib/data/contact-store.ts`, `src/lib/data/inquiry-store.ts`, `src/app/(site)/[locale]/layout.tsx`
- Move: `src/lib/admin/revalidate-site.ts`, `revalidate-property.ts` → `src/payload/hooks/revalidate.ts`:n sisään

**Interfaces:**
- `contacts`/`inquiries`: kentät `src/types/contact.ts`/`inquiry.ts`:n mukaan + `read` (checkbox, oletus false), `notified` (select true|false|null tekstinä tai checkbox + `notifiedState`); access: `create/read/update` = `authenticated` (reitit käyttävät `overrideAccess`), `admin.defaultColumns: ['name','email','createdAt','read']`, labelit "Yhteydenotot" / "Varaustiedustelut".
- `appendContact(entry)`, `appendInquiry(entry)` säilyttävät signaturen, kirjoittavat `payload.create`. Sähköposti ensin, sitten tallennus — nykyinen järjestys ja `notified`-logiikka säilyvät.
- `revalidateSite()`, `revalidateProperty(slugOrId)` = vanhat polkulistat; kytketään `afterChange` + `afterDelete` -hookeihin (site-texts, villas, apartments, reservations, media).
- `LivePreviewRefresh`: `'use client'`, renderöi `<RefreshRouteOnSave refresh={router.refresh} serverURL={process.env.NEXT_PUBLIC_SITE_URL ?? ''} />` vain kun `window.self !== window.top`.

- [ ] **Step 1:** Ajettava tarkistus (dev + db): `POST /api/contact` validilla datalla → 200, dokumentti näkyy adminissa "Yhteydenotot"; `GET /api/contacts` ilman kirjautumista → 403.
- [ ] **Step 2:** Adminissa muuta villan kuvausta → tallenna → `/villat/villa-puolukka` näyttää uuden tekstin ilman uudelleenbuildia; Live Preview -paneeli päivittyy tallennuksessa (kuvakaappaus `docs/superpowers/evidence/payload-live-preview.png`).
- [ ] **Step 3:** Commit `feat(cms): lomakkeet, revalidointi ja live preview Payloadilla`.

### Task 8: Datan siirto (seed)

**Files:**
- Create: `scripts/seed-payload.ts` (ajetaan `npx payload run scripts/seed-payload.ts`), `scripts/export-blob-store.mjs`
- Modify: `package.json` (`"cms:seed"`, `"cms:export-blob"`)

**Interfaces:**
- `export-blob-store.mjs`: lukee tuotannon yksityisestä Blobista `store/**` (contacts, inquiries, reservations, ical-sources, pricing, content/*, content/messages/*) ja `media/properties/**` → `data/blob-export/` (gitignore). Vaatii tuotannon `BLOB_READ_WRITE_TOKEN`in → **odottaa Valtteria/Mikiä**; ilman sitä seed käyttää repon `data/`-tiedostoja.
- `seed-payload.ts`: idempotentti (upsert `slug`/`apartmentId`/`id`-avaimella). Lähteet järjestyksessä: `data/blob-export/` jos olemassa, muuten `data/`. Kuvat `public/images/properties/**` ja blob-export-media → `media` (alt = kohteen `imageAlt`). Viestit `data/content/messages/{fi,en}.json` → `site-texts` (vain arvot, jotka eroavat `messages/*.json`-oletuksesta). `data/ical-sources.json` → villojen/yksiköiden `icalUrl`. Tulostaa yhteenvedon: montako kohdetta/kuvaa/viestiä/varausta/linkkiä luotu vs päivitetty.

- [ ] **Step 1:** Aja tyhjään kantaan → yhteenveto: 3 villaa, 5 asuntoa, kuvat = `public/images/properties`-tiedostojen määrä, 3 iCal-linkkiä (Puolukka, Karpalo, Teituli 8A). Aja uudestaan → 0 luotu, kaikki päivitetty (idempotenssi).
- [ ] **Step 2:** Vertailu: `node scripts/evidence.mjs pages` ennen (Task 1:n jälkeen tallennetut) ja jälkeen → sivut näyttävät samalta (silmämääräinen + tekstisisällön diff `get_page_text`).
- [ ] **Step 3:** Commit `feat(cms): seed-skripti nykyisestä datasta Payloadiin`.

### Task 9: Vanhan CMS:n poisto

**Files (poista):** `src/app/admin/**`, `src/app/api/admin/**`, `src/components/admin/**`, `src/components/cms/CmsPreviewBridge.tsx`, `src/lib/cms/**`, `src/lib/admin/**` (paitsi `property-registry.ts` → siirrä `src/lib/data/`), `src/lib/storage/json.ts`, `media.ts`, `access-policy.ts` + testit, `src/lib/data/site-messages-store.ts`:n kirjoitusfunktiot, `pricing-store.ts`, `scripts/seed-blob-storage.mjs`, `scripts/seed-site-messages.mjs`, `scripts/check-trace.mjs`, `data/pricing.json`, `data/site-images.json`, `data/reservations.json`, `data/contacts.json`, `data/inquiries.json`, `globals.css` `[data-cms-*]`-tyylit, `data-cms`-attribuutit ja `PageHeader`in `cmsKey`.
- `src/app/api/media/[...path]/route.ts`: SÄILYTÄ, kunnes kaikki `/api/media/properties/...`-URL:t on siirretty Mediaan (seedin yhteenveto 0 jäljellä) — poista vasta sitten.
- Modify: `src/instrumentation.ts` — `assertProductionSecrets` → tarkistaa tuotannossa `DATABASE_URL` ja `PAYLOAD_SECRET` (ei ADMIN_*). Ilman tätä tuotanto kaatuu käynnistyksessä.
- Modify: `vercel.json` (`/admin(.*)`-otsakkeet koskevat nyt Payload-adminia — säilytä), `next.config.mjs` (poista `data/`-tracing-includet, jos mikään ajonaikainen koodi ei enää lue `data/`:a), `.env.example`, `package.json` skriptit.

- [ ] **Step 1:** `grep -rn "readStoreJson\|writeStoreJson\|requireAdmin\|ADMIN_PASSWORD\|data-cms" src scripts` → 0 osumaa.
- [ ] **Step 2:** `npm test`, `npx tsc --noEmit`, `npm run build` → vihreät. `next start`: kaikki Task 1:n reitit 200, `/admin` = Payload-kirjautuminen.
- [ ] **Step 3:** Commit `refactor(cms): vanha admin-CMS poistettu`.

### Task 10: Dokumentit ja tuotantovalmius

**Files:** `README.md`, `CLAUDE.md`, `DEPLOY.md`, `VERCEL-SHIP.md`, `ADMIN-GUIDE.md`, `docs/WORKDESK.md`; `package.json` `build`: `payload migrate && next build`; `src/migrations/` (`npx payload migrate:create initial`).

- [ ] **Step 1:** `npx payload migrate:create initial` tyhjää kantaa vasten → migraatio committiin; `push: false` tuotannossa (oletus).
- [ ] **Step 2:** Dokumentit: stack-taulukko (Payload + Postgres), env-taulukko, admin-osoite `/admin`, seed-ohje, uudet Vercel-vaiheet (Neon Marketplacesta → `DATABASE_URL`, `PAYLOAD_SECRET`, Node-versio). ADMIN-GUIDE kirjoitetaan uudelleen Payload-adminin mukaan — ei ominaisuuksia, joita adminissa ei ole. PDF-opas (`admin-guide-pdf.mjs`) merkitään WORKDESKiin vanhentuneeksi; uusinta erillinen tehtävä.
- [ ] **Step 3:** Loppuvarmistus `superpowers:verification-before-completion`: testit, build, reitit 200, admin-kirjautuminen, tekstimuutos näkyy sivulla, lomake tallentuu, kalenteri näyttää Airbnb-varaukset kolmelle kohteelle. Riippumaton katselmointi (`/code-review` + `/security-review`, koska login ja käyttäjädata).
- [ ] **Step 4:** Commit `docs: Payload-siirto`. EI pushia.
