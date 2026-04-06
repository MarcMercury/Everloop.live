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
export type CanonEntityType = 'character' | 'location' | 'artifact' | 'event' | 'faction' | 'concept' | 'creature' | 'monster'
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
          last_sign_in_at: string | null
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
          last_sign_in_at?: string | null
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
          last_sign_in_at?: string | null
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
          shard_number: number | null
          description: string | null
          power_description: string | null
          current_holder_id: string | null
          location_id: string | null
          state: ShardState
          power_level: number
          history: Json
          visual_description: string | null
          form_state: string | null
          region: string | null
          site_types: string[]
          location_description: string | null
          expressions: string[]
          situations: string[]
          monster_link: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          shard_number?: number | null
          description?: string | null
          power_description?: string | null
          current_holder_id?: string | null
          location_id?: string | null
          state?: ShardState
          power_level?: number
          history?: Json
          visual_description?: string | null
          form_state?: string | null
          region?: string | null
          site_types?: string[]
          location_description?: string | null
          expressions?: string[]
          situations?: string[]
          monster_link?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          shard_number?: number | null
          description?: string | null
          power_description?: string | null
          current_holder_id?: string | null
          location_id?: string | null
          state?: ShardState
          power_level?: number
          history?: Json
          visual_description?: string | null
          form_state?: string | null
          region?: string | null
          site_types?: string[]
          location_description?: string | null
          expressions?: string[]
          situations?: string[]
          monster_link?: Json | null
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
      campaigns: {
        Row: {
          id: string
          title: string
          slug: string
          description: string | null
          cover_image_url: string | null
          dm_id: string
          game_mode: string
          status: string
          max_players: number
          is_public: boolean
          allow_spectators: boolean
          world_era: string
          fray_intensity: number
          referenced_entities: string[]
          referenced_shards: string[]
          settings: Json
          session_count: number
          total_play_time_minutes: number
          tags: string[]
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description?: string | null
          cover_image_url?: string | null
          dm_id: string
          game_mode?: string
          status?: string
          max_players?: number
          is_public?: boolean
          allow_spectators?: boolean
          world_era?: string
          fray_intensity?: number
          referenced_entities?: string[]
          referenced_shards?: string[]
          settings?: Json
          session_count?: number
          total_play_time_minutes?: number
          tags?: string[]
          metadata?: Json
        }
        Update: {
          title?: string
          slug?: string
          description?: string | null
          cover_image_url?: string | null
          dm_id?: string
          game_mode?: string
          status?: string
          max_players?: number
          is_public?: boolean
          allow_spectators?: boolean
          world_era?: string
          fray_intensity?: number
          referenced_entities?: string[]
          referenced_shards?: string[]
          settings?: Json
          session_count?: number
          total_play_time_minutes?: number
          tags?: string[]
          metadata?: Json
        }
      }
      campaign_players: {
        Row: {
          id: string
          campaign_id: string
          user_id: string
          character_id: string | null
          role: string
          status: string
          idols_held: number
          hidden_objectives: Json
          secret_info: Json
          sessions_attended: number
          total_rolls: number
          critical_hits: number
          critical_fails: number
          joined_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          user_id: string
          character_id?: string | null
          role?: string
          status?: string
          idols_held?: number
          hidden_objectives?: Json
          secret_info?: Json
          sessions_attended?: number
          total_rolls?: number
          critical_hits?: number
          critical_fails?: number
          joined_at?: string | null
        }
        Update: {
          character_id?: string | null
          role?: string
          status?: string
          idols_held?: number
          hidden_objectives?: Json
          secret_info?: Json
          sessions_attended?: number
          total_rolls?: number
          critical_hits?: number
          critical_fails?: number
          joined_at?: string | null
        }
      }
      campaign_scenes: {
        Row: {
          id: string
          campaign_id: string
          title: string
          description: string | null
          scene_order: number
          scene_type: string
          mood: string
          atmosphere: Json
          map_url: string | null
          map_data: Json
          fog_of_war: Json
          triggers: Json
          npcs: Json
          dm_notes: string | null
          narration: string | null
          status: string
          linked_entities: string[]
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          title: string
          description?: string | null
          scene_order?: number
          scene_type?: string
          mood?: string
          atmosphere?: Json
          map_url?: string | null
          map_data?: Json
          fog_of_war?: Json
          triggers?: Json
          npcs?: Json
          dm_notes?: string | null
          narration?: string | null
          status?: string
          linked_entities?: string[]
          metadata?: Json
        }
        Update: {
          title?: string
          description?: string | null
          scene_order?: number
          scene_type?: string
          mood?: string
          atmosphere?: Json
          map_url?: string | null
          map_data?: Json
          fog_of_war?: Json
          triggers?: Json
          npcs?: Json
          dm_notes?: string | null
          narration?: string | null
          status?: string
          linked_entities?: string[]
          metadata?: Json
        }
      }
      campaign_sessions: {
        Row: {
          id: string
          campaign_id: string
          session_number: number
          title: string | null
          status: string
          active_scene_id: string | null
          initiative_order: Json
          current_turn_index: number
          round_number: number
          is_combat: boolean
          fray_intensity: number
          started_at: string | null
          ended_at: string | null
          duration_minutes: number
          summary: string | null
          highlights: Json
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          session_number?: number
          title?: string | null
          status?: string
          active_scene_id?: string | null
          initiative_order?: Json
          current_turn_index?: number
          round_number?: number
          is_combat?: boolean
          fray_intensity?: number
          started_at?: string | null
          ended_at?: string | null
          duration_minutes?: number
          summary?: string | null
          highlights?: Json
          metadata?: Json
        }
        Update: {
          session_number?: number
          title?: string | null
          status?: string
          active_scene_id?: string | null
          initiative_order?: Json
          current_turn_index?: number
          round_number?: number
          is_combat?: boolean
          fray_intensity?: number
          started_at?: string | null
          ended_at?: string | null
          duration_minutes?: number
          summary?: string | null
          highlights?: Json
          metadata?: Json
        }
      }
      campaign_messages: {
        Row: {
          id: string
          session_id: string
          campaign_id: string
          sender_id: string | null
          message_type: string
          content: string
          visible_to: string[]
          roll_data: Json | null
          reference_data: Json | null
          character_name: string | null
          is_hidden: boolean
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          campaign_id: string
          sender_id?: string | null
          message_type?: string
          content: string
          visible_to?: string[]
          roll_data?: Json | null
          reference_data?: Json | null
          character_name?: string | null
          is_hidden?: boolean
        }
        Update: {
          message_type?: string
          content?: string
          visible_to?: string[]
          roll_data?: Json | null
          reference_data?: Json | null
          character_name?: string | null
          is_hidden?: boolean
        }
      }
      campaign_dice_rolls: {
        Row: {
          id: string
          session_id: string
          campaign_id: string
          player_id: string | null
          character_name: string | null
          roll_type: string
          dice_formula: string
          dice_results: number[]
          modifier: number
          total: number
          ability: string | null
          skill: string | null
          dc: number | null
          is_critical_hit: boolean
          is_critical_fail: boolean
          is_success: boolean | null
          is_secret: boolean
          advantage_type: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          campaign_id: string
          player_id?: string | null
          character_name?: string | null
          roll_type?: string
          dice_formula: string
          dice_results?: number[]
          modifier?: number
          total: number
          ability?: string | null
          skill?: string | null
          dc?: number | null
          is_critical_hit?: boolean
          is_critical_fail?: boolean
          is_success?: boolean | null
          is_secret?: boolean
          advantage_type?: string
          metadata?: Json
        }
        Update: {
          roll_type?: string
          dice_formula?: string
          dice_results?: number[]
          modifier?: number
          total?: number
          ability?: string | null
          skill?: string | null
          dc?: number | null
          is_critical_hit?: boolean
          is_critical_fail?: boolean
          is_success?: boolean | null
          is_secret?: boolean
          advantage_type?: string
          metadata?: Json
        }
      }
      narrative_idols: {
        Row: {
          id: string
          campaign_id: string
          holder_id: string | null
          name: string
          description: string | null
          visual: string | null
          idol_type: string
          power: string
          status: string
          earned_by: string | null
          earned_in_session: string | null
          used_in_session: string | null
          earned_reason: string | null
          used_effect: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          holder_id?: string | null
          name: string
          description?: string | null
          visual?: string | null
          idol_type?: string
          power: string
          status?: string
          earned_by?: string | null
          earned_in_session?: string | null
          used_in_session?: string | null
          earned_reason?: string | null
          used_effect?: string | null
        }
        Update: {
          holder_id?: string | null
          name?: string
          description?: string | null
          visual?: string | null
          idol_type?: string
          power?: string
          status?: string
          earned_by?: string | null
          earned_in_session?: string | null
          used_in_session?: string | null
          earned_reason?: string | null
          used_effect?: string | null
        }
      }
      campaign_npcs: {
        Row: {
          id: string
          campaign_id: string
          canon_entity_id: string | null
          name: string
          description: string | null
          portrait_url: string | null
          npc_type: string
          stats: Json
          personality: string | null
          voice_style: string | null
          motivations: string | null
          secrets: string | null
          is_alive: boolean
          is_visible: boolean
          current_scene_id: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          canon_entity_id?: string | null
          name: string
          description?: string | null
          portrait_url?: string | null
          npc_type?: string
          stats?: Json
          personality?: string | null
          voice_style?: string | null
          motivations?: string | null
          secrets?: string | null
          is_alive?: boolean
          is_visible?: boolean
          current_scene_id?: string | null
          metadata?: Json
        }
        Update: {
          canon_entity_id?: string | null
          name?: string
          description?: string | null
          portrait_url?: string | null
          npc_type?: string
          stats?: Json
          personality?: string | null
          voice_style?: string | null
          motivations?: string | null
          secrets?: string | null
          is_alive?: boolean
          is_visible?: boolean
          current_scene_id?: string | null
          metadata?: Json
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
      regional_state: {
        Row: {
          id: string
          region_id: string
          region_name: string
          fray_intensity: number
          stability_index: number
          shards_known: number
          shards_gathered: number
          hollow_count: number
          drift_breach_count: number
          active_campaigns: number
          active_quests: number
          canonical_stories: number
          last_shard_event: string | null
          last_fray_event: string | null
          metadata: Json
          updated_at: string
        }
        Insert: {
          id?: string
          region_id: string
          region_name: string
          fray_intensity?: number
          stability_index?: number
          shards_known?: number
          shards_gathered?: number
          hollow_count?: number
          drift_breach_count?: number
          active_campaigns?: number
          active_quests?: number
          canonical_stories?: number
          last_shard_event?: string | null
          last_fray_event?: string | null
          metadata?: Json
        }
        Update: {
          fray_intensity?: number
          stability_index?: number
          shards_known?: number
          shards_gathered?: number
          hollow_count?: number
          drift_breach_count?: number
          active_campaigns?: number
          active_quests?: number
          canonical_stories?: number
          last_shard_event?: string | null
          last_fray_event?: string | null
          metadata?: Json
        }
      }
      shard_events: {
        Row: {
          id: string
          shard_id: string | null
          event_type: string
          region_id: string | null
          actor_id: string | null
          campaign_id: string | null
          quest_id: string | null
          story_id: string | null
          description: string | null
          world_impact: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          shard_id?: string | null
          event_type: string
          region_id?: string | null
          actor_id?: string | null
          campaign_id?: string | null
          quest_id?: string | null
          story_id?: string | null
          description?: string | null
          world_impact?: string | null
          metadata?: Json
        }
        Update: {
          shard_id?: string | null
          event_type?: string
          region_id?: string | null
          description?: string | null
          world_impact?: string | null
          metadata?: Json
        }
      }
      world_events: {
        Row: {
          id: string
          title: string
          description: string | null
          event_type: string
          severity: string
          region_id: string | null
          source_campaign_id: string | null
          source_quest_id: string | null
          source_story_id: string | null
          affected_entities: string[]
          affected_shards: string[]
          world_state_changes: Json
          is_visible: boolean
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          event_type: string
          severity?: string
          region_id?: string | null
          source_campaign_id?: string | null
          source_quest_id?: string | null
          source_story_id?: string | null
          affected_entities?: string[]
          affected_shards?: string[]
          world_state_changes?: Json
          is_visible?: boolean
          created_by?: string | null
        }
        Update: {
          title?: string
          description?: string | null
          event_type?: string
          severity?: string
          region_id?: string | null
          affected_entities?: string[]
          affected_shards?: string[]
          world_state_changes?: Json
          is_visible?: boolean
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
      is_admin_check: {
        Args: Record<string, never>
        Returns: boolean
      }
      get_convergence_state: {
        Args: Record<string, never>
        Returns: {
          total_shards: number
          gathered_shards: number
          convergence_percentage: number
          global_fray: number
          world_phase: string
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
export type RegionalState = Database['public']['Tables']['regional_state']['Row']
export type ShardEvent = Database['public']['Tables']['shard_events']['Row']
export type WorldEvent = Database['public']['Tables']['world_events']['Row']

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type CanonEntityInsert = Database['public']['Tables']['canon_entities']['Insert']
export type ShardInsert = Database['public']['Tables']['shards']['Insert']
export type StoryInsert = Database['public']['Tables']['stories']['Insert']
export type StoryReviewInsert = Database['public']['Tables']['story_reviews']['Insert']
export type RegionalStateInsert = Database['public']['Tables']['regional_state']['Insert']
export type ShardEventInsert = Database['public']['Tables']['shard_events']['Insert']
export type WorldEventInsert = Database['public']['Tables']['world_events']['Insert']

// Update types
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type CanonEntityUpdate = Database['public']['Tables']['canon_entities']['Update']
export type ShardUpdate = Database['public']['Tables']['shards']['Update']
export type StoryUpdate = Database['public']['Tables']['stories']['Update']
export type StoryReviewUpdate = Database['public']['Tables']['story_reviews']['Update']
export type RegionalStateUpdate = Database['public']['Tables']['regional_state']['Update']
export type ShardEventUpdate = Database['public']['Tables']['shard_events']['Update']
export type WorldEventUpdate = Database['public']['Tables']['world_events']['Update']
