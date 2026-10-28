# Vercel — julkaisun pikalista (Payload)

Tarkemmat perustelut ja vianetsintä: [DEPLOY.md](DEPLOY.md). Noudata järjestystä: vanhan datan export
ennen kuin vanha Blob-säilö irrotetaan.

## 1. Koodi GitHubiin

Push mainiin laukaisee Vercelin tuotantobuildin. **Ei pushia ilman Mikin lupaa** (ks. CLAUDE.md, tili `4W33`).
`.env.local` ei mene gitiin.

## 2. Vercel-projektin asetukset

- Projekti on jo olemassa Valtterin tilillä, kytketty repoon.
- Settings → **Node.js Version: 22.x tai 24.x** (Payload vaatii `^22.23.4 || >=24.22.1`).
- Build command tulee `vercel.json`ista: `npm run build:vercel` (= `payload migrate` vain tuotannossa + build). Älä ylikirjoita sitä asetuksissa.

## 3. Tietokanta: Neon

Storage / Marketplace → **Neon** → kytke projektiin → `DATABASE_URL` Production-ympäristöön.
Älä anna samaa `DATABASE_URL`ia Previewlle: preview ei migroi kantaa ja voi kaatua skeemamuutoksen jälkeen.

## 4. Vanha data talteen (omalla koneella)

```powershell
cd C:\Users\user\Documents\tahkonvillat
$env:BLOB_READ_WRITE_TOKEN="<vanhan YKSITYISEN säilön token>"
npm run cms:export-blob
```

→ `data/blob-export/` (gitignore).

## 5. Kuvat: uusi julkinen Blob-säilö

Storage → Blob → Create → taso **Public** → kytke projektiin → `BLOB_READ_WRITE_TOKEN`.
Irrota vanha yksityinen säilö projektista (sama muuttujanimi).

## 6. Muut ympäristömuuttujat (Production)

| Nimi | Arvo |
|------|------|
| `PAYLOAD_SECRET` | Satunnainen 48+ merkkiä |
| `NEXT_PUBLIC_SITE_URL` | `https://<projekti>.vercel.app` (päivitä domainin jälkeen) |
| `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TO` | Valinnaiset, myöhemmin |

Poista vanhat `ADMIN_PASSWORD` ja `ADMIN_SESSION_TOKEN`.

```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 48 | ForEach-Object { [char]$_ })
```

## 7. Deploy

**Redeploy**. Build ajaa migraatiot → taulut syntyvät Neoniin.

## 8. Ensimmäinen käyttäjä — heti

`https://<osoite>/admin` → **Luo ensimmäinen käyttäjä** (sähköposti + salasana). Tyhjään kantaan kuka tahansa voisi luoda sen.

## 9. Data Payloadiin (kerran, omalta koneelta)

```powershell
$env:DATABASE_URL="<Neonin DATABASE_URL>"
$env:PAYLOAD_SECRET="<tuotannon PAYLOAD_SECRET>"
$env:BLOB_READ_WRITE_TOKEN="<uuden JULKISEN säilön token>"
npm run cms:seed
```

Tulostaa yhteenvedon (luotu / päivitetty / ohitettu). Uudelleenajo ohittaa olemassa olevat kohteet; `-- --force` ylikirjoittaa ne.

## 10. Savutesti

- `/`, `/villat/villa-puolukka` (kuvat + Saatavuus-kalenteri), `/asunnot`
- `/admin` → kirjaudu → Sivuston tekstit → muuta yksi teksti → Tallenna → päivitä julkinen sivu
- Lähetä yhteydenottolomake → Viestit → Yhteydenotot

## 11. Domain (myöhemmin)

Oman domainin jälkeen `NEXT_PUBLIC_SITE_URL=https://tahkonvillat.fi` → Redeploy.

---

## Paikallinen testaus

```powershell
npm run db:dev        # oma terminaali
npm run preview       # tuotantobuild + next start, http://localhost:3000 (ei aja migraatioita)
```

Muokkaukseen `npm run dev:clean` — älä aja `build`ia kun dev pyörii. OneDriven `vendor-chunks` / `Cannot find module`
-virheet koskevat vain paikallista `.next`-välimuistia, eivät Verceliä.
