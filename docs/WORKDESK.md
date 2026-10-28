# WORKDESK — Tahkon Villat

Päivitetty: 2026-09-09 · Vastuu: Novo Media (Miki + Walter) · Asiakas: Tahkon Villat
Haara `vaihe1-viimeistely` mergetty `main`iin ja **pushattu** `4W33/tahkonvillat`.

## Vaihe 1 — asiakkaan pyynnöt (Valtteri 6.9.2026)

| # | Pyyntö | Tila | Todiste |
|---|--------|------|---------|
| 1 | Varauskalenteri villoihin, vapaat/varatut | ✓ koodi · ⏳ iCal-linkit asiakkaalta | `npm test` 47/47 · `evidence/villa-*-calendar.png` |
| 2 | Airbnb-synkka automaattisesti | ✓ koodi · ⏳ iCal-linkit | `evidence/admin-ical-test-error.png` |
| 3 | Hinnat ajanjaksoittain | ✓ | `evidence/pricing-e2e-*.png` |
| 4 | Mobiili: hero button, lehdet tekstin päällä | ✓ | `evidence/home-{before,after}-*.png` |
| 5 | Nykyinen teema säilyy, vain viimeistely | ✓ | — |
| 6 | Sisällönhallinta selkeäksi (admin tai Sanity) | ✓ nykyinen admin | — |
| 7 | Näkee mitä muokkaa, esikatselu vieressä | ✓ | `evidence/admin-preview-*.png` |
| 8 | Kaikki Airbnb-villat sivustolla | ✓ 10/10 + Karpalo | `scripts/check-airbnb-coverage.mjs` |
| 9 | Lomakkeen sähköpostit | ✓ koodi · ⏳ Resend-avain + DNS | `evidence/contact-e2e-*.png` |
| 10 | Uusi logo (Nanobanana-viimeistely) | ⏳ lähdetiedosto asiakkaalta | — |
| 11 | Logon teksti kuvan viereen, skaalautuu naviin | ✓ koodi valmis, kytkeytyy kun merkki saapuu | `evidence/logo-fixed-*.png` |
| 12 | Kaikki buttonit saman muotoisia | ✓ `rounded-lg` | `evidence/home-after-desktop-hero.png` |
| 13 | Siirto Domainhotellin hostille | ⚠ **ei onnistu** — ei Node-tukea. Esitys: Vercel + DNS. **Kerrottava asiakkaalle.** | — |
| 14 | Kattava PDF-sisällönhallintaopas | ✓ 15 sivua | `docs/Tahkon-Villat-sisallonhallintaopas.pdf` |
| 15 | Koko sivuston loppukatsaus | ✓ tekninen · ⏳ asiakkaan kanssa | `docs/superpowers/reviews/2026-09-09-vaihe1-code-review.md` |
| 16 | Projektin päätös ja laskutus | ✗ vaihe 2 | — |

### Löydetty ja korjattu ilman erillistä pyyntöä
- Tekstiylikirjoitus ohitti uudet käännösavaimet → `merge-messages.ts` (`f217293`)
- Asuntokortti venyi mobiilissa 1080 px leveäksi → grid-korjaus (`9567b58`)
- **Yksityiset blobit luettiin autentikoimatta** → admin-tallennukset olisivat kadonneet tuotannossa (`95761d2`)
- Logon nimi näkyi navissa kahdesti → vaakatunnus vaatii nyt tekstittömän merkin (`2a8dac7`)

## Tuotantobugi 13.9.2026 — korjattu
- Oire: `tahkonvillat-pi.vercel.app` villasivut 404, /villat ja /asunnot tyhjinä. Etusivu toimi.
- Juurisyy: `data/`-tiedostot eivät olleet mukana Vercelin palvelinfunktioissa (0 tiedostoa .nft.json:ssa). Ajon aikana renderöidyt sivut lukivat tyhjää. Toistettu paikallisesti piilottamalla data/content.
- Korjaus `5c381fd`: `experimental.outputFileTracingIncludes` data/content/** + data/*.json. Regressiotarkistus `node scripts/check-trace.mjs`.
- Todennettu tuotannossa: 10 reittiä 200, villakortit ja asunnot näkyvät, mobiilikuva `evidence/2026-09-13-prod-villasivu-mobiili.png`.

## Tallennus korjattu 14.9.2026
- Löydös: Vercel Blobissa taso on kiinteä per säilö, koodi sekoitti julkista ja yksityistä → puolet tallennuksista olisi kaatunut.
- Tuotannossa 14.9.: admin 503 (ei konfiguroitu), yhteydenotto- ja tiedustelulomake 500.
- Korjaus `8af5cf4`: yksi yksityinen säilö, kuvat reitin /api/media kautta (vain kohteiden kuvat sallittu), Blob tunnistetaan myös BLOB_STORE_ID:stä, sisältö palaa repon oletukseen Blob-häiriössä.
- Todennettu: 61 testiä, next start rikkinäisellä Blobilla (sivut 200, 5 läpäisyyritystä 404), admin-full 21/21, tuotanto 200 + kuvareitin suojaus 404.
- **Odottaa Valtteria** (sähköposti 14.9. klo 13.31): yksityinen Blob-säilö, ADMIN_PASSWORD, ADMIN_SESSION_TOKEN, NEXT_PUBLIC_SITE_URL, Redeploy. Sen jälkeen: kirjaudu, tallenna yksi teksti ja hinta, lähetä testilomake, tarkista että säilyvät.

## Julkaisutila (todennettu 2026-09-09, päivitetty 13.9.)
- **Uusi tuotanto-osoite `tahkonvillat-pi.vercel.app`** (vanha `tahkonvillat.vercel.app` yhä 402). Projekti on nyt käynnissä.
- Vercel-projekti **on olemassa Valtterin tilillä** (`valtteri-s-projects`), kytketty repoon. Push mainiin laukaisee tuotantobuildin automaattisesti. 9.9. build onnistui (`85f98c0`).
- `tahkonvillat.vercel.app` vastaa **402** → projekti on pysäytetty (maksu tai kuluraja). Mitään ei näy ulospäin.
- `tahkonvillat.fi` on yhä **tyhjä LiteSpeed-hakemistolistaus** Domainhotellilla, ei Next-sivusto.
- Admin ei ole koskaan ajossa Blob-tallennuksella. Ensimmäinen oikea testi tehtävä heti kun projekti avataan.

## Vaihe 2 käynnissä 28.10.2026 (Miki)
- Pyyntö: oma CMS kokonaan pois → Payload CMS; layoutin parannus; sivu tuntuu hitaalta.
- ✓ Nopeus `582c8c9`: oma kursori pois (piilotti järjestelmän hiiren), sisältö näkyy heti (reveal vain näkymän alapuolelle, 500–700 ms), latauspalkki sivusiirtoihin. Mitattu: villasivulla 0 piilotettua sisältöelementtiä latauksessa (ennen 3), kursori-elementit 0. Palvelin vastasi jo ennen 0,2–0,6 s — hitaus oli animaatioissa.
- ⏳ Payload-suunnitelma: `docs/superpowers/plans/2026-10-28-payload-cms.md`.
- iCal-linkit saatu 28.10. (Henri Antikainen → Miki):
  - ✓ kaikki 6 sivuston kalenteria kytketty paikallisesti (`data/ical-sources.json`, gitignore): Puolukka, Karpalo, Teituli A (`47064939`), B (`47068801`), 8A, 8B. Todennettu `next start`: jokainen avain `status: ok`, varauksia 5–16 per yksikkö.
  - Lisäksi saatu Tintintaival 6A (`1199826378507869635`) ja 6B (`47070530`): eri Airbnb-ilmoituksia, joita sivustolla ei ole → kysyttävä, lisätäänkö kohteiksi.
  - Tuotantoon linkit syötetään Payload-adminissa (Task 5), ei gittiin.

## Päätökset
- 2026-09-09 Nykyinen admin + iframe-esikatselu, ei Sanitya (Miki).
- 2026-09-09 Sovellus Verceliin, tahkonvillat.fi DNS Domainhotellilta Verceliin (Miki).
- 2026-09-09 Commitit 4W33-identiteetillä tässä repossa (Miki). Push tehty 9.9. Mikin luvalla.
- 2026-09-09 Kalenteri vain villoille (asunnoilla ei omaa sivua).
- 2026-09-09 vitest 3.x (vitest 5 vaatii @types/node 22, projekti on 20).
- 2026-09-09 Teitulin yksiköt samalla Gantt-rivillä (tunnus palkissa).
- 2026-09-09 Vaakatunnus on HTML-ladottu ja kytkeytyy päälle vasta tekstittömästä merkistä.
- 2026-09-09 Tallennustasot yhdessä tiedostossa (`access-policy.ts`), testi estää eriytymisen.

## Odottaa asiakkaalta / Valtterilta
- [ ] **Airbnb iCal -linkit ×6** (Puolukka, Karpalo, Teituli A/B/8A/8B). Asiakkaalle oma ohje: `docs/Tahkon-Villat-Airbnb-kalenteriohje.pdf`. Asiakas hakee linkit itse — **emme pyydä Airbnb-tunnuksia**.
- [ ] **Logon tekstitön merkki** → `public/images/logo-mark-plain.png`, sitten `markPlainAvailable: true` site.configiin. Lisäksi uusi Nanobanana-viimeistelty tunnus jos tulee.
- [ ] **Resend**: API-avain (`.env.local` + Vercel) ja tahkonvillat.fi SPF/DKIM Domainhotellin DNS:ään.
- [ ] **Vercel-projektin avaaminen** Valtterin tilillä (402 = pysäytetty).
- [ ] **Päätös hostingista** asiakkaan kanssa: Domainhotelli ei pyöritä Next-sovellusta.

## Vaihe 2 (ei aloitettu)
- Vercel: env-muuttujat (`NEXT_PUBLIC_SITE_URL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_TOKEN`, `BLOB_READ_WRITE_TOKEN`, `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TO`) + `npm run storage:seed`
- **Ensimmäinen Blob-savutesti**: tallenna adminissa teksti, hinta ja iCal-linkki → lataa sivu uudelleen → arvot säilyvät. Tämä on ainoa tapa todentaa blob-korjaus oikeasti.
- DNS tahkonvillat.fi → Vercel; Resend-domain verifiointi
- iCal-URL-rajaus tunnettuihin domaineihin (code review MEDIUM 1)
- Loppukatselmus asiakkaan kanssa + `/delivery-check` → laskutus

## Kehitysmuistiinpanot
- **Buildin jälkeen aina** `node scripts/check-trace.mjs` — varmistaa että data/ on funktioissa.
- Dev: `ADMIN_PASSWORD=novo-dev-test npm run dev -- -p 3311` (paikallinen testisalasana, ei koske `.env.local`).
- Todisteet: `PLAYWRIGHT_BROWSERS_PATH=%LOCALAPPDATA%\ms-playwright node scripts/evidence.mjs <admin-ical|admin-pricing|pricing-e2e|villa|home|pages|admin-preview|logo|contact-e2e>`
- Opas: `node scripts/admin-guide-pdf.mjs` (palvelin käynnissä)
- `pricing-e2e` ja `contact-e2e` kirjoittavat `data/`-tiedostoihin → `git checkout -- data/` ajon jälkeen.
