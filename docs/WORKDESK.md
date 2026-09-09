# WORKDESK — Tahkon Villat

Päivitetty: 2026-09-09 · Vastuu: Novo Media (Miki + Walter) · Asiakas: Tahkon Villat
Haara: `vaihe1-viimeistely` (mergetään mainiin kun vaihe 1 on verifioitu)

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
- 2026-09-09 vitest 3.x (vitest 5 vaatii @types/node 22, projekti on 20).

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
