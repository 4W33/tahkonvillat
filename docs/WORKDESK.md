# WORKDESK — Tahkon Villat

Päivitetty: 2026-09-09 · Vastuu: Novo Media (Miki + Walter) · Asiakas: Tahkon Villat
Haara: `vaihe1-viimeistely` → mergetty `main`iin paikallisesti 2026-09-09. **Ei pushattu** (odottaa Mikin lupaa).

## Vaihe 1 — asiakkaan pyynnöt (Walter 6.9.2026)

| # | Pyyntö | Tila | Todiste |
|---|--------|------|---------|
| 1 | Varauskalenteri villoihin, vapaa/varattu, Airbnb-synkka | ✓ koodi valmis · ⏳ odottaa iCal-linkit asiakkaalta | `npm test` 42/42 (ical, availability, calendar-grid) · `evidence/2026-09-09-villa-*-calendar.png` · `admin-ical-test-error.png` |
| 2 | Hinnat ajanjaksoittain | ✓ | `evidence/2026-09-09-pricing-e2e-*.png` (kausi 12.–30.9. → "alkaen 250 €", taulukko; päällekkäinen kausi hylätään) |
| 3 | Mobiili: hero-nappi, lehdet tekstin päällä | ✓ | `evidence/2026-09-09-home-{before,after}-{mobile,320}-hero.png` |
| 4 | Napit saman muotoisia | ✓ kaikki julkiset napit `rounded-lg` | `home-after-desktop-hero.png` (nav-CTA, hero-napit), `/villat` suodattimet |
| 5 | Admin: näkee mitä muokkaa, esikatselu vieressä, tallennus nykyiseen backendiin | ✓ | `evidence/2026-09-09-admin-preview-{split,click-footer}.png` |
| 6 | Kaikki Airbnb-villat sivustolla | ✓ 10/10 profiilin listausta + Karpalo (eri host-tili) | `node scripts/check-airbnb-coverage.mjs` 2026-09-09 |
| 7 | Yhteydenottolomake lähettää sähköpostia | ✓ koodi · ⏳ odottaa RESEND_API_KEY + domain | `evidence/2026-09-09-contact-e2e-*.png` (tallentuu inboxiin, tila näkyy adminissa) |
| 8 | Uusi logo, vaakaversio naviin | ✓ vaakaversio (merkki + nimi) · ⏳ uusi merkkitiedosto asiakkaalta | `evidence/2026-09-09-logo-*.png` |
| — | Piilevä bugi: tekstiylikirjoitus ohitti uudet avaimet | ✓ korjattu (`merge-messages.ts`) | `merge-messages.test.ts` 5/5 |
| — | Mobiiliauditti (impeccable) | ✓ 1 aineellinen vika korjattu (asuntokortti venyi 1080 px) | `evidence/2026-09-09-pages-mobile-*.png`, 9 sivua ilman vaakavieritystä |
| — | Loppuverifiointi | ✓ tsc · 42 testiä · build · 12 reittiä 200 · code review APPROVE | `docs/superpowers/reviews/2026-09-09-vaihe1-code-review.md` |

## Päätökset
- 2026-09-09 Nykyinen admin + iframe-esikatselu, ei Sanitya (Miki).
- 2026-09-09 Sovellus Verceliin, tahkonvillat.fi DNS Domainhotellilta Verceliin (Miki). Domainhotellilla ei todennettua Node.js-tukea.
- 2026-09-09 Commitit 4W33-identiteetillä tässä repossa (Miki). Ei pushia ilman lupaa.
- 2026-09-09 Kalenteri vain villoille (asunnoilla ei omaa sivua) — asunnot myöhemmin jos asiakas pyytää.
- 2026-09-09 vitest 3.x (vitest 5 vaatii @types/node 22, projekti on 20).
- 2026-09-09 Teitulin yksiköt samalla Gantt-rivillä (tunnus palkissa) — yksinkertaistus specin §4.6:sta.
- 2026-09-09 Logon vaakaversio on HTML-ladottu (merkki + Cormorant-nimi), ei PNG — skaalautuu tarkasti ja vaihtuu automaattisesti kun uusi merkki tulee.
- 2026-09-09 Todisteet Playwrightilla (`scripts/evidence.mjs`), koska sovelluksen selainpaneeli esti localhostin session aikana.

## Odottaa asiakkaalta / Walterilta
- [ ] **Airbnb iCal -vientilinkit ×6**: Villa Puolukka, Villa Karpalo, Teituli A, B, 8A, 8B. Ohje adminissa (Airbnb → Kalenteri → Saatavuus → Yhdistä kalenterit → Yhdistä toiseen sivustoon). Asiakas voi liittää itse → "Testaa" → "Tallenna linkit".
- [ ] **Logon lähdetiedosto** (ChatGPT-linkki vaatii kirjautumisen) → `public/images/logo-source.png` → `sharp`-skaalaus 512×512 `tahkon-villat-logo.png` + `logo-mark*.png`.
- [ ] **Resend**: API-avain (Miki lisää `.env.local` + Vercel) ja tahkonvillat.fi:n DNS-tietueet (SPF/DKIM) Domainhotellin DNS:ään. Ilman verifioitua domainia posti menee vain Resend-tilin omistajalle.
- [ ] **Push-lupa** Mikiltä → `git push origin main` (gh aktiivinen tili 4W33).

## Vaihe 2 (ei aloitettu)
- Vercel-projekti + env (`NEXT_PUBLIC_SITE_URL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_TOKEN`, `BLOB_READ_WRITE_TOKEN`, `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TO`) + `npm run storage:seed` (DEPLOY.md)
- DNS tahkonvillat.fi → Vercel; Resend-domain verifiointi
- iCal-URL-rajaus tunnettuihin domaineihin (code review MEDIUM 1)
- PDF-sisällönhallintaopas asiakkaalle (pohja: ADMIN-GUIDE.md + evidence-kuvat)
- Loppukatselmus + `/delivery-check` → laskutus

## Kehitysmuistiinpanot
- Dev: `preview_start` → `tahkonvillat-dev` (portti 3311). Admin-savutestiin `tahkonvillat-dev-testadmin` (paikallinen testisalasana, ei koske `.env.local`).
- Todisteet: `PLAYWRIGHT_BROWSERS_PATH=%LOCALAPPDATA%\ms-playwright node scripts/evidence.mjs <admin-ical|admin-pricing|pricing-e2e|villa|home|pages|admin-preview|logo|contact-e2e>`
- `pricing-e2e` ja `contact-e2e` kirjoittavat `data/pricing.json` / `data/contacts.json` → palauta `git checkout -- data/...` ajon jälkeen.
