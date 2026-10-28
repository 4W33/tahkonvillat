# Tahkon Villat

Mökki- ja asuntovuokrauksen esittelysivusto (FI/EN), sisällönhallinta **Payload CMS 3** samassa
Next.js-sovelluksessa (`/admin`). Varaukset hoidetaan **tiedustelulomakkeella**. Villasivuilla on julkinen
**Saatavuus-kalenteri** (vapaa/varattu), joka yhdistää Airbnbn iCal-viennin (villan tai yksikön
iCal-linkki adminissa, haku 3 h välimuistilla) ja adminin käsivaraukset (Varaukset).
Hinnat: perushinta + kausihinnat ajanjaksoittain (villan/asunnon "Hinnat"-ryhmä).

## Stack

| Osa | Valinta |
|-----|---------|
| Framework | Next.js 16 (App Router) + React 19 |
| CMS | Payload 3 (`src/payload.config.ts`), admin suomeksi (`src/payload/i18n/fi.ts`) |
| Tietokanta | Postgres: paikallisesti embedded-postgres (`npm run db:dev`), tuotannossa Neon |
| Kuvat | Payloadin Media-kokoelma: tuotannossa julkinen Vercel Blob, paikallisesti `media/` |
| Kielet | next-intl, `fi` (oletus) + `en`, `localePrefix: "as-needed"`; Payloadin lokalisointi fi/en |
| Tyylit | Tailwind CSS |
| Sähköposti | Resend (valinnainen — ilman sitä viestit tallentuvat vain Payloadin Viestit-ryhmään) |

## Kohteet

Kohdelista on koodissa: `src/lib/site.config.ts`.

- **Villat (Tahko):** `villa-puolukka`, `villa-karpalo`, `tahkon-teituli`
- **Asunnot (Uusimaa):** `vantaa-1` … `vantaa-4`, `helsinki-1`

Kohteiden sisältö on Payloadissa (kokoelmat Villat ja Asunnot). Alkudata tuotiin Airbnb-listauksista
(`data/airbnb/` → `data/content/<slug>.json` → `npm run cms:seed`). **Sivustolle ei kirjoiteta keksittyä
markkinointitekstiä** — kaikki copy on joko asiakkaan omaa (`messages/*.json` / Sivuston tekstit) tai
peräisin oikeasta listausdatasta.

## Kehitys

Vaatii Node `^22.23.4 || >=24.22.1` (Payloadin vaatimus).

```bash
npm install
cp .env.example .env.local   # täytä PAYLOAD_SECRET
npm run db:dev               # oma terminaali/tausta: Postgres 127.0.0.1:54329
npm run cms:seed             # kerran: kohteet, kuvat, iCal-linkit ja varaukset kantaan
npm run dev:clean            # tyhjentää .next-välimuistin ensin (OneDrive rikkoo sen herkästi)
```

Avaa `/admin` → tyhjässä kannassa Payload pyytää luomaan ensimmäisen käyttäjän.
Ilman `BLOB_READ_WRITE_TOKEN`-muuttujaa ladatut kuvat tallentuvat `media/`-kansioon.

Tuotantobuildin testaus paikallisesti (ei aja migraatioita):

```bash
npm run preview
```

## Ympäristömuuttujat

Kopioi `.env.example` → `.env.local`. **`.env.local` ei mene gitiin.**

| Muuttuja | Pakollinen | Selite |
|----------|-----------|--------|
| `DATABASE_URL` | kyllä | Postgres. Paikallisesti `postgres://postgres:postgres@127.0.0.1:54329/tahkonvillat`, tuotannossa Neon |
| `PAYLOAD_SECRET` | kyllä | pitkä satunnainen merkkijono (`openssl rand -hex 32`) |
| `NEXT_PUBLIC_SITE_URL` | tuotanto | esim. `https://tahkonvillat.fi` |
| `BLOB_READ_WRITE_TOKEN` | tuotanto | JULKINEN Vercel Blob -säilö Payloadin kuville |
| `RESEND_API_KEY`, `EMAIL_FROM` | ei | lomakeilmoitukset ja adminin salasanan palautus sähköpostiin (EMAIL_FROM vaatii verifioidun domainin) |
| `EMAIL_TO` | ei | ilmoitusten vastaanottaja (oletus `site.config.ts` contact.email) |

Tuotannossa sovellus kaatuu käynnistyksessä, jos `DATABASE_URL` tai `PAYLOAD_SECRET` puuttuu (`src/instrumentation.ts`).

## Skriptit

| Komento | Mitä tekee |
|---------|-----------|
| `npm run db:dev` | paikallinen Postgres (embedded-postgres, data `.dev-db/`) |
| `npm run dev:clean` | kehityspalvelin puhtaalla välimuistilla |
| `npm run build` | tuotantobuild (tyhjentää välimuistin ensin, ei migraatioita) |
| `npm run build:vercel` | `payload migrate` vain tuotantobuildissa (`VERCEL_ENV=production`) + build — Vercelin buildikomento (`vercel.json`) |
| `npm run cms:seed` | `data/` (tai `data/blob-export/`) → Payload: kohteet, kuvat, hinnat, iCal-linkit, varaukset, viestit, tekstit. Idempotentti: olemassa olevat villat/asunnot ohitetaan, `-- --force` ylikirjoittaa ne datan arvoilla |
| `npm run cms:export-blob` | vanhan CMS:n tuotantodata yksityisestä Blobista → `data/blob-export/` (vaatii tuotannon yksityisen säilön tokenin) |
| `npm run content:import` | scrapeaa Airbnb-listaukset ja synkkaa `data/content/`-tiedostoihin (Payloadiin vasta `cms:seed`illä) |
| `npm run content:prices` | hakee ohjehinnat Airbnb-profiilista |
| `npm test` | vitest (iCal, kausihinnat, viestimerge, Payload-kentät; Villas-testit vaativat `db:dev`in, muuten ohitetaan) |
| `npx payload migrate:create <nimi>` | uusi migraatio skeemamuutoksen jälkeen → `src/migrations/` |
| `node scripts/evidence.mjs <logo\|villa\|home\|pages>` | Playwright-todisteruutukaappaukset dev-palvelinta vasten → `docs/superpowers/evidence/` |
| `node scripts/check-airbnb-coverage.mjs` | vertaa Airbnb-profiilin listaukset sivuston mappaukseen |

## Admin

`/admin` (Payload) → **Sisältö:** Villat · Asunnot · Kuvat — **Varaukset:** Varaukset — **Viestit:** Yhteydenotot · Varaustiedustelut — **Sivuston tekstit:** yksi näkymä per osio (Etusivu, Valikko, FAQ…) — **Asetukset:** Käyttäjät.

- Asiakkaan ohje: [ADMIN-GUIDE.md](ADMIN-GUIDE.md) (mitä voi ja ei voi muokata)
- `docs/Tahkon-Villat-sisallonhallintaopas.pdf` on vanhan adminin opas — **vanhentunut**, uusitaan Payload-administa
- Julkaisu: [DEPLOY.md](DEPLOY.md) · pikalista: [VERCEL-SHIP.md](VERCEL-SHIP.md)

## Kansiorakenne

```
src/app/(site)/[locale]/  julkiset sivut (fi/en, lokalisoidut polut)
src/app/(payload)/        Payload-admin (/admin) ja sen API (/api/*)
src/app/api/              lomakereitit (contact, inquiry)
src/payload/              kokoelmat, globaalit (Sivuston tekstit), kentät, hookit, suomennos
src/migrations/           Payloadin tietokantamigraatiot
src/components/           ui, home, villas, apartments, cms (live preview), motion
src/lib/data/             julkiset lukufunktiot Payloadista (kohteet, hinnat, varaukset, iCal, tekstit)
data/                     Airbnb-tuonti + sisältö-JSON (seedin lähde), ical-sources.json (gitignore)
messages/                 i18n-oletustekstit (Sivuston tekstit ylikirjoittaa)
docs/                     suunnitelmat, ohjaustaulu, todisteet
```
