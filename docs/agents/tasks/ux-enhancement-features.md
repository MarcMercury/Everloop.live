# UX Enhancement Features - Development Tracker

*Task created: December 22, 2025*

---

## Overview

Comprehensive writing suite enhancements for medium-to-advanced writers. Goal: "Contemplative, High-Function, Elegant" writing experience.

---

## Feature Status

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Split View Editor | ✅ Complete | Lore browser, story reader, notes panels |
| 2 | Chapter Manager | ✅ Complete | DB migration: `20251222_001_create_story_chapters.sql` |
| 3 | Inline Comments | ✅ Complete | DB migration: `20251223_001_create_story_comments.sql` |
| 4 | Writing Stats Dashboard | ✅ Complete | DB migration: `20251224_001_create_writing_stats.sql` |
| 5 | Voice & Tone Analyzer | ⏳ Pending | - |
| 6 | Story Templates | ⏳ Pending | - |
| 7 | Canon Entity Linker | ⏳ Pending | - |
| 8 | Living Archive | ⏳ Pending | - |
| 9 | Collaborative Mode | ⏳ Pending | - |
| 10 | Export Suite | ⏳ Pending | - |
| 11 | Reading Mode | ⏳ Pending | - |
| 12 | Achievement System | ⏳ Pending | - |
| 13 | Auto-Save Indicators | ⏳ Pending | - |
| 14 | Distraction-Free Mode | ⏳ Pending | - |
| 15 | Mobile Writing | ⏳ Pending | - |

---

## Feature 1: Split View Editor ✅

**Completed Components:**
- `/components/editor/split-view/split-view-context.tsx` - State management, Cmd+\ toggle
- `/components/editor/split-view/resizable-panel.tsx` - Drag-to-resize
- `/components/editor/split-view/split-view-container.tsx` - Tab navigation
- `/components/editor/split-view/panels/lore-browser-panel.tsx` - Canon entity browser
- `/components/editor/split-view/panels/story-reader-panel.tsx` - Read canon stories
- `/components/editor/split-view/panels/notes-panel.tsx` - Auto-saving notes

**API Endpoints:**
- `/api/entities` - Fetch entities with filtering
- `/api/stories/canon` - Fetch canonical stories
- `/api/stories/[slug]/content` - Fetch story content

---

## Feature 2: Chapter Manager ✅

**Completed Components:**
- `/supabase/migrations/create_story_chapters.sql` - Full schema with RLS
- `/types/database.ts` - Chapter types added
- `/lib/actions/chapters.ts` - All CRUD operations
- `/components/editor/chapter-sidebar.tsx` - Drag-and-drop UI
- `/app/write/[id]/write-client-story.tsx` - Integration for Tomes
- `/components/editor/tiptap-editor.tsx` - Content sync on chapter switch

**Database Migration Required:**
```bash
supabase db push
```

---

## Feature 3: Inline Comments System ✅

**Completed Components:**
- `/supabase/migrations/create_story_comments.sql` - Full schema with RLS
- `/types/database.ts` - StoryComment, CommentType, related types added
- `/lib/actions/comments.ts` - All CRUD operations (create, reply, resolve, delete)
- `/components/editor/extensions/comment-mark.ts` - TipTap extension for highlighting
- `/components/editor/comments/comment-popover.tsx` - Create/view comments popover
- `/components/editor/comments/comments-sidebar.tsx` - List all comments with filters
- `/components/editor/tiptap-editor.tsx` - Integrated comment toolbar and popover
- `/app/write/[id]/write-client-story.tsx` - Comments sidebar toggle

**Features:**
- Select text and add comments (notes, suggestions, questions, issues)
- Private vs public comments
- Comment threading with replies
- Resolve/unresolve comments
- Filter by type and status
- Click comment to scroll to position
- Comment highlighting in editor

---

## Feature 4: Writing Stats Dashboard ✅

**Completed Components:**
- `/supabase/migrations/20251224_001_create_writing_stats.sql` - Tables + RLS
- `/types/database.ts` - WritingSession, DailyWritingStats, WritingGoals types
- `/lib/actions/writing-stats.ts` - Server actions for session tracking
- `/lib/utils/writing-stats.ts` - Formatting utilities
- `/components/dashboard/writing-stats-card.tsx` - Full dashboard UI
- `/app/api/end-session/route.ts` - Reliable session ending API
- `/app/write/[id]/write-client-story.tsx` - Session integration

**Database Tables:**
- `writing_sessions` - Individual writing session tracking
- `daily_writing_stats` - Daily aggregation with story breakdown
- `writing_goals` - User goals and streak tracking

**Features:**
- [x] Track words written per session
- [x] Time spent writing
- [x] Session start/end timestamps
- [x] Daily/weekly/monthly word counts
- [x] Writing streak tracker (current + longest)
- [x] Activity heatmap (30-day visualization)
- [x] Goal progress visualization
- [x] Configurable daily/weekly/monthly goals
- [x] Reliable session ending on page close (sendBeacon)
- [x] Periodic word count updates (30s interval)

---

## Feature 5: Voice & Tone Analyzer

**Phase 5.1: Analysis Engine**
- [ ] Integrate with OpenAI for style analysis
- [ ] Readability metrics (Flesch-Kincaid, etc.)
- [ ] Sentence length distribution

**Phase 5.2: Feedback UI**
- [ ] Real-time tone indicators
- [ ] Suggestions panel
- [ ] Historical comparison

---

## Feature 6: Story Templates

**Phase 6.1: Template Storage**
- [ ] Create `story_templates` table
- [ ] System templates vs user templates

**Phase 6.2: Template UI**
- [ ] Template picker in new story flow
- [ ] Template preview
- [ ] Create template from existing story

---

## Feature 7: Canon Entity Linker

**Phase 7.1: Entity Detection**
- [ ] Scan text for known entity names
- [ ] Highlight potential matches

**Phase 7.2: Linking UI**
- [ ] One-click entity linking
- [ ] Entity hover cards
- [ ] Auto-suggest while typing

---

## Feature 8: Living Archive

**Phase 8.1: Version History**
- [ ] Store story revisions
- [ ] Diff viewer between versions

**Phase 8.2: Alternate Timelines**
- [ ] Branch stories into variants
- [ ] Timeline visualization

---

## Feature 9: Collaborative Mode

**Phase 9.1: Real-time Sync**
- [ ] WebSocket integration
- [ ] Cursor presence indicators

**Phase 9.2: Permissions**
- [ ] Invite collaborators
- [ ] Role-based access (viewer, editor, co-author)

---

## Feature 10: Export Suite

- [ ] Export to PDF with styling
- [ ] Export to EPUB
- [ ] Export to Markdown
- [ ] Export to plain text
- [ ] Batch export (all chapters)

---

## Feature 11: Reading Mode

- [ ] Toggle to reading view
- [ ] Adjustable typography
- [ ] Night mode / sepia mode
- [ ] Estimated reading time

---

## Feature 12: Achievement System

- [ ] Define achievements (word milestones, streaks, etc.)
- [ ] Track progress
- [ ] Achievement unlock notifications
- [ ] Profile badge display

---

## Feature 13: Auto-Save Indicators

- [ ] Visual save status (saving/saved/error)
- [ ] Last saved timestamp
- [ ] Conflict detection

---

## Feature 14: Distraction-Free Mode

- [ ] Hide all UI except editor
- [ ] Typewriter scrolling (current line centered)
- [ ] Focus mode (dim paragraphs except current)
- [ ] Ambient sound options

---

## Feature 15: Mobile Writing

- [ ] Responsive editor layout
- [ ] Touch-friendly toolbar
- [ ] Swipe gestures for navigation
- [ ] PWA support

---

## Heuristics Learned

1. **TipTap content prop changes** - Need useEffect to sync when content prop updates externally (e.g., chapter switching)
2. **Server action exports** - Must explicitly re-export types from server action files for client imports
3. **Component prop destructuring** - Always ensure all interface props are destructured in function signature

---

## Related Files

- `docs/agents/domain.md` - Lore rules
- `docs/agents/heuristics.md` - Lessons learned
- `AGENT.md` - Project conventions
