/**
 * Shard System Types — Everloop
 *
 * Shards are fragments of what holds reality together.
 * They are NOT artifacts, NOT magic items — they are pieces of stabilized existence.
 *
 * Every shard is built using 4 layers:
 * 1. STATE — What form is it in?
 * 2. LOCATION — Where is it?
 * 3. EXPRESSION — What is it doing?
 * 4. SITUATION — Why is this a story?
 */

// =====================================================
// LAYER 1: STATE — What form is the shard in?
// =====================================================
export type ShardFormState =
  | 'raw'        // Unstable, exposed
  | 'embedded'   // Fused into object/environment
  | 'bound'      // Attached to a person
  | 'buried'     // Hidden/inactive
  | 'fractured'  // Multiple pieces

// =====================================================
// LAYER 2: LOCATION
// =====================================================
export type ShardRegion =
  | 'virelay_coast'
  | 'deyune_steps'
  | 'varnhalt_frontier'
  | 'virelay_deep_forests'
  | 'polar_tundra'
  | 'ocean_deep_water'
  | 'fray_zones'
  | 'unknown_deep'

export const SHARD_REGION_LABELS: Record<ShardRegion, string> = {
  virelay_coast: 'Virelay Coast',
  deyune_steps: 'Deyune Steps',
  varnhalt_frontier: 'Varnhalt Frontier',
  virelay_deep_forests: 'Virelay Deep Forests',
  polar_tundra: 'Polar / Tundra Region',
  ocean_deep_water: 'Ocean / Deep Water',
  fray_zones: 'Fray Zones',
  unknown_deep: 'Unknown / Deep Regions',
}

export type ShardSiteType =
  | 'city'
  | 'ruin'
  | 'forest'
  | 'mountain'
  | 'underground'
  | 'ocean'
  | 'structure'
  | 'fray_zone'
  | 'wilderness'
  | 'coast'
  | 'ice_field'
  | 'volcanic'
  | 'cavern'
  | 'reef'
  | 'abyss'
  | 'plains'
  | 'grove'
  | 'swamp'
  | 'settlement'
  | 'monastery'
  | 'library'
  | 'market'
  | 'estate'
  | 'cathedral'
  | 'cliff'
  | 'ridge'
  | 'hills'
  | 'valley'
  | 'trench'
  | 'rift'
  | 'vault'

// =====================================================
// LAYER 3: EXPRESSION — What is the shard doing?
// =====================================================
export type ShardExpressionCategory =
  | 'stability'
  | 'time'
  | 'memory'
  | 'reality_distortion'
  | 'life_biological'
  | 'energy_power'
  | 'emotional_psychological'
  | 'perception'
  | 'environment'
  | 'shard_behavior'

export type ShardExpression =
  // Stability / Structure
  | 'stabilization'
  | 'over_stabilization'
  | 'selective_stability'
  | 'delayed_change'
  | 'permanent_imprint'
  // Time
  | 'time_slow'
  | 'time_acceleration'
  | 'time_loop'
  | 'time_drift'
  | 'temporal_echoes'
  | 'future_bleed'
  | 'desync'
  // Memory
  | 'memory_loss'
  | 'memory_overload'
  | 'shared_memory'
  | 'false_memory'
  | 'memory_anchoring'
  | 'memory_bleed'
  | 'identity_drift'
  // Reality Distortion
  | 'spatial_warping'
  | 'gravity_shift'
  | 'duplication'
  | 'phasing'
  | 'cause_effect_break'
  | 'environmental_rearrangement'
  | 'perspective_distortion'
  // Life / Biological
  | 'mutation'
  | 'hybridization'
  | 'accelerated_growth'
  | 'decay_resistance'
  | 'selective_survival'
  | 'behavioral_distortion'
  | 'regenerative_looping'
  // Energy / Power
  | 'power_amplification'
  | 'unstable_surges'
  | 'power_drain'
  | 'energy_conversion'
  | 'resonance_field'
  | 'suppression_field'
  // Emotional / Psychological
  | 'fear_amplification'
  | 'calm_imposition'
  | 'aggression_trigger'
  | 'obsession'
  | 'emotional_sync'
  | 'apathy'
  | 'compulsion_loops'
  // Perception
  | 'invisibility_zones'
  | 'auditory_distortion'
  | 'visual_doubling'
  | 'delayed_perception'
  | 'false_signals'
  | 'directional_confusion'
  | 'blind_spots'
  // Environment
  | 'weather_control'
  | 'climate_shift'
  | 'local_storms'
  | 'dead_zones'
  | 'living_terrain'
  | 'resource_distortion'
  // Shard Behavior
  | 'attracts_creatures'
  | 'repels_life'
  | 'calls_other_shards'
  | 'hides_itself'
  | 'mimics_object'
  | 'moves_slowly'
  | 'splits_recombines'

export const EXPRESSION_CATEGORIES: Record<ShardExpressionCategory, ShardExpression[]> = {
  stability: ['stabilization', 'over_stabilization', 'selective_stability', 'delayed_change', 'permanent_imprint'],
  time: ['time_slow', 'time_acceleration', 'time_loop', 'time_drift', 'temporal_echoes', 'future_bleed', 'desync'],
  memory: ['memory_loss', 'memory_overload', 'shared_memory', 'false_memory', 'memory_anchoring', 'memory_bleed', 'identity_drift'],
  reality_distortion: ['spatial_warping', 'gravity_shift', 'duplication', 'phasing', 'cause_effect_break', 'environmental_rearrangement', 'perspective_distortion'],
  life_biological: ['mutation', 'hybridization', 'accelerated_growth', 'decay_resistance', 'selective_survival', 'behavioral_distortion', 'regenerative_looping'],
  energy_power: ['power_amplification', 'unstable_surges', 'power_drain', 'energy_conversion', 'resonance_field', 'suppression_field'],
  emotional_psychological: ['fear_amplification', 'calm_imposition', 'aggression_trigger', 'obsession', 'emotional_sync', 'apathy', 'compulsion_loops'],
  perception: ['invisibility_zones', 'auditory_distortion', 'visual_doubling', 'delayed_perception', 'false_signals', 'directional_confusion', 'blind_spots'],
  environment: ['weather_control', 'climate_shift', 'local_storms', 'dead_zones', 'living_terrain', 'resource_distortion'],
  shard_behavior: ['attracts_creatures', 'repels_life', 'calls_other_shards', 'hides_itself', 'mimics_object', 'moves_slowly', 'splits_recombines'],
}

// =====================================================
// LAYER 4: SITUATION — Why is this a story?
// =====================================================
export type ShardSituationCategory =
  | 'control_ownership'
  | 'ignorance'
  | 'protection'
  | 'environment_challenge'
  | 'instability_urgency'
  | 'moral_conflict'
  | 'chain_dependency'
  | 'npc_centered'
  | 'hidden_discovery'
  | 'conflict_war'
  | 'fray_linked'
  | 'movement_convergence'

export type ShardSituation =
  // Control / Ownership
  | 'controlled_by_faction'
  | 'controlled_by_npc'
  | 'secretly_controlled'
  | 'being_traded'
  | 'recently_stolen'
  | 'hunted_by_multiple_groups'
  // Ignorance
  | 'owner_unaware'
  | 'misinterpreted'
  | 'worshipped'
  | 'feared_as_curse'
  | 'studied_incorrectly'
  // Protection
  | 'guarded_by_monster'
  | 'natural_hazards'
  | 'puzzle_mechanism'
  | 'ritual_bound'
  | 'time_restricted_access'
  // Environment Challenge
  | 'dangerous_terrain'
  | 'hard_traversal'
  | 'changing_map'
  | 'active_fray'
  | 'moving_location'
  // Instability / Urgency
  | 'worsening_region'
  | 'spreading_damage'
  | 'about_to_shift'
  | 'risk_of_loss'
  | 'splitting'
  // Moral Conflict
  | 'removing_harms_region'
  | 'leaving_harms_people'
  | 'competing_factions'
  | 'no_correct_answer'
  // Chain Dependency
  | 'leads_to_another_shard'
  | 'requires_npc_info'
  | 'multi_step_discovery'
  | 'linked_system'
  // NPC-Centered
  | 'npc_bound_to_it'
  | 'npc_protecting_it'
  | 'npc_hunting_it'
  | 'npc_offering_info'
  | 'npc_changing_due_to_it'
  // Hidden / Discovery
  | 'rumor_based'
  | 'clue_chain'
  | 'historical_puzzle'
  | 'found_accidentally'
  | 'mislocated'
  // Conflict / War
  | 'active_battle'
  | 'region_divided'
  | 'strategic_asset'
  | 'escalating_tension'
  // Fray-Linked
  | 'breach_forming'
  | 'monster_emergence'
  | 'reality_breaking'
  | 'area_collapsing'
  // Movement / Convergence
  | 'moving_toward_shard'
  | 'pulling_others'
  | 'near_collision'
  | 'causing_migration'

export const SITUATION_CATEGORIES: Record<ShardSituationCategory, ShardSituation[]> = {
  control_ownership: ['controlled_by_faction', 'controlled_by_npc', 'secretly_controlled', 'being_traded', 'recently_stolen', 'hunted_by_multiple_groups'],
  ignorance: ['owner_unaware', 'misinterpreted', 'worshipped', 'feared_as_curse', 'studied_incorrectly'],
  protection: ['guarded_by_monster', 'natural_hazards', 'puzzle_mechanism', 'ritual_bound', 'time_restricted_access'],
  environment_challenge: ['dangerous_terrain', 'hard_traversal', 'changing_map', 'active_fray', 'moving_location'],
  instability_urgency: ['worsening_region', 'spreading_damage', 'about_to_shift', 'risk_of_loss', 'splitting'],
  moral_conflict: ['removing_harms_region', 'leaving_harms_people', 'competing_factions', 'no_correct_answer'],
  chain_dependency: ['leads_to_another_shard', 'requires_npc_info', 'multi_step_discovery', 'linked_system'],
  npc_centered: ['npc_bound_to_it', 'npc_protecting_it', 'npc_hunting_it', 'npc_offering_info', 'npc_changing_due_to_it'],
  hidden_discovery: ['rumor_based', 'clue_chain', 'historical_puzzle', 'found_accidentally', 'mislocated'],
  conflict_war: ['active_battle', 'region_divided', 'strategic_asset', 'escalating_tension'],
  fray_linked: ['breach_forming', 'monster_emergence', 'reality_breaking', 'area_collapsing'],
  movement_convergence: ['moving_toward_shard', 'pulling_others', 'near_collision', 'causing_migration'],
}

// =====================================================
// LABEL HELPERS
// =====================================================
export function formatEnumLabel(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

// =====================================================
// MONSTER INTEGRATION
// =====================================================
export interface ShardMonsterLink {
  what_broke: string       // What broke here
  fray_connection: string  // How the Fray connects
  shard_involvement: string // Why the shard is involved
}

// =====================================================
// FULL SHARD RECORD (DB + computed)
// =====================================================
export interface ShardRecord {
  id: string
  shard_number: number           // 1-88, canonical ordering
  name: string
  description: string | null
  power_description: string | null
  visual_description: string | null

  // Layer 1: State
  form_state: ShardFormState

  // Layer 2: Location
  region: ShardRegion
  site_types: ShardSiteType[]
  location_description: string | null

  // Layer 3: Expression
  expressions: ShardExpression[]

  // Layer 4: Situation
  situations: ShardSituation[]

  // Monster link (required if monsters present)
  monster_link: ShardMonsterLink | null

  // Existing schema fields
  current_holder_id: string | null
  location_id: string | null
  state: 'dormant' | 'awakening' | 'active' | 'corrupted' | 'shattered' | 'transcended'
  power_level: number
  history: unknown[]
  
  created_at: string
  updated_at: string
}

export interface ShardInsert {
  name: string
  shard_number: number
  description?: string | null
  power_description?: string | null
  visual_description?: string | null
  form_state: ShardFormState
  region: ShardRegion
  site_types: ShardSiteType[]
  location_description?: string | null
  expressions: ShardExpression[]
  situations: ShardSituation[]
  monster_link?: ShardMonsterLink | null
  current_holder_id?: string | null
  location_id?: string | null
  state?: 'dormant' | 'awakening' | 'active' | 'corrupted' | 'shattered' | 'transcended'
  power_level?: number
}

export interface ShardUpdate {
  name?: string
  shard_number?: number
  description?: string | null
  power_description?: string | null
  visual_description?: string | null
  form_state?: ShardFormState
  region?: ShardRegion
  site_types?: ShardSiteType[]
  location_description?: string | null
  expressions?: ShardExpression[]
  situations?: ShardSituation[]
  monster_link?: ShardMonsterLink | null
  current_holder_id?: string | null
  location_id?: string | null
  state?: 'dormant' | 'awakening' | 'active' | 'corrupted' | 'shattered' | 'transcended'
  power_level?: number
}

// =====================================================
// SHARD REGION SUMMARY (for world state display)
// =====================================================
export interface ShardRegionSummary {
  region: ShardRegion
  region_label: string
  total_shards: number
  shards_by_state: Record<string, number>
  shards_by_form: Record<ShardFormState, number>
}
