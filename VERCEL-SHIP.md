# Vercel — 10 min ship checklist

Local `vendor-chunks` / `Cannot find module` errors are **OneDrive + dev cache** — not Vercel.  
Vercel builds in a clean cloud environment. Follow this exactly.

## 1. Push code to GitHub

```powershell
cd c:\Users\mikis\OneDrive\Tiedostot\villasivut
git add .
git commit -m "Ready for Vercel demo"
git push
```

(No `.env.local` in git — it's ignored.)

## 2. Create Vercel project

1. [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Framework: **Next.js** (auto-detected)
4. **Do not deploy yet** — add env vars first

## 3. Environment variables (Production)

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://YOUR-PROJECT.vercel.app` (update after first deploy) |
| `ADMIN_PASSWORD` | Strong password you give the client |
| `ADMIN_SESSION_TOKEN` | Random 48+ chars — **not** `tahkon-villat-admin-session-2026` |
| `BLOB_READ_WRITE_TOKEN` | From Vercel → Storage → Blob → Create store → token |

Generate token (PowerShell):

```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 48 | ForEach-Object { [char]$_ })
```

## 4. Enable Blob storage

Vercel project → **Storage** → **Blob** → Create  
Copy `BLOB_READ_WRITE_TOKEN` into env vars → **Redeploy**

## 5. Deploy

Click **Deploy**. Build command: `npm run build` (cleans cache automatically).

If build fails: check env vars are set for **Production** environment.

## 6. Seed content (once, from your PC)

```powershell
cd c:\Users\mikis\OneDrive\Tiedostot\villasivut
$env:BLOB_READ_WRITE_TOKEN="vercel_blob_rw_xxxxx"
npm run storage:seed
```

Uploads JSON, messages, and all property images to Blob.

## 7. Smoke test live URL

- `/` — home with villas + apartments
- `/villat/villa-puolukka`
- `/admin/login` — login works
- Admin → save a text change → refresh public page

## 8. Update site URL (optional)

After custom domain: set `NEXT_PUBLIC_SITE_URL=https://tahkonvillat.fi` → redeploy.

---

## Local testing (OneDrive causes dev errors)

`vendor-chunks` / `Cannot find module` in **`npm run dev`** = OneDrive corrupting `.next`.  
**This does NOT affect Vercel** (clean cloud build).

**Before deploy, test production build locally:**

```powershell
npm run preview
```

Opens **http://localhost:3000** — same as Vercel production.

For editing: `npm run dev:clean` — never run `build` while dev is running.

## Resend (later)

Add when ready:

- `RESEND_API_KEY`
- `EMAIL_FROM`

Forms work without these — messages save to admin inbox.
