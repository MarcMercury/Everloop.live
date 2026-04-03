/**
 * Campaign Engine Types
 * Core types for the Everloop Live Campaign Engine
 */

import { Json } from './database'

// =====================================================
// ENUMS
// =====================================================

export type GameMode = 'classic' | 'one_shot' | 'survivor' | 'mystery' | 'social_deception'

export type CampaignType = 'dm_led' | 'quest'

export type CampaignStatus = 'draft' | 'lobby' | 'ready' | 'active' | 'paused' | 'complete' | 'archived'

export type CampaignLength = 'one_shot' | 'short_arc' | 'full_campaign' | 'endless'

export type DifficultyPreset = 'story_mode' | 'standard' | 'brutal' | 'chaos'

export type SettingName = 'custom' | 'forgotten_realms' | 'everloop_world' | 'other'

export type CampaignTone = 'light_adventure' | 'dark_horror' | 'political_intrigue' | 'chaotic_experimental'

export type WorldStructure = 'linear' | 'branching' | 'open_world' | 'looping'

export type WorldPersistence = 'session_reset' | 'persistent' | 'evolving'

export type AiAssistLevel = 'off' | 'assistant' | 'co_dm' | 'director'

export type CharacterEntryMode = 'pre_generated' | 'bring_own' | 'create_new' | 'dm_approval'

export type PartyRole = 'tank' | 'healer' | 'dps' | 'support' | 'utility' | 'custom'

export type ReadinessState = 'not_ready' | 'ready' | 'away'

export type ApprovalState = 'pending_character' | 'awaiting_approval' | 'approved' | 'rejected'

export type QuestType = 'solo' | 'paired' | 'party' | 'public' | 'ai_guided'

export type SceneType = 'narrative' | 'combat' | 'exploration' | 'social' | 'puzzle' | 'rest' | 'boss' | 'event'

export type SceneMood = 'tense' | 'mysterious' | 'peaceful' | 'chaotic' | 'dark' | 'triumphant' | 'neutral' | 'horror' | 'wonder' | 'melancholy'

export type SceneStatus = 'prepared' | 'active' | 'completed' | 'skipped'

export type SessionStatus = 'scheduled' | 'active' | 'paused' | 'completed'

export type PlayerRole = 'player' | 'co_dm' | 'spectator'

export type PlayerStatus = 'pending' | 'accepted' | 'rejected' | 'removed' | 'left'

export type MessageType = 'chat' | 'whisper' | 'narration' | 'system' | 'roll' | 'ai_narration' | 'event' | 'idol'

export type RollType = 'ability_check' | 'saving_throw' | 'attack' | 'damage' | 'initiative' | 'death_save' | 'skill_check' | 'custom'

export type AdvantageType = 'normal' | 'advantage' | 'disadvantage'

export type IdolType = 'minor' | 'major' | 'legendary'

export type IdolPower = 'reroll' | 'reveal' | 'override' | 'shield' | 'shift' | 'summon' | 'fracture' | 'immunity' | 'custom'

export type IdolStatus = 'available' | 'held' | 'used' | 'destroyed' | 'corrupted'

export type NpcType = 'ally' | 'enemy' | 'neutral' | 'merchant' | 'quest_giver' | 'boss' | 'mysterious'

// =====================================================
// CAMPAIGN SETTINGS
// =====================================================

export interface CampaignSettings {
  allow_pvp: boolean
  death_rules: 'standard' | 'permadeath' | 'heroic' | 'narrative'
  difficulty: 'easy' | 'normal' | 'hard' | 'nightmare'
  atmosphere_enabled: boolean
  fog_of_war: boolean
  dynamic_lighting: boolean
  ai_co_dm: boolean
  idol_system: boolean
  max_idols_per_player: number
}

// =====================================================
// DIFFICULTY SLIDERS
// =====================================================

export interface DifficultySliders {
  combat_lethality: number
  resource_scarcity: number
  puzzle_complexity: number
  social_consequence: number
  random_event_frequency: number
}

// =====================================================
// RULESET CONFIGURATION
// =====================================================

export interface RulesetConfig {
  core_rules: 'dnd_5e' | 'custom' | 'everloop_overlay'
  initiative_tracking: boolean
  advantage_disadvantage: boolean
  spell_slot_tracking: boolean
  concentration_tracking: boolean
  encumbrance: boolean
  critical_rules: 'standard' | 'brutal' | 'cinematic'
  combat_mode: 'tactical_grid' | 'hybrid' | 'narrative'
}

// =====================================================
// PROGRESSION SETTINGS
// =====================================================

export interface ProgressionConfig {
  leveling_style: 'milestone' | 'xp_based' | 'hybrid'
  progression_speed: 'fast' | 'standard' | 'slow'
  feats_enabled: boolean
  multiclassing_enabled: boolean
  custom_abilities_enabled: boolean
}

// =====================================================
// NARRATIVE ENGINE SETTINGS
// =====================================================

export interface NarrativeSettings {
  hidden_info_level: 'off' | 'light' | 'heavy'
  event_engine_intensity: 'off' | 'light' | 'active' | 'dominant'
  scene_based_mode: boolean
}

// =====================================================
// IDOL SYSTEM SETTINGS
// =====================================================

export interface IdolSettings {
  enabled: boolean
  who_earns: 'individuals' | 'teams'
  when_usable: 'before_events' | 'anytime'
  effects_allowed: IdolPower[]
}

// =====================================================
// IMMERSION SETTINGS
// =====================================================

export interface ImmersionSettings {
  music: boolean
  ambient_effects: boolean
  visual_effects_intensity: 'low' | 'medium' | 'high'
  dice_animation: 'none' | 'simple' | 'standard' | 'cinematic'
}

// =====================================================
// PLAYER CONFIGURATION
// =====================================================

export interface PlayerConfig {
  role_types: 'standard_party' | 'teams' | 'hidden_factions'
  knowledge_level: 'shared' | 'partial' | 'isolated'
}

// =====================================================
// CHARACTER RULES
// =====================================================

export interface CharacterRules {
  min_level: number
  max_level: number
  allowed_classes: string[]
  everloop_classes_allowed: boolean
  stat_generation: 'any' | 'standard_array' | 'point_buy' | 'rolled'
  inventory_restrictions: string[]
}

// =====================================================
// SCENE ATMOSPHERE
// =====================================================

export interface SceneAtmosphere {
  ambient_sound: string | null
  music_track: string | null
  lighting: 'bright' | 'normal' | 'dim' | 'dark' | 'magical' | 'firelight' | 'moonlight'
  weather: string | null
  time_of_day: 'dawn' | 'morning' | 'day' | 'afternoon' | 'dusk' | 'evening' | 'night' | 'midnight'
  visual_filter: string | null // e.g., 'sepia', 'blood_red', 'fray_fracture', 'dream', 'void'
}

// =====================================================
// EVENT TRIGGER SYSTEM
// =====================================================

export interface EventTrigger {
  id: string
  name: string
  type: 'roll_fail' | 'roll_success' | 'timer' | 'hp_threshold' | 'idol_used' | 'player_action' | 'round_count' | 'fray_spike' | 'custom'
  condition: {
    target?: string  // player id, 'any', 'all'
    threshold?: number
    timer_seconds?: number
    round?: number
    custom_condition?: string
  }
  effect: {
    type: 'spawn_npc' | 'change_scene' | 'narrative' | 'damage' | 'heal' | 'reveal' | 'fray_event' | 'idol_grant' | 'music_change' | 'mood_shift' | 'custom'
    data: Json
    narration?: string  // text to display when triggered
  }
  fired: boolean
  hidden: boolean  // hidden from players
  repeatable: boolean
}

// =====================================================
// NPC STATS
// =====================================================

export interface NpcStats {
  hp: number
  max_hp: number
  ac: number
  attack_bonus: number
  damage: string
  abilities: string[]
}

// =====================================================
// INITIATIVE ORDER
// =====================================================

export interface InitiativeEntry {
  id: string        // player_id or npc_id
  name: string
  type: 'player' | 'npc'
  initiative: number
  is_active: boolean
  hp?: number
  max_hp?: number
  conditions?: string[]
}

// =====================================================
// DICE ROLL
// =====================================================

export interface DiceRollData {
  formula: string
  dice: { sides: number; count: number; results: number[] }[]
  modifier: number
  total: number
  advantage_type: AdvantageType
  is_critical_hit: boolean
  is_critical_fail: boolean
}

// =====================================================
// ROW TYPES
// =====================================================

export interface Campaign {
  id: string
  title: string
  slug: string
  description: string | null
  cover_image_url: string | null
  dm_id: string
  campaign_type: CampaignType
  game_mode: GameMode
  status: CampaignStatus
  max_players: number
  is_public: boolean
  allow_spectators: boolean
  world_era: string
  fray_intensity: number
  referenced_entities: string[]
  referenced_shards: string[]
  settings: CampaignSettings
  // Campaign Forge fields
  setting_name: SettingName
  tone: CampaignTone
  campaign_length: CampaignLength
  difficulty_preset: DifficultyPreset
  difficulty_sliders: DifficultySliders
  ruleset: RulesetConfig
  progression: ProgressionConfig
  narrative_settings: NarrativeSettings
  idol_settings: IdolSettings
  world_structure: WorldStructure
  world_persistence: WorldPersistence
  immersion: ImmersionSettings
  player_config: PlayerConfig
  ai_assist_level: AiAssistLevel
  character_entry_mode: CharacterEntryMode
  character_rules: CharacterRules
  join_code: string | null
  // Stats
  session_count: number
  total_play_time_minutes: number
  tags: string[]
  metadata: Json
  created_at: string
  updated_at: string
  // Joined data
  dm?: {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
  }
  players?: CampaignPlayer[]
  scenes?: CampaignScene[]
}

export interface CampaignInsert {
  title: string
  slug: string
  description?: string | null
  cover_image_url?: string | null
  dm_id: string
  campaign_type?: CampaignType
  game_mode?: GameMode
  status?: CampaignStatus
  max_players?: number
  is_public?: boolean
  allow_spectators?: boolean
  world_era?: string
  fray_intensity?: number
  referenced_entities?: string[]
  referenced_shards?: string[]
  settings?: Json
  setting_name?: SettingName
  tone?: CampaignTone
  campaign_length?: CampaignLength
  difficulty_preset?: DifficultyPreset
  difficulty_sliders?: Json
  ruleset?: Json
  progression?: Json
  narrative_settings?: Json
  idol_settings?: Json
  world_structure?: WorldStructure
  world_persistence?: WorldPersistence
  immersion?: Json
  player_config?: Json
  ai_assist_level?: AiAssistLevel
  character_entry_mode?: CharacterEntryMode
  character_rules?: Json
  join_code?: string | null
  tags?: string[]
  metadata?: Json
}

export interface CampaignUpdate {
  title?: string
  description?: string | null
  cover_image_url?: string | null
  campaign_type?: CampaignType
  game_mode?: GameMode
  status?: CampaignStatus
  max_players?: number
  is_public?: boolean
  allow_spectators?: boolean
  fray_intensity?: number
  settings?: Json
  setting_name?: SettingName
  tone?: CampaignTone
  campaign_length?: CampaignLength
  difficulty_preset?: DifficultyPreset
  difficulty_sliders?: Json
  ruleset?: Json
  progression?: Json
  narrative_settings?: Json
  idol_settings?: Json
  world_structure?: WorldStructure
  world_persistence?: WorldPersistence
  immersion?: Json
  player_config?: Json
  ai_assist_level?: AiAssistLevel
  character_entry_mode?: CharacterEntryMode
  character_rules?: Json
  join_code?: string | null
  tags?: string[]
  session_count?: number
  total_play_time_minutes?: number
}

export interface CampaignPlayer {
  id: string
  campaign_id: string
  user_id: string
  character_id: string | null
  role: PlayerRole
  status: PlayerStatus
  // Roster binding fields
  party_role: PartyRole | null
  campaign_hp: number | null
  campaign_max_hp: number | null
  campaign_inventory: Json
  secrecy_flags: Json
  readiness_state: ReadinessState
  approval_state: ApprovalState
  attendance: Json
  dm_notes: string | null
  permission_level: 'full' | 'limited' | 'spectator'
  everloop_traits: string[]
  // Idol tracking
  idols_held: number
  hidden_objectives: Json
  secret_info: Json
  // Stats
  sessions_attended: number
  total_rolls: number
  critical_hits: number
  critical_fails: number
  joined_at: string | null
  created_at: string
  updated_at: string
  // Joined data
  user?: {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
  }
  character?: {
    id: string
    name: string
    race: string
    class: string
    level: number
    current_hp: number
    max_hp: number
    armor_class: number
    portrait_url: string | null
    theme_color: string
  }
}

export interface CampaignScene {
  id: string
  campaign_id: string
  title: string
  description: string | null
  scene_order: number
  scene_type: SceneType
  mood: SceneMood
  atmosphere: SceneAtmosphere
  map_url: string | null
  map_data: Json
  fog_of_war: Json
  triggers: EventTrigger[]
  npcs: Json
  dm_notes: string | null
  narration: string | null
  status: SceneStatus
  linked_entities: string[]
  metadata: Json
  created_at: string
  updated_at: string
}

export interface CampaignSceneInsert {
  campaign_id: string
  title: string
  description?: string | null
  scene_order?: number
  scene_type?: SceneType
  mood?: SceneMood
  atmosphere?: Json
  map_url?: string | null
  triggers?: Json
  npcs?: Json
  dm_notes?: string | null
  narration?: string | null
  linked_entities?: string[]
}

export interface CampaignSceneUpdate {
  title?: string
  description?: string | null
  scene_order?: number
  scene_type?: SceneType
  mood?: SceneMood
  atmosphere?: Json
  map_url?: string | null
  map_data?: Json
  fog_of_war?: Json
  triggers?: Json
  npcs?: Json
  dm_notes?: string | null
  narration?: string | null
  status?: SceneStatus
  linked_entities?: string[]
}

export interface CampaignSession {
  id: string
  campaign_id: string
  session_number: number
  title: string | null
  status: SessionStatus
  active_scene_id: string | null
  initiative_order: InitiativeEntry[]
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

export interface CampaignMessage {
  id: string
  session_id: string
  campaign_id: string
  sender_id: string | null
  message_type: MessageType
  content: string
  visible_to: string[]
  roll_data: DiceRollData | null
  reference_data: Json | null
  character_name: string | null
  is_hidden: boolean
  created_at: string
  // Joined data
  sender?: {
    username: string
    display_name: string | null
    avatar_url: string | null
  }
}

export interface CampaignDiceRoll {
  id: string
  session_id: string
  campaign_id: string
  player_id: string | null
  character_name: string | null
  roll_type: RollType
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
  advantage_type: AdvantageType
  metadata: Json
  created_at: string
}

export interface NarrativeIdol {
  id: string
  campaign_id: string
  holder_id: string | null
  name: string
  description: string | null
  visual: string | null
  idol_type: IdolType
  power: IdolPower | string
  status: IdolStatus
  earned_by: string | null
  earned_in_session: string | null
  used_in_session: string | null
  earned_reason: string | null
  used_effect: string | null
  created_at: string
  updated_at: string
}

export interface CampaignNpc {
  id: string
  campaign_id: string
  canon_entity_id: string | null
  name: string
  description: string | null
  portrait_url: string | null
  npc_type: NpcType
  stats: NpcStats
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

// =====================================================
// GAME MODE DESCRIPTIONS
// =====================================================

export const GAME_MODE_INFO: Record<GameMode, { name: string; description: string; icon: string; minPlayers: number; maxPlayers: number; estimatedLength: string }> = {
  classic: {
    name: 'Classic Campaign',
    description: 'Traditional long-form D&D campaign. Build your party, explore the Everloop, and shape the world across multiple sessions.',
    icon: '⚔️',
    minPlayers: 2,
    maxPlayers: 8,
    estimatedLength: '10+ sessions',
  },
  one_shot: {
    name: 'One-Shot',
    description: 'A complete adventure in a single session. Pre-built scenario with a beginning, middle, and dramatic end.',
    icon: '🎯',
    minPlayers: 2,
    maxPlayers: 6,
    estimatedLength: '1 session (2-4 hours)',
  },
  survivor: {
    name: 'Survivor',
    description: 'Elimination-style gameplay. Players face challenges and vote or compete to stay in the game. Alliances form and break.',
    icon: '🔥',
    minPlayers: 4,
    maxPlayers: 16,
    estimatedLength: '3-6 sessions',
  },
  mystery: {
    name: 'Murder Mystery',
    description: 'One player is the hidden culprit. Investigate, gather clues, and unmask the truth before it is too late.',
    icon: '🔍',
    minPlayers: 4,
    maxPlayers: 10,
    estimatedLength: '1-2 sessions',
  },
  social_deception: {
    name: 'Social Deception',
    description: 'Hidden roles, secret objectives, and shifting alliances. Trust no one. Betray everyone. Win the game.',
    icon: '🎭',
    minPlayers: 5,
    maxPlayers: 12,
    estimatedLength: '1-3 sessions',
  },
}

// =====================================================
// MOOD THEMES (for atmosphere rendering)
// =====================================================

export const MOOD_THEMES: Record<SceneMood, { color: string; bgGradient: string; icon: string; ambientDefault: string }> = {
  tense: { color: '#ff6b35', bgGradient: 'from-orange-950/40 to-red-950/20', icon: '⚡', ambientDefault: 'heartbeat' },
  mysterious: { color: '#8b5cf6', bgGradient: 'from-violet-950/40 to-indigo-950/20', icon: '🌀', ambientDefault: 'whispers' },
  peaceful: { color: '#22c55e', bgGradient: 'from-green-950/40 to-emerald-950/20', icon: '🕊️', ambientDefault: 'forest' },
  chaotic: { color: '#ef4444', bgGradient: 'from-red-950/40 to-orange-950/20', icon: '💥', ambientDefault: 'battle' },
  dark: { color: '#6b7280', bgGradient: 'from-gray-950/40 to-slate-950/20', icon: '🌑', ambientDefault: 'cave_drip' },
  triumphant: { color: '#d4a84b', bgGradient: 'from-yellow-950/40 to-amber-950/20', icon: '👑', ambientDefault: 'fanfare' },
  neutral: { color: '#94a3b8', bgGradient: 'from-slate-950/40 to-gray-950/20', icon: '◆', ambientDefault: 'tavern' },
  horror: { color: '#991b1b', bgGradient: 'from-red-950/60 to-black/40', icon: '💀', ambientDefault: 'creaking' },
  wonder: { color: '#06b6d4', bgGradient: 'from-cyan-950/40 to-blue-950/20', icon: '✨', ambientDefault: 'magic_hum' },
  melancholy: { color: '#64748b', bgGradient: 'from-blue-950/40 to-gray-950/20', icon: '🌧️', ambientDefault: 'rain' },
}

// =====================================================
// IDOL DEFINITIONS
// =====================================================

export const IDOL_DEFINITIONS: Record<IdolPower, { name: string; description: string; visual: string; type: IdolType }> = {
  reroll: { name: 'Shard of Recurrence', description: 'Force any single die roll to be rerolled. The Everloop trembles.', visual: '🔄', type: 'minor' },
  reveal: { name: 'Eye of the Vaultkeeper', description: 'Reveal one hidden secret, trigger, or piece of information the DM is withholding.', visual: '👁️', type: 'major' },
  override: { name: 'Dreamer\'s Decree', description: 'Override one DM ruling or narrative outcome. Reality bends to your will.', visual: '⚖️', type: 'legendary' },
  shield: { name: 'Aegis of the Pattern', description: 'Prevent one negative outcome from affecting you. The Pattern protects.', visual: '🛡️', type: 'major' },
  shift: { name: 'Mood Shard', description: 'Immediately shift the scene\'s mood and atmosphere. Change the tone of reality.', visual: '🌀', type: 'minor' },
  summon: { name: 'Herald\'s Call', description: 'Summon an NPC ally to your aid for this scene. They answer from the Loop.', visual: '📯', type: 'major' },
  fracture: { name: 'Fray Fragment', description: 'Cause a Fray event—a tear in reality. Unpredictable, powerful, dangerous.', visual: '💔', type: 'legendary' },
  immunity: { name: 'Loop Skip', description: 'Remove yourself from one combat round or event entirely. You phase out of this Loop.', visual: '⏭️', type: 'minor' },
  custom: { name: 'Unknown Idol', description: 'A unique artifact with DM-defined power. Its nature is yet to be revealed.', visual: '❓', type: 'major' },
}
