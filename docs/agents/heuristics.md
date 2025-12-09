# Heuristics

*Lessons learned and recurring patterns. Timestamp new entries; expire anything older than 90 days.*

---

## TypeScript / Next.js

| Heuristic | Added |
|-----------|-------|
| Next.js 14 `searchParams` in page props is a `Promise` - must `await` before accessing | 2024-12-09 |
| Use HTML entities (`&larr;` not `<-`) in JSX to avoid parse errors | 2024-12-09 |
| Supabase JS v2 `.order()` does not support `nullsLast` option - use `nullsFirst` or omit | 2024-12-09 |
| Add explicit type assertions for Supabase queries that infer `never` | 2024-12-09 |

---

## Supabase / Database

| Heuristic | Added |
|-----------|-------|
| Do NOT use Postgres ENUM types - use TEXT with CHECK constraints or app-level validation | 2024-12-09 |
| `shards` table uses INTEGER primary keys, not UUID | 2024-12-09 |
| Use Dollar Quoting (`$$text$$`) in SQL seed files to safely handle apostrophes | 2024-12-09 |

---

## Vercel / Deployment

| Heuristic | Added |
|-----------|-------|
| NO EDGE RUNTIME in Middleware - Supabase SSR uses WebSockets which crash Edge | 2024-12-09 |
| Auth checks belong in Server Components, not Middleware | 2024-12-09 |

---

## UI / Styling

| Heuristic | Added |
|-----------|-------|
| Always show skeleton loaders for async content - writing is emotional, UI must feel responsive | 2024-12-09 |
| Use Gold (`#c9a227`) sparingly - reserved for Canon elements | 2024-12-09 |
