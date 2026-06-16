# Tahkon Villat — Vercel deployment

## Prerequisites

- Vercel project linked to this repo
- Domain `tahkonvillat.fi` (or staging `*.vercel.app`) configured in Vercel
- Resend optional for demo (forms still save to admin inbox)

## Environment variables (Production)

Set in **Vercel → Project → Settings → Environment Variables**:

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_SITE_URL` | Yes | `https://tahkonvillat.fi` or `https://your-project.vercel.app` |
| `ADMIN_PASSWORD` | Yes | Demo/client password for `/admin/login` |
| `ADMIN_SESSION_TOKEN` | Yes | Long random string — **not** `tahkon-villat-admin-session-2026` |
| `BLOB_READ_WRITE_TOKEN` | Yes | Vercel Blob (Storage tab) — required for admin saves |

Optional (add later):

| Variable | Notes |
|----------|-------|
| `RESEND_API_KEY` | Form email notifications |
| `EMAIL_FROM` | e.g. `Tahkon Villat <noreply@tahkonvillat.fi>` |

Generate session token (PowerShell):

```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 48 | ForEach-Object { [char]$_ })
```

## Pre-deploy (local)

```bash
npm run build
npm run content:messages   # ensures data/content/messages/*.json exists
```

## Deploy steps

1. **Push** to the branch Vercel deploys from.
2. Wait for **build** to succeed on Vercel.
3. **Enable Vercel Blob** on the project.
4. Add `BLOB_READ_WRITE_TOKEN` + other env vars → **Redeploy**.
5. **Seed Blob** from your machine:

   ```bash
   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxx npm run storage:seed
   ```

   Uploads: `data/*.json`, `data/content/*`, `data/content/messages/*`, property images.

6. **Verify live site:**

   | URL | Check |
   |-----|-------|
   | `/` | Home, hero image |
   | `/villat` | Villa listing + prices |
   | `/villat/villa-puolukka` | Gallery, inquiry form |
   | `/asunnot` | Apartments |
   | `/yhteystiedot` | Contact form |
   | `/faq` | FAQ |
   | `/tietosuoja` | Privacy |
   | `/admin/login` | Admin access |

7. **Admin smoke test:**
   - Edit home title in **Sivuston tekstit** → save → refresh `/` (change visible)
   - Edit a price in **Hinnat** → save → refresh `/villat`
   - Submit contact form → check **Yhteydenotot**

## Admin sections

| Section | Purpose |
|---------|---------|
| **Sivuston tekstit** | All site copy FI/EN |
| **Kohteet** | Images, texts, details per property |
| **Kalenteri** | Availability |
| **Hinnat** | Guide prices |
| **Varausehdotukset** / **Yhteydenotot** | Inbox |

See **ADMIN-GUIDE.md** for client-facing instructions (what is / isn't editable).

## Not editable in admin (by design)

- Contact email in footer (`site.config.ts`)
- Adding/removing properties
- New FAQ items (structure fixed in code)

## Local development

```bash
npm run dev:clean
```

Without `BLOB_READ_WRITE_TOKEN`, writes go to local `data/` and `public/images/`.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails on Vercel | `ADMIN_SESSION_TOKEN` must not be dev default |
| Admin login 503 | Set `ADMIN_PASSWORD` + unique `ADMIN_SESSION_TOKEN` |
| Admin saves fail | `BLOB_READ_WRITE_TOKEN` + redeploy + `storage:seed` |
| Stale content after save | Fixed: revalidation uses `/villat` not `/fi/villat` |
| Missing images in prod | Run `storage:seed` |
| Text save rejected | Structure must match template (no deleted keys) |

## DNS (production domain)

Point `tahkonvillat.fi` to Vercel. Add Resend DNS if using custom `EMAIL_FROM`.
