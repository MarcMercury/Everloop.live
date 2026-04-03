# Everloop.live

A collaborative storytelling platform and living universe. Writers, players, and readers share a single canon — every story written, character created, and quest played shapes a world that is slowly unraveling.

## What It Is

Everloop is a "Canon Engine." Three pillars define how people interact with the world:

- **Explore** — Read canonical stories, browse the lore archive, and navigate an interactive 3D map of the Everloop.
- **Write** — Create characters, locations, creatures, and full stories. Submit them for canon review so they become part of the shared universe.
- **Play** — Build playable characters, run campaigns with an AI co-DM, and embark on solo or party quests in a world where reality is breaking down.

## The World

The Everloop is a world held together by the **Pattern**, a hidden structure woven by the First Architects. They became the **Anchors** to keep it stable — but the Anchors were shattered, and now the Pattern is thinning. **Hollows** erase what was. The **Fray** fractures what remains. The **Shards** of the Anchors can force reality to hold, but never without cost.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (Strict) |
| Database | Supabase (PostgreSQL + pgvector) |
| Auth | Supabase Auth (SSR) |
| Styling | Tailwind CSS + Shadcn/UI |
| AI | OpenAI via Vercel AI SDK |
| Deployment | Vercel |

## Getting Started

```bash
npm install
npm run dev       # Start dev server
npm run build     # Production build
npm run lint      # ESLint
```
