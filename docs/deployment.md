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

