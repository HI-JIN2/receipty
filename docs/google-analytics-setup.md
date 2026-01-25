# Google Analytics

This project supports GA4 via `NEXT_PUBLIC_GA_ID`.

## Setup

1. Create a GA4 property at https://analytics.google.com
2. Copy the Measurement ID (format: `G-XXXXXXXXXX`)
3. Set the env var

```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

For Vercel, add the same env var in Project → Settings → Environment Variables.

## Verify

- GA Realtime report should show visits after a few seconds/minutes.

