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
- Payload-siirto (vaihe 2): `docs/superpowers/plans/2026-10-28-payload-cms.md`
- Asiakasohje: `ADMIN-GUIDE.md` · deploy: `DEPLOY.md`

## Komennot
- Tietokanta: `npm run db:dev` taustalle ENNEN deviä (embedded Postgres, portti 54329, data `.dev-db/`).
- Dev: `preview_start` → `tahkonvillat-dev` (portti 3311). Älä aja `npm run build` kun dev pyörii.
- Admin: `/admin` (Payload, sähköposti + salasana, kokoelma Käyttäjät).
- Testit: `npm test` · tyypit: `npx tsc --noEmit` · build: `npm run build`
- Sisältö: `npm run content:import` (Airbnb-scrape → `data/content/`) · `npm run cms:seed` (data → Payload, idempotentti, olemassa olevat kohteet ohitetaan, `--force` ylikirjoittaa) · `npm run cms:export-blob` (vanhan CMS:n tuotantodata → `data/blob-export/`)

## Kovat säännöt
- Ei koskaan keksittyä copya, hintaa tai asiakastietoa. Kaikki teksti `messages/*.json` (fi+en) tai Airbnb-datasta.
- Ei salaisuuksia gitiin. Miki syöttää avaimet itse (`.env.local`, Vercel).
- Ei IntersectionObserveria reveal-animaatioihin — käytä `ui/Reveal`.
- Kaikki julkiset napit: `rounded-lg` (0.875 rem). Ei pill-nappeja.
- Tekstit: `getSiteMessages` mergeää oletukset + Payloadin "Sivuston tekstit" -globaalit (yksi per `messages/fi.json`-osio, kentät generoidaan `messages-to-fields.ts`:llä). Uusi avain lisätään AINA molempiin `messages/fi.json` ja `messages/en.json`; adminiin se ilmestyy automaattisesti. Uusi kenttä = skeemamuutos → migraatio (`npx payload migrate:create`).
- Kalenteri: iCal-linkit villojen ja yksiköiden `icalUrl`-kentissä Payloadissa (luku vain kirjautuneelle, ei koskaan julkiseen API-vastaukseen), käsivaraukset kokoelmassa Varaukset (`calendarKey` = slug tai slug:unitId). Haku 3 h välimuistilla. Virhetilanteessa EI näytetä päiviä vapaina (`unavailable`).
- Tallennus: sisältö, varaukset ja lomakeviestit Postgresissa (paikallisesti embedded-postgres, tuotannossa Neon → `DATABASE_URL`). Kuvat Payloadin Media-kokoelmassa: tuotannossa JULKINEN Vercel Blob -säilö (`BLOB_READ_WRITE_TOKEN`, `@payloadcms/storage-vercel-blob` 3.92 ei tue yksityistä), paikallisesti `media/` (gitignore). Tuotanto vaatii `DATABASE_URL` + `PAYLOAD_SECRET` (`instrumentation.ts`). iCal-lähteiden ja varausten lukuvirhe heittää; tekstien lukuvirhe palaa `messages/*.json`-oletukseen.
- Skeemamuutokset: `npx payload migrate:create <nimi>` → `src/migrations/` committiin. Vercel-build (`build:vercel`) ajaa `payload migrate` vain tuotannossa (`VERCEL_ENV=production`), paikallinen `npm run build` ei.
- Logon vaakaversio (merkki + nimi vieressä) kytkeytyy päälle vasta kun tekstitön merkki on paikallaan: `public/images/logo-mark-plain.png` + `markPlainAvailable: true` site.configissa.
- Asiakasopas: `ADMIN-GUIDE.md` (Payload-admin). PDF `docs/Tahkon-Villat-sisallonhallintaopas.pdf` on VANHENTUNUT (vanhan adminin kuvat, generaattori poistettu) — uusinta erillinen tehtävä. Älä kirjoita oppaaseen ominaisuuksia, joita adminissa ei ole.
