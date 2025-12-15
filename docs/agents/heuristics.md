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
| Use `createAdminClient()` (service role) for server-side profile CRUD - RLS with `auth.uid()` fails in API routes | 2024-12-10 |
| "permission denied for table X" = table-level GRANT issue, not RLS policy issue - run `GRANT SELECT ON tablename TO anon, authenticated` | 2024-12-10 |
| Multiple FKs to same table (e.g. `created_by` + `approved_by` → profiles) require explicit FK hint: `profiles!canon_entities_created_by_fkey` | 2024-12-10 |
| Supabase RLS policies alone aren't enough - roles also need table-level GRANT permissions | 2024-12-10 |
| CANON_STORY_STATUSES in code must match database enum values exactly - check with `SELECT unnest(enum_range(NULL::enum_name))` | 2024-12-10 |

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
