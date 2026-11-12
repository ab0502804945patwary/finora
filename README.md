# Finora — main site + eVerify

One Next.js app serves both:

- `finoraca.com` → company site (`src/app/page.tsx`) and admin panel at `/admin` (`src/app/admin/*`)
- `everify.finoraca.com` → public document verification portal (`src/app/v/*`); never serves the admin

`src/middleware.ts` routes by host name. Business details live in `src/lib/config.ts`.

## Run locally

```bash
npm install
npm run dev
```

- Main site: http://localhost:3000
- Verify portal: http://everify.localhost:3000
- Admin: http://localhost:3000/admin (password = `ADMIN_PASSWORD` in `.env.local`)

Local data is stored in `./data` (SQLite file `local.db` + stamped PDFs in `files/`). Delete the folder to reset.

## How issuing works

1. Admin uploads the final PDF and fills company / dates.
2. Server generates a UUID, stamps a QR code (→ `everify.finoraca.com/audit/<id>`) + ID on the PDF.
3. SHA-256 of the **stamped** PDF is saved with the record. Send the client the stamped PDF from the document page.
4. Anyone can scan the QR, enter the ID, or drop the PDF on the verify page (hashed in the browser, never uploaded).
5. Admin can revoke / restore a document; the public page reflects it.

## Deploy later (Vercel)

1. Supabase SQL Editor → run `supabase/schema.sql` once (creates the locked `documents` table).
2. Supabase → Storage → New bucket (e.g. `documents`, **private**, public access off) → set `SUPABASE_URL` (Project Settings → API), `SUPABASE_SERVICE_ROLE_KEY` (same page, keep secret) and `SUPABASE_BUCKET`. Cloudflare R2 also works instead via the `R2_*` variables.
3. Set `ADMIN_PASSWORD`, `SESSION_SECRET`, `NEXT_PUBLIC_SITE_URL=https://finoraca.com`, `NEXT_PUBLIC_VERIFY_URL=https://everify.finoraca.com`.
4. Add domains `finoraca.com`, `www.finoraca.com`, `everify.finoraca.com` to the Vercel project.
5. Namecheap → Advanced DNS: `A @ 76.76.21.21`, `CNAME www cname.vercel-dns.com`, `CNAME everify cname.vercel-dns.com` (use the exact values Vercel shows).

Limit: PDF upload max 4 MB (Vercel request body limit).
