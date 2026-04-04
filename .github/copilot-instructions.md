# AGENT.md

*Instructions for AI agents working on Everloop. Keep synced with `.github/copilot-instructions.md`.*

---

## 1. Project Overview

**Everloop** is a collaborative "Canon Engine"—a living, breathing storytelling platform.

- **Core Philosophy:** "Contemplative, High-Function, Elegant."
- **Core Loop:** Write (Draft) → Review (AI Analysis) → Publish (Canon) → Read (Library).
- **Core Narrative Purpose:** Everything in the Everloop bends toward the Shards — the broken remnants of the Anchors, scattered across every region in unknown numbers. All stories, quests, campaigns, characters, and creations ultimately advance, complicate, or illuminate the collective journey toward convergence. No one knows what happens when all Shards of a region are united, or what occurs if every Shard from every region is brought together. This mystery is the gravitational center of the entire platform. It should be felt, not stated — atmospheric, not didactic.
- **Core Monster Principle:** Monsters are not native to the Everloop. They appeared only after the Fray — the breaking of the world by the Rogue Architects. They are fragments of the Drift leaking through fractured reality: forms not bound by the Pattern, broken combinations of matter, memory, and intent. If a Monster appears, reality broke there for a reason — and that reason connects to a Shard or the Fray. Monsters are consequences, not random encounters.

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
| 3D Models | Meshy AI |
| Voice/Audio | ElevenLabs (TTS, Sound Effects) |
| Game Data | Open5E API + D&D 5e SRD API |
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

## 5. Before Starting Any Task

1. Read `docs/agents/heuristics.md` for lessons learned
2. Check `docs/agents/domain.md` for lore rules
3. Create task summary in `docs/agents/tasks/`

---

## 6. After Completing Any Task

1. Update task summary with pitfalls and decisions
2. Add stable facts to `docs/agents/domain.md`
3. Add heuristics to `docs/agents/heuristics.md`
4. If AGENT.md changes, sync to `.github/copilot-instructions.md`

---

## 7. Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build (validates types)
npm run lint     # ESLint
git push         # Deploy to Vercel
```
