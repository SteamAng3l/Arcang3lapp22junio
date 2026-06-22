# Versículos para tu Alma

A Spanish-language web app where a person writes how they feel and receives a relevant Bible verse from the public-domain Reina-Valera 1909 translation.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/versiculos run dev` — run the frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Frontend: React + Vite + Tailwind CSS + Framer Motion

## Where things live

- DB schema: `lib/db/src/schema/verses.ts`
- API contract: `lib/api-spec/openapi.yaml`
- Generated hooks: `lib/api-client-react/src/generated/`
- Generated Zod schemas: `lib/api-zod/src/generated/`
- API routes: `artifacts/api-server/src/routes/verses.ts`
- Category detection logic: `artifacts/api-server/src/lib/verse-categories.ts`
- Frontend: `artifacts/versiculos/src/`

## Architecture decisions

- Category detection uses keyword matching against the user's free-text input; defaults to "esperanza" if no category matched.
- Verses are from the Reina-Valera 1909 (public domain). 24 verses seeded across 8 categories.
- All API contracts are defined in OpenAPI first; hooks and Zod schemas are generated from it.
- The `/api/verse/random` endpoint lets users get a verse without entering text.
- Categories endpoint returns labels, slugs, and verse counts for the categories page.

## Product

- **Home page** (`/`): User writes how they feel, clicks "Buscar versículo", receives a categorized verse with a supportive message. A "Versículo aleatorio" button also available.
- **Categories page** (`/categorias`): Shows all 8 emotional categories (anxiety, fear, sadness, loneliness, forgiveness, hope, strength, wisdom) with verse counts. Clicking a category shows a verse for that emotion.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After any OpenAPI spec change, run `pnpm --filter @workspace/api-spec run codegen` before editing routes or frontend.
- Category detection is order-sensitive — first match wins.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
