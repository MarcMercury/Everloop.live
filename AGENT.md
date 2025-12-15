# AGENT.md

*Instructions for AI agents working on Everloop. Keep synced with `.github/copilot-instructions.md`.*

---

## 1. Project Overview

**Everloop** is a collaborative "Canon Engine"—a living, breathing storytelling platform.

- **Core Philosophy:** "Contemplative, High-Function, Elegant."
- **Core Loop:** Write (Draft) → Review (AI Analysis) → Publish (Canon) → Read (Library).

---

## 2. Tech Stack (Immutable)

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (Strict) |
| Database | Supabase (PostgreSQL + pgvector) |
| Auth | Supabase Auth (SSR) |
| Styling | Tailwind CSS + Shadcn/UI |
| AI | OpenAI via Vercel AI SDK |
| Deployment | Vercel |

---

## 3. Folder Structure

```
app/          # Next.js App Router (pages, layouts, API routes)
components/   # React components (ui/ for Shadcn, editor/ for TipTap)
lib/          # Utilities, Server Actions (actions/), Supabase clients
supabase/     # SQL migrations and seed files
docs/agents/  # AI Memory (tasks, heuristics, domain)
types/        # TypeScript interfaces (database.ts)
```

---

## 4. Critical Rules

1. **Server Components by default** - Use for SEO and performance
2. **No Edge Runtime in Middleware** - Supabase SSR crashes on Edge
3. **Auth checks in Server Components** - Not Middleware
4. **All mutations via Server Actions** - In `lib/actions/`
5. **Never fail silently** - Return structured error objects

---

## 5. Architecture Rules (RLS & Auth)

### 5.1 Admin Permission Check Pattern
```typescript
// ✅ CORRECT: Use RPC function that bypasses RLS
const { data: isAdmin } = await supabase.rpc('is_admin_check')
if (!isAdmin) return { success: false, error: 'Admin required' }

// ❌ WRONG: Direct table query (blocked by RLS)
const { data } = await supabase.from('profiles').select('is_admin')
```

### 5.2 RLS Policy Requirements
Every table MUST have these policies for admin access:
```sql
CREATE POLICY "Admins have full read access" ON table FOR SELECT USING (public.is_admin_check() = true);
CREATE POLICY "Admins have full update access" ON table FOR UPDATE USING (public.is_admin_check() = true);
CREATE POLICY "Admins have full delete access" ON table FOR DELETE USING (public.is_admin_check() = true);
```

### 5.3 Error Handling Pattern
```typescript
// ✅ CORRECT: Check both data and error
const { data, error } = await supabase.from('stories').select()
if (error) {
  console.error('[FunctionName] Query failed:', error.message, error.code)
  throw new Error(`Database error: ${error.message}`)
}
if (!data) {
  return [] // Explicitly handle empty result
}

// ❌ WRONG: Silent failure
const { data } = await supabase.from('stories').select()
return data || [] // Hides RLS errors!
```

### 5.4 Type Safety
- `types/database.ts` MUST match actual DB schema
- Run audit when adding columns: compare DB vs TypeScript
- `canon_entities.type` and `canon_entities.status` are TEXT, not enums

---

## 6. Before Starting Any Task

1. Read `docs/agents/heuristics.md` for lessons learned
2. Check `docs/agents/domain.md` for lore rules
3. Create task summary in `docs/agents/tasks/`

---

## 7. After Completing Any Task

1. Update task summary with pitfalls and decisions
2. Add stable facts to `docs/agents/domain.md`
3. Add heuristics to `docs/agents/heuristics.md`
4. If AGENT.md changes, sync to `.github/copilot-instructions.md`

---

## 8. Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build (validates types)
npm run lint     # ESLint
git push         # Deploy to Vercel

# Database queries (via Management API)
./scripts/db-query.sh "SELECT * FROM stories LIMIT 5"
```

---

## 9. Scar Tissue (Lessons Learned)

| Date | Issue | Fix | Prevention |
|------|-------|-----|------------|
| 2024-12 | RLS blocking admin queries | Created `is_admin_check()` function | Always use RPC for permission checks |
| 2024-12 | Service role key not bypassing RLS | Use Management API for direct SQL | Service role still respects RLS on REST API |
| 2024-12 | TypeScript types missing DB columns | Added `is_canon`, `is_private`, `trust_score` | Audit types vs schema regularly |
| 2024-12 | `verifyAdminAccess` bypassed (`return true`) | Fixed to use `is_admin_check()` RPC | Never hardcode auth bypasses |
