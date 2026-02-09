# Full Codebase Audit — January 2025

**Date:** 2025-01-25  
**Scope:** Complete codebase review and security audit  
**Status:** ✅ Complete — 30 fixes applied, build + lint clean

---

## Summary

Performed a comprehensive audit of the entire Everloop.live codebase (~80+ files). Identified 50+ issues across security, authorization, bugs, data integrity, and code quality. Applied 30 surgical fixes.

---

## Fixes Applied

### Security (P0)

| # | File | Issue | Fix |
|---|------|-------|-----|
| 1 | `middleware.ts` | Public pages (explore, stories, about, guide, profiles) were auth-gated, blocking SEO | Added public route matchers |
| 2 | `api/debug/stories/route.ts` | No auth — anyone could query debug data | Added auth + admin check |
| 3 | `api/debug/profile/route.ts` | No auth — leaked profile data | Added auth + admin gate |
| 4 | `api/admin/hydrate/route.ts` | Admin check was commented out "for testing" | Restored admin enforcement |
| 5 | `lib/actions/analyze.ts` | No auth on `analyzeStoryCanon` — OpenAI cost abuse vector | Added auth check |
| 6 | `lib/actions/refine.ts` | No auth on `refineStoryProse` — OpenAI cost abuse vector | Added Supabase import + auth check |
| 7 | `lib/actions/voice-analyzer.ts` | No auth on `analyzeVoiceTone` — OpenAI cost abuse vector | Added Supabase import + auth check |
| 8 | `auth/callback/route.ts` | Open redirect via `next` query param | Validate starts with `/`, not `//` |
| 9 | `components/editor/reading-mode/reading-mode.tsx` | XSS via `dangerouslySetInnerHTML` on user content | Added `escapeHtml()` before formatting |

### Authorization (P0)

| # | File | Issue | Fix |
|---|------|-------|-----|
| 10 | `lib/actions/chapters.ts` | Any user could update/delete any chapter | Added ownership verification (chapter → story → author_id check) |
| 11 | `lib/actions/comments.ts` | Any user could update/delete any comment | Added `.eq('user_id', user.id)` filter |
| 12 | `lib/actions/revisions.ts` | Any user could delete/restore/cleanup any revision | Added story ownership verification |
| 13 | `lib/actions/create.ts` | `deleteEntity` didn't verify ownership | Added existence + ownership check before delete |
| 14 | `lib/actions/debug.ts` | No admin check on debug functions | Added admin verification via `rpc('is_admin_check')` |

### Bugs (P1)

| # | File | Issue | Fix |
|---|------|-------|-----|
| 15 | `lib/actions/export.ts` | Used `from('chapters')` — table is `story_chapters` | Fixed two occurrences |
| 16 | `lib/actions/export.ts` | `exportChapter` used wrong FK in join query | Changed to separate queries |
| 17 | `lib/actions/debug.ts` | Used `entity_type` column — column is `type` | Fixed column name |
| 18 | `app/write/write-client.tsx` | Every save created a new draft (no ID tracking) | Added `savedStoryId` state, pass ID after first save |
| 19 | `components/editor/mobile/mobile-toolbar.tsx` | Heading 1 button silently failed (StarterKit only has levels 2, 3) | Changed to use levels 2, 3 |
| 20 | `app/login/page.tsx` | `useSearchParams()` without Suspense boundary | Wrapped in `<Suspense>` |

### Data Integrity (P1)

| # | File | Issue | Fix |
|---|------|-------|-----|
| 21 | `lib/actions/story.ts` | `deleteStory` only cleaned up reviews, orphaning chapters/comments/revisions/etc. | Added parallel cleanup of 6 related tables |
| 22 | `app/page.tsx` | Canon status filter only checked 'approved', not 'canonical' | Changed to `.in('canon_status', ['approved', 'canonical'])` |
| 23 | `api/stories/[slug]/content/route.ts` | Served content from non-canonical stories | Added canon status filter |
| 24 | `lib/actions/admin.ts` | Approve/reject didn't revalidate public pages | Added `revalidatePath` for `/stories` and `/explore` |
| 25 | `lib/actions/achievements.ts` | `markAchievementsNotified` with empty array caused undefined behavior | Added empty array guard |

### Code Quality (P2)

| # | File | Issue | Fix |
|---|------|-------|-----|
| 26 | `app/admin/entities/page.tsx` | Sent full 1536-dim embedding arrays to browser | Converted to `has_embedding: boolean` |
| 27 | `app/admin/review/[id]/page.tsx` | Used regular client (RLS blocks reading other users' stories) | Changed to `createAdminClient()` |
| 28 | `app/admin/page.tsx` | Author join was broken, showing "Unknown" | Restored `profiles!stories_author_id_fkey(username)` join |
| 29 | `types/database.ts` | Missing `is_admin_check` function type | Added to Functions interface |
| 30 | `scripts/*.py,sh` | Hardcoded Supabase management API token | Replaced with env var `SUPABASE_MANAGEMENT_TOKEN` |

---

## Pitfalls & Decisions

- ~6 tables used in actions (story_collaborators, story_revisions, writing_sessions, etc.) are missing from `types/database.ts` — requires `as never` casts throughout. A `db:types` regeneration would fix this.
- The debug/stories route had a variable name collision (`user` defined twice) that only surfaced during build — caught and fixed.
- Several components use `alert()`/`confirm()` instead of proper UI modals — not blocking but should be improved.
- Race condition on username uniqueness in signup is mitigated by DB unique constraint.

---

## Not Fixed (Lower Priority)

- No pagination on list endpoints (stories, entities, API routes)
- Duplicated utility functions (`extractTextFromContent`, `countWords`) in story.ts and revisions.ts
- `submitStoryById` title check is overly broad (rejects "Untitled Dreams")
- Some `useEffect` dependency array issues (stale closures) in editor components
- Inconsistent error return shapes across server actions
