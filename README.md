# Tahkon Villat

Mökki- ja asuntovuokrauksen esittelysivusto (FI/EN) omalla kevyellä admin-CMS:llä.
Varaukset hoidetaan **tiedustelulomakkeella**. Villasivuilla on julkinen
**Saatavuus-kalenteri** (vapaa/varattu), joka yhdistää Airbnbn iCal-viennin
(adminin "Airbnb-kalenterit", haku 3 h välimuistilla) ja adminin käsivaraukset.
Hinnat: perushinta + kausihinnat ajanjaksoittain (adminin "Hinnat").

## Stack

| Osa | Valinta |
|-----|---------|
| Framework | Next.js 14 (App Router) |
| Kielet | next-intl, `fi` (oletus) + `en`, `localePrefix: "as-needed"` |
| Tyylit | Tailwind CSS |
| Tallennus | Vercel Blob tuotannossa, paikallinen `data/` + `public/images/` kehityksessä |
| Sähköposti | Resend (valinnainen — ilman sitä viestit tallentuvat vain admin-inboxiin) |
| Kuvat | `next/image` + sharp |

## Kohteet

Kohdelista on koodissa: `src/lib/site.config.ts`.

- **Villat (Tahko):** `villa-puolukka`, `villa-karpalo`, `tahkon-teituli`
- **Asunnot (Uusimaa):** `vantaa-1` … `vantaa-4`, `helsinki-1`

Sisältö tulee `data/content/<slug>.json` -tiedostoista, jotka on tuotu Airbnb-listauksista
(`data/airbnb/`). **Sivustolle ei kirjoiteta keksittyä markkinointitekstiä** — kaikki copy
on joko asiakkaan omaa (`messages/*.json`) tai peräisin oikeasta listausdatasta.

## Kehitys

```bash
npm install
npm run dev:clean      # tyhjentää .next-välimuistin ensin (OneDrive rikkoo sen herkästi)
```

Ilman `BLOB_READ_WRITE_TOKEN`-muuttujaa admin kirjoittaa paikalliseen `data/`-kansioon.

Tuotantobuildin testaus paikallisesti:

```bash
npm run preview
```

## Ympäristömuuttujat

Kopioi `.env.example` → `.env.local`. **`.env.local` ei mene gitiin.**

| Muuttuja | Pakollinen | Selite |
|----------|-----------|--------|
| `ADMIN_PASSWORD` | kyllä | `/admin/login` |
| `ADMIN_SESSION_TOKEN` | kyllä (tuotanto) | pitkä satunnainen merkkijono, ei kehityksen oletusarvo |
| `NEXT_PUBLIC_SITE_URL` | tuotanto | esim. `https://tahkonvillat.fi` |
| `BLOB_READ_WRITE_TOKEN` | tuotanto | Vercel Blob — ilman tätä admin-tallennukset kaatuvat |
| `RESEND_API_KEY`, `EMAIL_FROM` | ei | lomakeilmoitukset sähköpostiin (EMAIL_FROM vaatii verifioidun domainin) |
| `EMAIL_TO` | ei | ilmoitusten vastaanottaja (oletus `site.config.ts` contact.email) |

## Skriptit

| Komento | Mitä tekee |
|---------|-----------|
| `npm run dev:clean` | kehityspalvelin puhtaalla välimuistilla |
| `npm run build` | tuotantobuild (tyhjentää välimuistin ensin) |
| `npm run content:import` | scrapeaa Airbnb-listaukset ja synkkaa `data/content/`-tiedostoihin |
| `npm run content:messages` | luo/päivittää admin-CMS:n tekstipohjan `data/content/messages/` |
| `npm run content:prices` | hakee ohjehinnat Airbnb-profiilista |
| `npm run storage:seed` | lataa `data/` + kuvat Vercel Blobiin (aja kerran deployn jälkeen) |
| `npm test` | vitest (puhdas logiikka: iCal, kausihinnat, viestimerge, CMS-avaimet) |
| `node scripts/evidence.mjs <skenaario>` | Playwright-todisteruutukaappaukset dev-palvelinta vasten → `docs/superpowers/evidence/` |
| `node scripts/check-airbnb-coverage.mjs` | vertaa Airbnb-profiilin listaukset sivuston mappaukseen |
| `node scripts/admin-guide-pdf.mjs` | rakentaa asiakkaan sisällönhallintaoppaan PDF:ksi (vaatii käynnissä olevan palvelimen) |

## Admin

`/admin/login` → Etusivu-kuvat · Sivuston tekstit (esikatselu-iframe) · Kohteet · Kalenteri · Airbnb-kalenterit (iCal) · Hinnat (perushinta + kaudet) · Varausehdotukset · Yhteydenotot.

- Asiakkaan ohje: [ADMIN-GUIDE.md](ADMIN-GUIDE.md) (mitä voi ja ei voi muokata)
- Asiakkaalle jaettava opas: [docs/Tahkon-Villat-sisallonhallintaopas.pdf](docs/Tahkon-Villat-sisallonhallintaopas.pdf) — rakennetaan `scripts/admin-guide-pdf.mjs`:llä, lähde `docs/admin-guide-source.html`
- Julkaisu: [DEPLOY.md](DEPLOY.md) · pikalista: [VERCEL-SHIP.md](VERCEL-SHIP.md)

## Kansiorakenne

```
src/app/[locale]/     julkiset sivut (fi/en, lokalisoidut polut)
src/app/admin/        admin-UI
src/app/api/admin/    admin-API (cookie-autentikointi)
src/components/       ui, home, villas, apartments, admin, motion
src/lib/data/         sisältö-, hinta-, varaus- ja viestivarastot
src/lib/storage/      Blob vs. paikallinen tiedostojärjestelmä
data/                 sisältö-JSON + Airbnb-tuonti + lomakedata
messages/             i18n-oletustekstit (admin voi ylikirjoittaa)
docs/                 spec + vanha teemakonsepti
```
