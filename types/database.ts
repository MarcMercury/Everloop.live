/**
 * Database Types for Everloop
 * 
 * These types are manually defined to match the schema.
 * Run `npm run db:types` to regenerate from Supabase.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Enum types
export type UserRole = 'writer' | 'curator' | 'lorekeeper' | 'admin'
export type CanonEntityType = 'character' | 'location' | 'artifact' | 'event' | 'faction' | 'concept' | 'creature'
export type CanonStatus = 'draft' | 'proposed' | 'canonical' | 'deprecated' | 'contested'
export type ShardState = 'dormant' | 'awakening' | 'active' | 'corrupted' | 'shattered' | 'transcended'
export type StoryCanonStatus = 'draft' | 'submitted' | 'under_review' | 'revision_requested' | 'approved' | 'rejected' | 'canonical'
export type StoryScope = 'tome' | 'tale' | 'scene'
export type ChapterStatus = 'draft' | 'in_progress' | 'complete' | 'revision'

// Chapter type for Tomes
export interface Chapter {
  id: string
  story_id: string
  title: string
  content: Json
  content_text: string | null
  word_count: number
  word_target: number
  summary: string | null
  status: ChapterStatus
  chapter_order: number
  created_at: string
  updated_at: string
}

export interface ChapterInsert {
  id?: string
  story_id: string
  title?: string
  content?: Json
  content_text?: string | null
  word_count?: number
  word_target?: number
  summary?: string | null
  status?: ChapterStatus
  chapter_order: number
}

export interface ChapterUpdate {
  title?: string
  content?: Json
  content_text?: string | null
  word_count?: number
  word_target?: number
  summary?: string | null
  status?: ChapterStatus
  chapter_order?: number
}

// Comment types for inline annotations
export type CommentType = 'note' | 'suggestion' | 'question' | 'issue'

export interface StoryComment {
  id: string
  story_id: string
  chapter_id: string | null
  user_id: string
  content: string
  comment_type: CommentType
  position_start: number
  position_end: number
  selected_text: string | null
  thread_id: string | null
  parent_id: string | null
  is_private: boolean
  is_resolved: boolean
  resolved_at: string | null
  resolved_by: string | null
  created_at: string
  updated_at: string
}

export interface StoryCommentInsert {
  id?: string
  story_id: string
  chapter_id?: string | null
  user_id?: string // Will be set by server
  content: string
  comment_type?: CommentType
  position_start: number
  position_end: number
  selected_text?: string | null
  thread_id?: string | null
  parent_id?: string | null
  is_private?: boolean
}

export interface StoryCommentUpdate {
  content?: string
  comment_type?: CommentType
  is_private?: boolean
  is_resolved?: boolean
  resolved_at?: string | null
  resolved_by?: string | null
}

// Writing Stats types
export interface WritingSession {
  id: string
  user_id: string
  story_id: string | null
  chapter_id: string | null
  started_at: string
  ended_at: string | null
  duration_seconds: number
  words_at_start: number
  words_at_end: number
  words_written: number
  is_active: boolean
  created_at: string
}

export interface WritingSessionInsert {
  id?: string
  user_id?: string // Set by server
  story_id?: string | null
  chapter_id?: string | null
  started_at?: string
  words_at_start?: number
  is_active?: boolean
}

export interface WritingSessionUpdate {
  ended_at?: string
  duration_seconds?: number
  words_at_end?: number
  is_active?: boolean
}

export interface DailyWritingStats {
  id: string
  user_id: string
  date: string
  total_words: number
  total_sessions: number
  total_duration_seconds: number
  stories_worked_on: { story_id: string; title: string; words: number }[]
  daily_goal: number
  goal_met: boolean
  created_at: string
  updated_at: string
}

export interface WritingGoals {
  id: string
  user_id: string
  daily_word_goal: number
  weekly_word_goal: number
  monthly_word_goal: number
  current_streak: number
  longest_streak: number
  last_writing_date: string | null
  created_at: string
  updated_at: string
}

export interface WritingStatsSummary {
  total_words: number
  total_sessions: number
  total_duration_seconds: number
  avg_words_per_day: number
  avg_session_duration_seconds: number
  current_streak: number
  longest_streak: number
  days_with_writing: number
}

// Story Template types
export type TemplateType = 'system' | 'user'

export interface StoryTemplate {
  id: string
  name: string
  description: string | null
  scope: StoryScope
  template_type: TemplateType
  created_by: string | null
  initial_content: Json | null
  suggested_title: string | null
  chapter_outline: Json | null
  tags: string[]
  genre: string | null
  estimated_words: number | null
  use_count: number
  is_public: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
}

export interface StoryTemplateInsert {
  name: string
  description?: string | null
  scope: StoryScope
  template_type?: TemplateType
  created_by?: string | null
  initial_content?: Json | null
  suggested_title?: string | null
  chapter_outline?: Json | null
  tags?: string[]
  genre?: string | null
  estimated_words?: number | null
  is_public?: boolean
}

export interface StoryTemplateUpdate {
  name?: string
  description?: string | null
  initial_content?: Json | null
  suggested_title?: string | null
  chapter_outline?: Json | null
  tags?: string[]
  genre?: string | null
  estimated_words?: number | null
  is_public?: boolean
}

// Revision types for Living Archive
export type RevisionType = 'auto' | 'manual' | 'submit' | 'publish'

export interface StoryRevision {
  id: string
  story_id: string
  chapter_id: string | null
  revision_number: number
  revision_type: RevisionType
  title: string
  content: Json
  content_text: string | null
  word_count: number
  change_summary: string | null
  words_added: number
  words_removed: number
  created_by: string
  created_at: string
}

export interface StoryRevisionInsert {
  story_id: string
  chapter_id?: string | null
  revision_type?: RevisionType
  title: string
  content: Json
  content_text?: string | null
  word_count?: number
  change_summary?: string | null
  words_added?: number
  words_removed?: number
}

// Collaborator types for Collaborative Mode
export type CollaboratorRole = 'viewer' | 'commenter' | 'editor' | 'co_author'
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired'

export interface StoryCollaborator {
  id: string
  story_id: string
  user_id: string
  role: CollaboratorRole
  invited_by: string | null
  invited_at: string
  accepted_at: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  // Joined data
  user?: {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
  }
}

export interface StoryCollaboratorInsert {
  story_id: string
  user_id: string
  role?: CollaboratorRole
  invited_by?: string
  is_active?: boolean
}

export interface StoryInvitation {
  id: string
  story_id: string
  email: string
  role: CollaboratorRole
  invited_by: string
  message: string | null
  token: string
  status: InvitationStatus
  created_at: string
  expires_at: string
  accepted_at: string | null
  // Joined data
  story?: {
    id: string
    title: string
    slug: string
    author?: {
      username: string
      display_name: string | null
    }
  }
}

export interface StoryInvitationInsert {
  story_id: string
  email: string
  role?: CollaboratorRole
  invited_by: string
  message?: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          role: UserRole
          is_admin: boolean
          reputation_score: number
          trust_score: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          role?: UserRole
          is_admin?: boolean
          reputation_score?: number
          trust_score?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          role?: UserRole
          is_admin?: boolean
          reputation_score?: number
          trust_score?: number
          created_at?: string
          updated_at?: string
        }
      }
      canon_entities: {
        Row: {
          id: string
          name: string
          slug: string
          type: string // TEXT in DB, not constrained enum
          description: string | null
          extended_lore: Json
          stability_rating: number
          status: string // TEXT in DB with default 'draft'
          created_by: string | null
          approved_by: string | null
          embedding: number[] | null
          tags: string[]
          related_entities: string[]
          metadata: Json
          created_at: string
          updated_at: string
          is_canon: boolean
          is_private: boolean
        }
        Insert: {
          id?: string
          name: string
          slug: string
          type: string
          description?: string | null
          extended_lore?: Json
          stability_rating?: number
          status?: string
          created_by?: string | null
          approved_by?: string | null
          embedding?: number[] | null
          tags?: string[]
          related_entities?: string[]
          metadata?: Json
          created_at?: string
          updated_at?: string
          is_canon?: boolean
          is_private?: boolean
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          type?: string
          description?: string | null
          extended_lore?: Json
          stability_rating?: number
          status?: string
          created_by?: string | null
          approved_by?: string | null
          embedding?: number[] | null
          tags?: string[]
          related_entities?: string[]
          metadata?: Json
          created_at?: string
          updated_at?: string
          is_canon?: boolean
          is_private?: boolean
        }
      }
      shards: {
        Row: {
          id: string
          name: string
          description: string | null
          power_description: string | null
          current_holder_id: string | null
          location_id: string | null
          state: ShardState
          power_level: number
          history: Json
          visual_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          power_description?: string | null
          current_holder_id?: string | null
          location_id?: string | null
          state?: ShardState
          power_level?: number
          history?: Json
          visual_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          power_description?: string | null
          current_holder_id?: string | null
          location_id?: string | null
          state?: ShardState
          power_level?: number
          history?: Json
          visual_description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      stories: {
        Row: {
          id: string
          title: string
          slug: string
          summary: string | null
          content: Json
          content_text: string | null
          word_count: number
          author_id: string
          canon_status: StoryCanonStatus
          scope: StoryScope
          ai_review_notes: Json
          ai_consistency_score: number | null
          referenced_entities: string[]
          referenced_shards: string[]
          tags: string[]
          is_published: boolean
          published_at: string | null
          reading_time_minutes: number | null
          view_count: number
          like_count: number
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          summary?: string | null
          content?: Json
          content_text?: string | null
          word_count?: number
          author_id: string
          canon_status?: StoryCanonStatus
          scope?: StoryScope
          ai_review_notes?: Json
          ai_consistency_score?: number | null
          referenced_entities?: string[]
          referenced_shards?: string[]
          tags?: string[]
          is_published?: boolean
          published_at?: string | null
          reading_time_minutes?: number | null
          view_count?: number
          like_count?: number
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          summary?: string | null
          content?: Json
          content_text?: string | null
          word_count?: number
          author_id?: string
          canon_status?: StoryCanonStatus
          scope?: StoryScope
          ai_review_notes?: Json
          ai_consistency_score?: number | null
          referenced_entities?: string[]
          referenced_shards?: string[]
          tags?: string[]
          is_published?: boolean
          published_at?: string | null
          reading_time_minutes?: number | null
          view_count?: number
          like_count?: number
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      story_reviews: {
        Row: {
          id: string
          story_id: string
          reviewer_id: string | null
          is_ai_review: boolean
          canon_consistency_score: number | null
          quality_score: number | null
          feedback: string | null
          suggestions: Json
          flagged_issues: Json
          decision: 'approve' | 'request_revision' | 'reject' | null
          created_at: string
        }
        Insert: {
          id?: string
          story_id: string
          reviewer_id?: string | null
          is_ai_review?: boolean
          canon_consistency_score?: number | null
          quality_score?: number | null
          feedback?: string | null
          suggestions?: Json
          flagged_issues?: Json
          decision?: 'approve' | 'request_revision' | 'reject' | null
          created_at?: string
        }
        Update: {
          id?: string
          story_id?: string
          reviewer_id?: string | null
          is_ai_review?: boolean
          canon_consistency_score?: number | null
          quality_score?: number | null
          feedback?: string | null
          suggestions?: Json
          flagged_issues?: Json
          decision?: 'approve' | 'request_revision' | 'reject' | null
          created_at?: string
        }
      }
      story_chapters: {
        Row: {
          id: string
          story_id: string
          title: string
          content: Json
          content_text: string | null
          word_count: number
          word_target: number
          summary: string | null
          status: ChapterStatus
          chapter_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          story_id: string
          title?: string
          content?: Json
          content_text?: string | null
          word_count?: number
          word_target?: number
          summary?: string | null
          status?: ChapterStatus
          chapter_order: number
        }
        Update: {
          id?: string
          story_id?: string
          title?: string
          content?: Json
          content_text?: string | null
          word_count?: number
          word_target?: number
          summary?: string | null
          status?: ChapterStatus
          chapter_order?: number
        }
      }
      story_comments: {
        Row: {
          id: string
          story_id: string
          chapter_id: string | null
          user_id: string
          content: string
          comment_type: CommentType
          position_start: number
          position_end: number
          selected_text: string | null
          thread_id: string | null
          parent_id: string | null
          is_private: boolean
          is_resolved: boolean
          resolved_at: string | null
          resolved_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          story_id: string
          chapter_id?: string | null
          user_id: string
          content: string
          comment_type?: CommentType
          position_start: number
          position_end: number
          selected_text?: string | null
          thread_id?: string | null
          parent_id?: string | null
          is_private?: boolean
          is_resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          story_id?: string
          chapter_id?: string | null
          user_id?: string
          content?: string
          comment_type?: CommentType
          position_start?: number
          position_end?: number
          selected_text?: string | null
          thread_id?: string | null
          parent_id?: string | null
          is_private?: boolean
          is_resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_canon_entities: {
        Args: {
          query_embedding: number[]
          match_threshold: number
          match_count: number
        }
        Returns: {
          id: string
          name: string
          type: string
          description: string
          status: string
          similarity: number
        }[]
      }
    }
    Enums: {
      canon_entity_type: CanonEntityType
      canon_status: CanonStatus
      shard_state: ShardState
      story_canon_status: StoryCanonStatus
    }
  }
}

// Helper types for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row']
export type CanonEntity = Database['public']['Tables']['canon_entities']['Row']
export type Shard = Database['public']['Tables']['shards']['Row']
export type Story = Database['public']['Tables']['stories']['Row']
export type StoryReview = Database['public']['Tables']['story_reviews']['Row']

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type CanonEntityInsert = Database['public']['Tables']['canon_entities']['Insert']
export type ShardInsert = Database['public']['Tables']['shards']['Insert']
export type StoryInsert = Database['public']['Tables']['stories']['Insert']
export type StoryReviewInsert = Database['public']['Tables']['story_reviews']['Insert']

// Update types
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type CanonEntityUpdate = Database['public']['Tables']['canon_entities']['Update']
export type ShardUpdate = Database['public']['Tables']['shards']['Update']
export type StoryUpdate = Database['public']['Tables']['stories']['Update']
export type StoryReviewUpdate = Database['public']['Tables']['story_reviews']['Update']
