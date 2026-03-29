# Deployment (Vercel)

## Deploy

1. Vercel Dashboard → **Add New → Project**
2. Import this GitHub repo
3. Set **Environment Variables**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`
   - `NEXT_PUBLIC_GA_ID` (optional)
4. Deploy

## Custom Domain

Vercel Project → **Settings → Domains**

Typical DNS records:

- Apex domain (`@`): `A 76.76.21.21`
- `www`: `CNAME cname.vercel-dns.com`

## Troubleshooting

- Build fails: verify env vars and run `npm run build` locally.
- API errors: check Vercel **Functions** logs.

## Keep Supabase Awake (GitHub Actions)

Supabase free projects can pause after inactivity. This repo includes a tiny keepalive endpoint and a scheduled GitHub Action that pings it about once every 5 days.

1. Vercel Project → **Settings → Environment Variables**
   - Add `KEEPALIVE_TOKEN` (random string)
2. GitHub repo → **Settings → Secrets and variables → Actions**
   - Add `KEEPALIVE_URL` (example: `https://YOUR_DOMAIN/api/keepalive?token=YOUR_TOKEN`)
3. GitHub repo → **Actions**
   - Ensure workflows are enabled (you can also run it manually via `workflow_dispatch`)
