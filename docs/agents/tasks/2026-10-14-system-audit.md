# System Review & Code Audit — October 2026

**Date:** 2026-10-14
**Scope:** Full-repo health check (security, deps, types, lint, architecture, tooling, integrations)
**Status:** Implemented (2026-10-14 → 2026-10-16) — see *Resolution* below. Migrations 20261014_001/002 applied to production 2026-10-16.

---

## Health Snapshot

| Check | Result |
|-------|--------|
| `tsc --noEmit` | ✅ Passes — but `lib/actions/quests.ts` (1,334 lines) has `// @ts-nocheck` |
| `eslint .` | ❌ 210 errors / 25 warnings (163 unused vars, 19 `<img>`, 15 `any`, 7 rules-of-hooks) |
| `npm audit --omit=dev` | ❌ 45 vulns: 1 critical (next), 12 high, 28 moderate, 4 low |
| Tests | ❌ None (0 test files) |
| CI | ❌ No `.github/workflows` — Vercel build is the only gate |
| Size | ~88k LOC TS/TSX; 63 pages, 49 API routes, 30 action modules, 83 migrations |

---

## Findings

### Security

| # | Sev | Location | Issue | Recommendation |
|---|-----|----------|-------|----------------|
| S1 | Critical | `next@14.2.33` | Multiple RSC DoS / self-host advisories; 14.x line is end-of-life | Bump to `14.2.35` now; plan migration to Next 15/16 + React 19 |
| S2 | High | `prosemirror-view`, `@tiptap/*` 2.x | Paste-handling XSS; `mergeAttributes` `__proto__` issue | `npm audit fix` for prosemirror; schedule TipTap 3 upgrade |
| S3 | Medium | `quest_scenes.dm_notes`, `quest_npcs.secrets`, `quests.secret_info` | RLS is row-level only — accepted players can `select('*')` DM-only columns with the public anon key; `/api/quests/[id]/print` also renders them for any member | Move DM-only fields to a DM-only table or expose player-facing views; restrict print route to `dm_id` |
| S4 | Medium | AI/paid routes (OpenAI, Gemini, Meshy, ElevenLabs) | Auth-gated but no per-user rate limit or quota (only `admin/hydrate` has one) | Add Upstash Ratelimit (or a Postgres usage table) keyed by `user.id` |
| S5 | Medium | `lib/actions/shards.ts` `getShards/getShard/getShardStats` | Exported server actions read with service-role client with no auth gate (currently unused) | Gate with `gateShardAdmin()` or delete |
| S6 | Low | `lib/supabase/server.ts` | Service-role factory has no `import 'server-only'` guard | Add `server-only` to modules touching `SUPABASE_SERVICE_ROLE_KEY` |
| S7 | Low | `next.config.mjs` | No security headers (CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy) | Add `headers()` config |
| S8 | Low | `/api/media/freesound/search` | Unauthenticated proxy using server API key | Require auth or cache aggressively |
| S9 | Low | Quest actions `updateScene`, `changeScene`, `createNpc` | Rely solely on RLS (policies are correct) | Add explicit `assertDmOfQuest()` for defense-in-depth + clear errors |

### Code Quality / Correctness

- `// @ts-nocheck` in `lib/actions/quests.ts` hides real type errors in the most critical gameplay module.
- 146 `as never` casts → `types/database.ts` is stale. Run `npm run db:types` and remove casts.
- Server actions named `useIdol`, `useTemplate`, `useSpellSlot`, `useFeature`, `useAmmo` trip `rules-of-hooks`. Rename to `spendIdol`, `applyTemplate`, `consumeSpellSlot`, etc.
- Mega-components (2–3k lines): `character-forge.tsx`, `everloop-map.tsx`, `character-sheet.tsx`, `monster-quest-wizard.tsx`. Split by tab/step.
- 36 `alert()`/`confirm()` calls → replace with a Shadcn toast (sonner) + AlertDialog.
- No `sitemap.ts` / `robots.ts` despite SEO-focused public routes.

### Repo Hygiene

- `public/` = 460 MB (346 MB maps) committed directly to git; `vercel.json` enables LFS but `.gitattributes` is empty. Move to Supabase Storage/Vercel Blob or track with LFS.
- Raw extraction dumps (`public/story*_raw.txt`, `story1_nolayout.txt`) and `*.sql.bak` files are publicly served / tracked.
- `.env.example` missing `GEMINI_API_KEY`/`GOOGLE_API_KEY`/`GOOGLE_GENERATIVE_AI_API_KEY`, `STABILITY_API_KEY`, `LORE_AGENT_DISCOVERY`; lists `RESEND_API_KEY` which no code uses.
- AI model IDs are hard-coded in ~30 places (`gpt-4o-mini` ×15, deprecated `gemini-2.0-*-exp`, `imagen-3.0`). Centralize in a `lib/ai/models.ts`.

---

## Pitfalls & Decisions

- The quest rename migration (`20260522000000_quest_rename.sql`) has been applied; code uses `quest_*` tables exclusively. Heuristics updated accordingly.
- Most `rules-of-hooks` lint errors are false positives from naming, not real hook misuse.

---

## Resolution (2026-10-16)

| Check | Audit | Now |
|-------|-------|-----|
| `tsc --noEmit` | ✅ with `@ts-nocheck` | ✅ no `@ts-nocheck` |
| `eslint .` | ❌ 210 errors / 25 warnings | ✅ 0 problems |
| `npm audit --omit=dev` | ❌ 45 vulns | ✅ 0 |
| Tests | ❌ none | ✅ 37 (Vitest, `tests/unit/`) |
| CI | ❌ none | ✅ `.github/workflows/ci.yml` (lint, typecheck, test, build, audit) |
| `public/` | 460 MB in git | 3 MB; media in Supabase Storage `site-assets` |

| Finding | Resolution |
|---------|------------|
| S1/S2 deps | Next 16, React 19, TipTap 3, Tailwind 4, AI SDK 7 |
| S3 DM secrets | Migration `20261014_001` (column grants + `get_quest_dm_secrets()` RPC); print route DM-only; app falls back gracefully until applied |
| S4 rate limits | Migration `20261014_002` + `lib/rate-limit.ts` (in-memory fallback until applied) |
| S5–S9 | Shard reads admin-gated, `server-only` guards, security headers, Freesound auth, explicit DM asserts |
| `as never` / `@ts-nocheck` | 146 → 4 casts; nocheck removed; `use*` server actions renamed |
| Mega-components | Split into `character-forge-parts/`, `everloop-map-parts/`, `monster-quest-wizard-parts/` (entry files 316 / 30 / 121 lines) |
| `alert()`/`confirm()` | sonner toasts + `confirmDialog()` |
| SEO | `app/sitemap.ts`, `app/robots.ts` |
| AI model IDs | `lib/ai/models.ts`; deprecated `gemini-2.0-*-exp` / `imagen-3.0` removed — Gemini image fallbacks now `gemini-3.1-flash-image`, `gemini-3-pro-image`, `gemini-2.5-flash-image` (verified against the production key's model list) |
| Repo hygiene | Raw story dumps → `docs/lore/source-text/`, `.sql.bak` → `supabase/archive/`, `.env.example` complete; media moved to Storage (`lib/assets.ts`, legacy URLs 308-redirect); git history rewritten to drop old media blobs |

### Pitfalls & decisions (implementation)

- Supabase Storage on this project caps objects at 50 MB; `bellroot-vale.glb` (83 MB) was meshopt-compressed to 25 MB.
- The region `.glb` models (`model3dPath`) are currently unused by the UI; kept in Storage.
- `public/audio/library/*` referenced by `lib/media/sound-libraries.ts` never existed — placeholders, unchanged.
- Four `react-hooks/set-state-in-effect` suppressions remain, all for post-mount `localStorage` restores (avoids hydration mismatch).
- Migrations require `SUPABASE_ACCESS_TOKEN` (service-role key cannot run DDL). Applied 2026-10-16 via `npm run db:migrate`; verified anon/authenticated lack SELECT on `dm_notes`/`secrets` and both RPCs are `authenticated`-only.
