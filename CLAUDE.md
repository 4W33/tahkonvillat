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
- Tallennustasot: `src/lib/storage/access-policy.ts` on ainoa paikka, joka päättää onko blob public vai private. Älä anna access-tasoa kutsukohtaisesti — luku ja kirjoitus eriytyisivät taas.
- Logon vaakaversio (merkki + nimi vieressä) kytkeytyy päälle vasta kun tekstitön merkki on paikallaan: `public/images/logo-mark-plain.png` + `markPlainAvailable: true` site.configissa.
- Asiakasopas: `node scripts/admin-guide-pdf.mjs` (dev-palvelin käynnissä) → `docs/Tahkon-Villat-sisallonhallintaopas.pdf`. Älä kirjoita oppaaseen ominaisuuksia, joita adminissa ei ole.
