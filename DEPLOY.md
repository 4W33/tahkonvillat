# Tahkon Villat — julkaisu Verceliin

Sovellus = Next.js 16 + Payload CMS 3. Tuotannossa tarvitaan **Postgres (Neon)** ja **julkinen Vercel Blob -säilö** kuville.
Pikalista: [VERCEL-SHIP.md](VERCEL-SHIP.md).

## Edellytykset

- Vercel-projekti kytkettynä tähän repoon (olemassa Valtterin tilillä)
- Node.js 24.x: `package.json` `engines` lukitsee sen Vercelissä (ohittaa Settings → Node.js Version). Payload vaatii `^22.23.4 || >=24.22.1`
- Domain `tahkonvillat.fi` (tai `*.vercel.app`) Vercelissä
- Resend valinnainen (lomakkeet tallentuvat ilman sitä Payloadin Viestit-ryhmään)

## Ympäristömuuttujat (Production)

**Vercel → Project → Settings → Environment Variables:**

| Muuttuja | Pakollinen | Huom. |
|----------|-----------|-------|
| `DATABASE_URL` | Kyllä | Neon (Vercel Marketplace lisää sen projektiin) |
| `PAYLOAD_SECRET` | Kyllä | Pitkä satunnainen merkkijono, ks. alla |
| `BLOB_READ_WRITE_TOKEN` | Kyllä | **JULKINEN** Blob-säilö (Storage → Blob), Vercel lisää itse |
| `NEXT_PUBLIC_SITE_URL` | Kyllä | `https://tahkonvillat.fi` tai `https://<projekti>.vercel.app` |
| `RESEND_API_KEY`, `EMAIL_FROM` | Ei | Lomakeilmoitukset ja adminin salasanan palautus sähköpostiin (ilman avainta palautuslinkki menee vain lokiin), `EMAIL_FROM` vaatii verifioidun domainin |
| `EMAIL_TO` | Ei | Vastaanottaja, oletus `site.config.ts` contact.email |

Ilman `DATABASE_URL`ia, `PAYLOAD_SECRET`ia tai `BLOB_READ_WRITE_TOKEN`ia sovellus kaatuu käynnistyksessä (`src/instrumentation.ts`).
`ADMIN_PASSWORD` ja `ADMIN_SESSION_TOKEN` eivät ole enää käytössä — ne voi poistaa Vercelistä.

`PAYLOAD_SECRET` (PowerShell):

```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 48 | ForEach-Object { [char]$_ })
```

## Build ja migraatiot

`vercel.json` → `buildCommand: npm run build:vercel`: tuotantobuild (`VERCEL_ENV=production`) ajaa ensin
tietokantamigraatiot (`src/migrations/`), preview-build ja paikallinen `npm run build` **eivät**.

> **Preview = oma Neon-haara.** Preview-deploy ei migroi kantaa, joten sama `DATABASE_URL` kuin tuotannolla kaataisi
> skeemamuutoksen sisältävän previewn vanhaan skeemaan. Luo Neoniin haara (Branches → Create branch tuotannosta) ja
> aseta sen `DATABASE_URL` vain Preview-ympäristöön. Uusi skeema haaraan: aja `npx payload migrate` omalta koneelta
> haaran `DATABASE_URL`illa.

Skeemamuutoksen jälkeen (uusi kenttä, uusi käännösavain `messages/fi.json`:iin): `npx payload migrate:create <nimi>` paikallista kantaa vasten → committaa `src/migrations/`.

## Julkaisun vaiheet

1. **Neon:** Vercel → Storage / Marketplace → Neon → kytke projektiin → `DATABASE_URL` Productioniin.
2. **Vanhan datan export (ennen Blob-vaihtoa):** ota vanhan YKSITYISEN säilön `BLOB_READ_WRITE_TOKEN` talteen ja aja omalla koneella:

   ```powershell
   $env:BLOB_READ_WRITE_TOKEN="<vanhan yksityisen säilön token>"; npm run cms:export-blob
   ```

   → `data/blob-export/` (gitignore): tekstit, hinnat, varaukset, lomakeviestit ja adminissa ladatut kuvat.
3. **Julkinen Blob:** Storage → Blob → luo uusi säilö **Public**-tasolla → kytke projektiin → `BLOB_READ_WRITE_TOKEN`.
   Vanha yksityinen säilö pitää irrottaa projektista, koska molemmat käyttävät samaa muuttujanimeä.
4. Lisää `PAYLOAD_SECRET` ja `NEXT_PUBLIC_SITE_URL` → **Redeploy**. Build ajaa `payload migrate` → taulut syntyvät.
5. **Ensimmäinen käyttäjä heti:** avaa `https://<osoite>/admin` → "Luo ensimmäinen käyttäjä". Tyhjässä kannassa kuka tahansa
   osoitteen tietävä voisi luoda sen, joten tee tämä heti deployn jälkeen.
6. **Data Payloadiin** omalta koneelta tuotannon arvoilla (ympäristön arvot voittavat `.env.local`in):

   ```powershell
   $env:DATABASE_URL="<Neonin DATABASE_URL>"
   $env:PAYLOAD_SECRET="<tuotannon PAYLOAD_SECRET>"
   $env:BLOB_READ_WRITE_TOKEN="<uuden JULKISEN säilön token>"
   npm run cms:seed
   ```

   Lähde on `data/blob-export/`, jos se on olemassa, muuten repon `data/`. iCal-linkit tulevat paikallisesta
   `data/ical-sources.json`ista (gitignore), jos exportissa ei ole omaa. Paikallinen ajo 28.10. tyhjään kantaan:
   117 kuvaa, 3 villaa, 5 asuntoa, 6 iCal-linkkiä, 1 varaus. Ajo on idempotentti: olemassa olevat villat ja
   asunnot ohitetaan, joten asiakkaan muokkaukset säilyvät. `npm run cms:seed -- --force` ylikirjoittaa ne datan arvoilla.
7. **Redeploy seedin jälkeen:** seed ei tyhjennä Vercelin sivuvälimuistia (revalidointi on seedissä pois päältä), joten
   ensimmäisessä deployssa tyhjästä kannasta rakennetut sivut näkyisivät tyhjinä, kunnes välimuisti vanhenee. Vercel → Deployments → Redeploy.
8. **Tarkista live:**

   | URL | Tarkistus |
   |-----|-----------|
   | `/` | Etusivu, hero-kuva |
   | `/villat` | Villalista + hinnat |
   | `/villat/villa-puolukka` | Galleria, Saatavuus-kalenteri, tiedustelulomake |
   | `/asunnot` | Asunnot |
   | `/yhteystiedot` | Yhteydenottolomake |
   | `/faq` · `/tietosuoja` | Sisältösivut |
   | `/admin` | Payload-kirjautuminen |

9. **Admin-savutesti:**
   - Sivuston tekstit → Etusivu → muuta tekstiä → Tallenna → päivitä `/` (muutos näkyy)
   - Villat → villa → Hinnat → muuta perushintaa → Tallenna → päivitä `/villat`
   - Lähetä yhteydenottolomake → Viestit → Yhteydenotot

## Mitä adminissa ei voi muokata

- Yhteystietojen sähköposti footerissa (`site.config.ts`)
- Uusi FAQ-kysymys (rakenne `messages/*.json`:ssa) — uusi avain vaatii kehittäjän ja migraation

Asiakkaan ohje: **ADMIN-GUIDE.md**.

## Paikallinen kehitys

```bash
npm run db:dev      # Postgres 127.0.0.1:54329
npm run dev:clean
```

Ilman `BLOB_READ_WRITE_TOKEN`ia kuvat tallentuvat `media/`-kansioon.

## Vianetsintä

| Ongelma | Korjaus |
|---------|---------|
| Käynnistys kaatuu "Puuttuvat ympäristömuuttujat" | Lisää virheessä nimetyt: `DATABASE_URL`, `PAYLOAD_SECRET`, `BLOB_READ_WRITE_TOKEN` → Redeploy |
| Build kaatuu `payload migrate`iin | `DATABASE_URL` puuttuu buildista tai kanta ei vastaa — tarkista Neon-kytkentä |
| Payload vaatii uudemman Noden | `package.json` `engines.node` = `24.x`; paikallisesti Node ≥ 22.23.4 |
| Kuvan lataus epäonnistuu | `BLOB_READ_WRITE_TOKEN` puuttuu tai säilö ei ole julkinen |
| Kuvat puuttuvat sivulta | `cms:seed` ajamatta tuotantokantaan / säilöön |
| Kalenteri "Saatavuustietoa ei juuri nyt saada haettua" | iCal-linkki virheellinen, Airbnb ei vastaa tai kanta ei vastaa — päiviä ei silloin näytetä vapaina. Tyhjä linkki = vain käsivaraukset |

## DNS (tuotantodomain)

Osoita `tahkonvillat.fi` Verceliin. Lisää Resendin DNS-tietueet, jos käytät omaa `EMAIL_FROM`-osoitetta.
