# Agent Guide (book-receipt)
This repository is a Next.js (App Router) + TypeScript + Tailwind CSS v4 web app that generates "book rental receipts" and logs anonymous aggregate stats to Supabase.

## Quick Facts
- Runtime: Next.js 16 (App Router) + React 19
- Language: TypeScript (`strict: true`)
- Styling: Tailwind CSS v4 via `@tailwindcss/postcss`
- Data: Supabase (public anon key only; no auth)
- Package manager: npm (`package-lock.json` present)

## Build / Lint / Test Commands

### Install
```bash
npm ci
```

### Run locally
```bash
npm run dev
```

### Production
```bash
npm run build
npm run start
```

### Lint
```bash
npm run lint
npm run lint -- --fix
```

### Run a single check (fast iteration)
- Lint one file:
```bash
npx eslint src/app/api/search/route.ts
```
- Typecheck only:
```bash
npx tsc -p tsconfig.json --noEmit
```

### Tests / single test
- No test runner is configured (`npm test` is not defined) and there are no `__tests__` / `*.test.*` files.
- Use `npm run lint`, `npx tsc --noEmit`, and `npm run build` as the effective "test suite".
- If you add a test framework, add scripts like `test` / `test:watch`, and document single-test execution here.

## Environment Variables
Copy `env.example` to `.env.local` and fill:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET` (server route `src/app/api/search/route.ts`)
- `NEXT_PUBLIC_GA_ID` (optional)

Notes:
- Never commit secrets; `.env*` is ignored via `.gitignore`.
- Only variables prefixed with `NEXT_PUBLIC_` are safe to reference from Client Components.

## Repo Layout
- `src/app/*`: App Router routes (Server Components by default)
- `src/app/api/*/route.ts`: route handlers (server-only)
- `src/components/*`: UI components
- `src/lib/*`: shared utilities (e.g. `src/lib/supabaseClient.ts`)
- `supabase/schema.sql`: schema + RPC (`get_stats`)
- `docs/*`: setup/deployment guides

## Code Style Guidelines

### Formatting
- Double quotes, semicolons.
- Prefer trailing commas in multiline objects/arrays/calls (matches existing files).
- No Prettier config in this repo; rely on ESLint + TypeScript.

### Imports
Group imports in this order:
1. React/Next built-ins (`react`, `next/*`)
2. Third-party (`@supabase/supabase-js`, etc.)
3. Aliases (`@/…`) - `@/*` maps to `src/*`
4. Relative (`./…`, `../…`)
5. Side-effects last (`import "./globals.css";`)

Prefer `import type { ... }` for type-only imports (see `src/app/layout.tsx`).

### TypeScript
- `tsconfig.json` is `strict`; avoid `any`.
- Prefer `type` aliases for object/union types.
- Model external payloads separately (e.g. Naver API response types vs internal types).
- Use `Record<K, V>` for simple maps.

### Naming
- Components: `PascalCase`; pages as `export default function PageName()`.
- Variables/functions: `camelCase`.
- Constants: `UPPER_SNAKE_CASE` for true constants; `const fooBar` for config.
- DB keys: `snake_case` (e.g. `published_at`, `cover_url`); UI state/props: `camelCase`.

### React / Next.js
- Use Server Components by default; add `"use client"` only when needed.
- Keep secrets / private APIs in route handlers (never in Client Components).
- Route handlers export `GET`/`POST` and return `NextResponse.json(...)`.
- Set explicit caching in server `fetch` calls (use `cache: "no-store"` for fresh results).

### Tailwind / CSS
- Tailwind-first styling.
- Inline styles only for truly dynamic values (e.g. runtime widths/colors).
- Keep globals in `src/app/globals.css`; avoid new global CSS unless necessary.

### Supabase
- Client: use the singleton from `src/lib/supabaseClient.ts` (no auth; `persistSession: false`).
- Server: route handlers create clients using env vars.
- Never use a Supabase service role key in the browser.
- Log detailed errors to server console, but keep client-facing messages minimal.

### Error Handling & API Responses
- Validate inputs early; return 400 for user mistakes.
- Return 500 for server failures; avoid leaking sensitive details.
- Use top-level `try/catch` in route handlers; `console.error("<stable prefix>", err)`.
- Prefer a consistent JSON shape when practical (e.g. `{ ok: boolean, ... }`).

## Tooling Notes
- ESLint: `eslint.config.mjs` extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`.
- Ignores: `eslint.config.mjs` overrides default ignores via `globalIgnores([".next/**", ...])`.

## Cursor / Copilot Instructions
- No Cursor rules found (`.cursor/rules/` and `.cursorrules` absent).
- No Copilot instructions found (`.github/copilot-instructions.md` absent).

## Working Practices
- Keep diffs small and focused; avoid drive-by reformatting.
- Preserve existing UI look (warm paper-like palette, Tailwind utilities).
- Do not commit generated artifacts (`.next/`, `out/`, `build/`) or `.env*`.
- Before PR: `npm run lint` + `npm run build` (and `npx tsc --noEmit` for type-heavy changes).

## Commit Message Convention
- Format: `type: Korean description` (Commit type in English, description in Korean)
- Example: `fix: 00수정`, `feat: 새로운 기능 추가`
