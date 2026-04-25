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
| Lazy-initialize OpenAI clients (use getter function) to avoid build-time credential errors | 2024-12-30 |
| When querying Supabase columns, ensure they actually exist in schema - e.g., `genre` was in templates but not stories | 2024-12-30 |

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
| User data persists across deployments - Supabase is external database, code deploys don't affect stored data | 2024-12-30 |
| Entity status workflow: draft → proposed → canonical (RLS enforces users can only edit their own drafts) | 2024-12-30 |

---

## Vercel / Deployment

| Heuristic | Added |
|-----------|-------|
| NO EDGE RUNTIME in Middleware - Supabase SSR uses WebSockets which crash Edge | 2024-12-09 |
| Auth checks belong in Server Components, not Middleware | 2024-12-09 |
| Vercel deployments only update code - database (Supabase) remains unchanged, user data is preserved | 2024-12-30 |
| Run migrations via Supabase Dashboard or CLI, NOT during Vercel deploy | 2024-12-30 |

---

## UI / Styling

| Heuristic | Added |
|-----------|-------|
| Always show skeleton loaders for async content - writing is emotional, UI must feel responsive | 2024-12-09 |
| Use Gold (`#c9a227`) sparingly - reserved for Canon elements | 2024-12-09 |

---

## Data Flow / Actions

| Heuristic | Added |
|-----------|-------|
| Entity form uses `extended_lore` JSONB for tagline, image_url - not separate columns | 2024-12-30 |
| Player Character schema uses many JSONB columns (`spellcasting`, `inventory`, `senses`, `damage_modifiers`, `feats`, `treasure`, `spell_sources`...) — extend by adding optional fields to interfaces & default constructors so old rows hydrate without migration headaches | 2026-04-25 |
| When extending the character form: keep 5 top-level tabs (Identity / Combat / Spells / Features / Gear) and add new cards inside existing tabs — adding tabs breaks mobile horizontal scroll | 2026-04-25 |
| Story scope (tome/tale/scene) determines if chapters table is used | 2024-12-30 |
| Always verify edit button links have corresponding handler code - edit params need to be read | 2024-12-30 |
| Table name is `story_chapters` NOT `chapters` - always verify `.from()` table names against schema | 2025-01 |
| Entity column name is `type` NOT `entity_type` - verify column names against schema.sql | 2025-01 |

---

## External APIs / Integrations

| Heuristic | Added |
|-----------|-------|
| ElevenLabs JS SDK uses camelCase params (`durationSeconds`) not snake_case (`duration_seconds`) | 2025-04 |
| `Buffer` is not a valid `Response` body in Next.js — wrap with `new Uint8Array(buffer)` | 2025-04 |
| Open5E SRD data is static — use `next: { revalidate: 86400 }` (24h cache) on fetch calls | 2025-04 |
| Open5E v2 endpoints use `key` not `slug` for resource identifiers | 2025-04 |
| dnd5eapi.co uses `index` (kebab-case) for resource IDs, e.g., `fire-bolt`, `chain-mail` | 2025-04 |
| All ElevenLabs/paid API routes MUST require auth to prevent cost abuse | 2025-04 |
| Combat tracker is stateless server-side — client passes full `combat_state` each request | 2025-04 |
| `DndCondition` type does NOT include 'exhaustion' — it's tracked via `CharacterStatus.exhaustion_level` | 2025-04 |
| All AI endpoints (analyze, refine, voice) MUST have auth checks to prevent OpenAI cost abuse | 2025-01 |
| Mutation actions need ownership checks: fetch resource → verify author_id/user_id === user.id | 2025-01 |
| `deleteStory` must cascade-delete all related tables (chapters, comments, revisions, collaborators, sessions, reviews) | 2025-01 |
| `useSearchParams()` must be wrapped in a `<Suspense>` boundary (Next.js App Router requirement) | 2025-01 |
| Never send embedding arrays (1536 floats) to the browser - convert to boolean flags | 2025-01 |
| Use `createAdminClient()` when admin pages need to read other users' RLS-protected data | 2025-01 |
| Admin pages that approve/reject must `revalidatePath` on public-facing pages (/stories, /explore) | 2025-01 |
| Hardcoded tokens in scripts must use env vars ($SUPABASE_MANAGEMENT_TOKEN) even if gitignored | 2025-01 |
| `dangerouslySetInnerHTML` must always escape user content before applying formatting | 2025-01 |
