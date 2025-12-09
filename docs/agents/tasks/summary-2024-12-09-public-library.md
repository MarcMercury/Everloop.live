## What changed

### Task: Build the Public Library

Created three new public pages for reading approved stories:

1. **`/stories` (Library Grid)**
   - Filters to `canon_status IN ('canon', 'canonical')` and `is_published = true`
   - Displays story cards with title, author, word count, 20-word snippet
   - Search bar filters by title or author name
   - Responsive 1-2-3 column grid

2. **`/stories/[slug]` (Reader View)**
   - Immersive reading experience with Crimson Text (serif) body
   - Narrow `max-w-prose` column for optimal readability
   - Dark/navy theme matching site aesthetic
   - Header: Title, author avatar/link, published date, word count, reading time
   - Lore Sidebar: Shows canon entities referenced in the story (`referenced_entities` array)

3. **`/profile/[username]` (Author Profile)**
   - Public profile page showing bio and avatar
   - Stats: Canon stories count, total words written, canon entities created
   - List of all approved stories with snippets and reading time
   - "Edit Profile" button visible only to profile owner

### Files Modified
- `app/stories/page.tsx` - Rebuilt library grid with search
- `app/stories/[slug]/page.tsx` - New reader view with lore sidebar
- `app/profile/[username]/page.tsx` - Public author profile
- `app/globals.css` - Added `.font-crimson` utility class
- `lib/utils.ts` - Added `CANON_STORY_STATUSES` constant
- `app/api/admin/check/route.ts` - Fixed TS type assertions
- `app/api/admin/hydrate/route.ts` - Fixed TS type assertions

---

## Commands that worked (build/test/run)

```bash
npm run build          # Validates all TS types and Next.js compilation
git add -A && git commit -m "..."
git push origin main   # Triggers Vercel deployment
```

---

## Pitfalls - fixes

| Pitfall | Fix |
|---------|-----|
| `searchParams` in Next.js 14 is a Promise | Changed type to `Promise<{ search?: string }>` and awaited it |
| `<-` in JSX parsed as less-than operator | Use `&larr;` HTML entity instead |
| `nullsLast` not in Supabase JS v2 types | Removed; rely on default null ordering |
| Admin routes returning `never` type | Added explicit type assertions for profile queries |

---

## Decisions - why

1. **Server Components for all pages** - SEO/performance; stories should be indexable
2. **`referenced_entities` over text matching** - Uses the existing array column in `stories` table rather than parsing content for entity names
3. **Shared `CANON_STORY_STATUSES` constant** - Single source of truth for filtering canon stories across pages
4. **`font-crimson` utility class** - Allows explicit Crimson Text usage in reader body without affecting prose defaults

---

## Heuristics (keep terse)

- Next.js 14 `searchParams` is a Promise in page props - must await
- Use HTML entities (`&larr;` not `<-`) in JSX to avoid parse errors
- Supabase JS v2 `order()` doesn't support `nullsLast` - use `nullsFirst` or omit
- Always add explicit type assertions for Supabase queries returning `never`

---

## Reflection

The public library creates a clean reading experience that matches Everloop's contemplative aesthetic. The lore sidebar adds context without being intrusive. Key architectural choice was keeping everything in Server Components for SEO - stories are the public face of the platform and need to be indexable.

Next logical step: Connect the story submission flow to reference entities during writing, so the `referenced_entities` array gets populated automatically.
