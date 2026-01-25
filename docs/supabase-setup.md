# Supabase Setup

This project uses Supabase with a public anon key only (no auth).

## 1) Create a Supabase project

1. Create a project at https://supabase.com
2. Note your **Project URL** and **anon public** key

## 2) Create tables

Run the schema in Supabase SQL Editor:

- `supabase/schema.sql`

## 3) Configure env vars

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Restart the dev server after editing env vars.

## Troubleshooting

- `Missing Supabase env`: check `.env.local` and restart `npm run dev`.
- RLS errors: confirm policies were created by `supabase/schema.sql`.

