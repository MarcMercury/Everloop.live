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
| 5 | Voice & Tone Analyzer | ✅ Complete | AI + readability metrics in split view |
| 6 | Story Templates | ✅ Complete | DB migration: `20251225_001_create_story_templates.sql` |
| 7 | Canon Entity Linker | ✅ Complete | Entity detection, linking, hover cards |
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

## Feature 5: Voice & Tone Analyzer ✅

**Completed Components:**
- `/lib/actions/voice-analyzer.ts` - AI analysis with OpenAI GPT-4o-mini
- `/lib/utils/readability.ts` - Flesch-Kincaid, Gunning Fog, sentence metrics
- `/components/editor/split-view/panels/voice-tone-panel.tsx` - Full analysis UI
- Updated `/components/editor/split-view/split-view-context.tsx` - Added 'voice' panel type
- Updated `/components/editor/split-view/split-view-container.tsx` - Voice tab + getText prop
- Updated `/app/write/[id]/write-client-story.tsx` - getText callback for analysis

**Features:**
- [x] AI-powered voice/tone analysis (contemplative, urgent, melancholic, etc.)
- [x] Readability metrics (Flesch-Kincaid Grade, Flesch Reading Ease, Gunning Fog)
- [x] Sentence length distribution with visual chart
- [x] Voice characteristics with strength percentages
- [x] Canon style fit score (how well it matches Everloop style)
- [x] Similar author/work comparisons
- [x] Writing strengths identification
- [x] Actionable improvement suggestions with priority levels
- [x] Collapsible sections for organized viewing
- [x] Re-analyze button for updated content

---

## Feature 6: Story Templates ✅

**Completed Components:**
- `/supabase/migrations/20251225_001_create_story_templates.sql` - Table, RLS, seed data
- `/types/database.ts` - StoryTemplate, StoryTemplateInsert, StoryTemplateUpdate types
- `/lib/actions/templates.ts` - CRUD operations for templates
- `/components/template-picker.tsx` - Template selection UI with preview modal
- Updated `/components/new-story-modal.tsx` - Two-step flow (scope → template)
- Updated `/lib/actions/story.ts` - createDraftStory accepts template content

**Database Table:**
- `story_templates` - Template storage with system/user types, scope, featured flag
- `increment_template_use_count()` - RPC for tracking usage

**Pre-seeded System Templates (7):**
- **Scenes:** "Moment of Decision", "Chance Encounter", "The Revelation"
- **Tales:** "The Journey Begins", "Mystery Unfolds"
- **Tomes:** "Epic Saga Outline", "Chronicle Template"

**Features:**
- [x] System templates (featured, pre-built starting points)
- [x] User templates (save your own)
- [x] Template picker in new story flow
- [x] Template preview modal with full content
- [x] "Blank Canvas" option for fresh starts
- [x] Create template from existing story
- [x] Template use count tracking
- [x] Scope-specific templates (scenes, tales, tomes)

---

## Feature 7: Canon Entity Linker ✅

**Completed Components:**
- `/components/editor/extensions/entity-link.ts` - TipTap mark extension for entity links
- `/lib/actions/entity-linker.ts` - Server actions for detection and search
- `/components/editor/entity-linker/entity-hover-card.tsx` - Hover cards with lazy-loading
- `/components/editor/entity-linker/entity-link-popover.tsx` - Manual linking popover
- `/components/editor/split-view/panels/entity-link-panel.tsx` - Auto-detection panel
- Updated `/components/editor/tiptap-editor.tsx` - EntityLink extension + toolbar button
- Updated `/components/editor/split-view/split-view-container.tsx` - Entities tab

**Features:**
- [x] Scan text for known entity names (word boundary matching)
- [x] Highlight linked entities with type-specific colors
- [x] One-click entity linking from auto-detection
- [x] Entity hover cards with lazy-loaded details
- [x] Manual linking via toolbar (select text → click Link icon)
- [x] Search entities while linking
- [x] Color-coded entity types (character, location, artifact, event, faction, concept, creature)
- [x] "Link All" button for batch linking
- [x] Keyboard navigation in search results

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
