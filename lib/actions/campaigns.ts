// @ts-nocheck — campaign tables not yet in generated Supabase types
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type {
  Campaign,
  CampaignInsert,
  CampaignUpdate,
  CampaignPlayer,
  CampaignScene,
  CampaignSceneInsert,
  CampaignSceneUpdate,
  CampaignSession,
  CampaignMessage,
  CampaignDiceRoll,
  NarrativeIdol,
  CampaignNpc,
  DiceRollData,
  MessageType,
  RollType,
  AdvantageType,
  IdolPower,
  IdolType,
} from '@/types/campaign'

// =====================================================
// CAMPAIGNS
// =====================================================

export async function getCampaigns(filters?: {
  status?: string
  game_mode?: string
  is_public?: boolean
}): Promise<{ success: boolean; campaigns?: Campaign[]; error?: string }> {
  const supabase = await createClient()

  let query = supabase
    .from('campaigns')
    .select('*, dm:profiles!campaigns_dm_id_fkey(id, username, display_name, avatar_url)')
    .order('updated_at', { ascending: false })

  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.game_mode) query = query.eq('game_mode', filters.game_mode)
  if (filters?.is_public !== undefined) query = query.eq('is_public', filters.is_public)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching campaigns:', error)
    return { success: false, error: error.message }
  }

  return { success: true, campaigns: (data ?? []) as unknown as Campaign[] }
}

export async function getCampaign(idOrSlug: string): Promise<{ success: boolean; campaign?: Campaign; error?: string }> {
  const supabase = await createClient()

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug)

  let query = supabase
    .from('campaigns')
    .select('*, dm:profiles!campaigns_dm_id_fkey(id, username, display_name, avatar_url)')

  if (isUuid) {
    query = query.eq('id', idOrSlug)
  } else {
    query = query.eq('slug', idOrSlug)
  }

  const { data, error } = await query.single()

  if (error) {
    console.error('Error fetching campaign:', error)
    return { success: false, error: error.message }
  }

  return { success: true, campaign: data as unknown as Campaign }
}

export async function getMyCampaigns(): Promise<{ success: boolean; campaigns?: Campaign[]; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Campaigns I DM
  const { data: dmCampaigns, error: dmErr } = await supabase
    .from('campaigns')
    .select('*, dm:profiles!campaigns_dm_id_fkey(id, username, display_name, avatar_url)')
    .eq('dm_id', user.id)
    .order('updated_at', { ascending: false })

  if (dmErr) return { success: false, error: dmErr.message }

  // Campaigns I'm a player in
  const { data: playerEntries } = await supabase
    .from('campaign_players')
    .select('campaign_id')
    .eq('user_id', user.id)
    .eq('status', 'accepted')

  let playerCampaigns: Campaign[] = []
  if (playerEntries && playerEntries.length > 0) {
    const ids = playerEntries.map(p => p.campaign_id)
    const { data } = await supabase
      .from('campaigns')
      .select('*, dm:profiles!campaigns_dm_id_fkey(id, username, display_name, avatar_url)')
      .in('id', ids)
      .order('updated_at', { ascending: false })
    playerCampaigns = (data ?? []) as unknown as Campaign[]
  }

  const all = [...(dmCampaigns ?? []) as unknown as Campaign[], ...playerCampaigns]
  // Deduplicate
  const seen = new Set<string>()
  const unique = all.filter(c => {
    if (seen.has(c.id)) return false
    seen.add(c.id)
    return true
  })

  return { success: true, campaigns: unique }
}

export async function createCampaign(input: Omit<CampaignInsert, 'dm_id' | 'slug'>): Promise<{
  success: boolean; campaign?: Campaign; error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const slug = input.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    + '-' + Date.now().toString(36)

  const { data, error } = await supabase
    .from('campaigns')
    .insert({ ...input, dm_id: user.id, slug })
    .select()
    .single()

  if (error) {
    console.error('Error creating campaign:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/campaigns')
  return { success: true, campaign: data as unknown as Campaign }
}

export async function updateCampaign(id: string, updates: CampaignUpdate): Promise<{
  success: boolean; campaign?: Campaign; error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('campaigns')
    .update(updates)
    .eq('id', id)
    .eq('dm_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating campaign:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/campaigns')
  revalidatePath(`/campaigns/${id}`)
  return { success: true, campaign: data as unknown as Campaign }
}

// =====================================================
// CAMPAIGN PLAYERS
// =====================================================

export async function getCampaignPlayers(campaignId: string): Promise<{
  success: boolean; players?: CampaignPlayer[]; error?: string
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('campaign_players')
    .select(`
      *,
      user:profiles!campaign_players_user_id_fkey(id, username, display_name, avatar_url),
      character:player_characters!campaign_players_character_id_fkey(id, name, race, class, level, current_hp, max_hp, armor_class, portrait_url, theme_color)
    `)
    .eq('campaign_id', campaignId)
    .order('joined_at', { ascending: true })

  if (error) {
    console.error('Error fetching campaign players:', error)
    return { success: false, error: error.message }
  }

  return { success: true, players: (data ?? []) as unknown as CampaignPlayer[] }
}

export async function joinCampaign(campaignId: string, characterId?: string): Promise<{
  success: boolean; error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Check campaign exists and is recruiting
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, max_players, status, dm_id')
    .eq('id', campaignId)
    .single()

  if (!campaign) return { success: false, error: 'Campaign not found' }
  if (campaign.dm_id === user.id) return { success: false, error: 'You are the DM of this campaign' }
  if (!['lobby', 'recruiting'].includes(campaign.status)) return { success: false, error: 'Campaign is not accepting players' }

  // Check player count
  const { count } = await supabase
    .from('campaign_players')
    .select('id', { count: 'exact', head: true })
    .eq('campaign_id', campaignId)
    .in('status', ['pending', 'accepted'])

  if ((count ?? 0) >= (campaign.max_players ?? 6)) {
    return { success: false, error: 'Campaign is full' }
  }

  const { error } = await supabase
    .from('campaign_players')
    .insert({
      campaign_id: campaignId,
      user_id: user.id,
      character_id: characterId ?? null,
      status: 'pending',
    })

  if (error) {
    if (error.code === '23505') return { success: false, error: 'Already joined this campaign' }
    console.error('Error joining campaign:', error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/campaigns/${campaignId}`)
  return { success: true }
}

export async function updatePlayerStatus(
  campaignId: string,
  playerId: string,
  status: 'accepted' | 'rejected' | 'removed'
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Verify DM
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('dm_id')
    .eq('id', campaignId)
    .single()

  if (!campaign || campaign.dm_id !== user.id) {
    return { success: false, error: 'Only the DM can manage players' }
  }

  const updates: Record<string, unknown> = { status }
  if (status === 'accepted') updates.joined_at = new Date().toISOString()

  const { error } = await supabase
    .from('campaign_players')
    .update(updates)
    .eq('id', playerId)
    .eq('campaign_id', campaignId)

  if (error) {
    console.error('Error updating player status:', error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/campaigns/${campaignId}`)
  return { success: true }
}

export async function selectCharacter(campaignId: string, characterId: string): Promise<{
  success: boolean; error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('campaign_players')
    .update({ character_id: characterId })
    .eq('campaign_id', campaignId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error selecting character:', error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/campaigns/${campaignId}`)
  return { success: true }
}

// =====================================================
// SCENES
// =====================================================

export async function getCampaignScenes(campaignId: string): Promise<{
  success: boolean; scenes?: CampaignScene[]; error?: string
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('campaign_scenes')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('scene_order', { ascending: true })

  if (error) {
    console.error('Error fetching scenes:', error)
    return { success: false, error: error.message }
  }

  return { success: true, scenes: (data ?? []) as unknown as CampaignScene[] }
}

export async function createScene(input: CampaignSceneInsert): Promise<{
  success: boolean; scene?: CampaignScene; error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Get next scene order
  const { count } = await supabase
    .from('campaign_scenes')
    .select('id', { count: 'exact', head: true })
    .eq('campaign_id', input.campaign_id)

  const { data, error } = await supabase
    .from('campaign_scenes')
    .insert({ ...input, scene_order: input.scene_order ?? (count ?? 0) })
    .select()
    .single()

  if (error) {
    console.error('Error creating scene:', error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/campaigns/${input.campaign_id}`)
  return { success: true, scene: data as unknown as CampaignScene }
}

export async function updateScene(id: string, campaignId: string, updates: CampaignSceneUpdate): Promise<{
  success: boolean; scene?: CampaignScene; error?: string
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('campaign_scenes')
    .update(updates)
    .eq('id', id)
    .eq('campaign_id', campaignId)
    .select()
    .single()

  if (error) {
    console.error('Error updating scene:', error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/campaigns/${campaignId}`)
  return { success: true, scene: data as unknown as CampaignScene }
}

// =====================================================
// SESSIONS
// =====================================================

export async function startSession(campaignId: string, title?: string): Promise<{
  success: boolean; session?: CampaignSession; error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Get session number
  const { count } = await supabase
    .from('campaign_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('campaign_id', campaignId)

  // Get first prepared scene
  const { data: firstScene } = await supabase
    .from('campaign_scenes')
    .select('id')
    .eq('campaign_id', campaignId)
    .eq('status', 'prepared')
    .order('scene_order', { ascending: true })
    .limit(1)
    .single()

  const { data, error } = await supabase
    .from('campaign_sessions')
    .insert({
      campaign_id: campaignId,
      session_number: (count ?? 0) + 1,
      title: title ?? `Session ${(count ?? 0) + 1}`,
      status: 'active',
      active_scene_id: firstScene?.id ?? null,
      started_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error starting session:', error)
    return { success: false, error: error.message }
  }

  // Update campaign status
  await supabase
    .from('campaigns')
    .update({ status: 'in_progress' })
    .eq('id', campaignId)
    .eq('dm_id', user.id)

  // Activate the first scene
  if (firstScene?.id) {
    await supabase
      .from('campaign_scenes')
      .update({ status: 'active' })
      .eq('id', firstScene.id)
  }

  revalidatePath(`/campaigns/${campaignId}`)
  return { success: true, session: data as unknown as CampaignSession }
}

export async function getActiveSession(campaignId: string): Promise<{
  success: boolean; session?: CampaignSession; error?: string
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('campaign_sessions')
    .select('*')
    .eq('campaign_id', campaignId)
    .in('status', ['active', 'paused'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return { success: true, session: undefined } // No rows
    return { success: false, error: error.message }
  }

  return { success: true, session: data as unknown as CampaignSession }
}

export async function endSession(sessionId: string, campaignId: string, summary?: string): Promise<{
  success: boolean; error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('campaign_sessions')
    .update({
      status: 'completed',
      ended_at: new Date().toISOString(),
      summary: summary ?? null,
    })
    .eq('id', sessionId)

  if (error) {
    console.error('Error ending session:', error)
    return { success: false, error: error.message }
  }

  // Increment campaign session count
  await supabase.rpc('increment_campaign_sessions', { campaign_id: campaignId }).catch(() => {
    // Fallback: manual increment
    supabase
      .from('campaigns')
      .select('session_count')
      .eq('id', campaignId)
      .single()
      .then(({ data }) => {
        if (data) {
          supabase
            .from('campaigns')
            .update({ session_count: (data.session_count ?? 0) + 1 })
            .eq('id', campaignId)
        }
      })
  })

  revalidatePath(`/campaigns/${campaignId}`)
  return { success: true }
}

export async function changeScene(sessionId: string, sceneId: string, campaignId: string): Promise<{
  success: boolean; error?: string
}> {
  const supabase = await createClient()

  // Deactivate old scene
  const { data: session } = await supabase
    .from('campaign_sessions')
    .select('active_scene_id')
    .eq('id', sessionId)
    .single()

  if (session?.active_scene_id) {
    await supabase
      .from('campaign_scenes')
      .update({ status: 'completed' })
      .eq('id', session.active_scene_id)
  }

  // Activate new scene
  await supabase
    .from('campaign_scenes')
    .update({ status: 'active' })
    .eq('id', sceneId)

  // Update session
  const { error } = await supabase
    .from('campaign_sessions')
    .update({ active_scene_id: sceneId })
    .eq('id', sessionId)

  if (error) {
    console.error('Error changing scene:', error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/campaigns/${campaignId}`)
  return { success: true }
}

// =====================================================
// MESSAGES
// =====================================================

export async function sendMessage(input: {
  session_id: string
  campaign_id: string
  message_type: MessageType
  content: string
  visible_to?: string[]
  roll_data?: DiceRollData
  reference_data?: Record<string, unknown>
  character_name?: string
}): Promise<{ success: boolean; message?: CampaignMessage; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('campaign_messages')
    .insert({
      ...input,
      sender_id: user.id,
      visible_to: input.visible_to ?? [],
    })
    .select()
    .single()

  if (error) {
    console.error('Error sending message:', error)
    return { success: false, error: error.message }
  }

  return { success: true, message: data as unknown as CampaignMessage }
}

export async function getSessionMessages(sessionId: string, limit = 100): Promise<{
  success: boolean; messages?: CampaignMessage[]; error?: string
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('campaign_messages')
    .select(`
      *,
      sender:profiles!campaign_messages_sender_id_fkey(username, display_name, avatar_url)
    `)
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('Error fetching messages:', error)
    return { success: false, error: error.message }
  }

  return { success: true, messages: (data ?? []) as unknown as CampaignMessage[] }
}

// =====================================================
// DICE ROLLS
// =====================================================

function rollDice(sides: number, count: number): number[] {
  const results: number[] = []
  for (let i = 0; i < count; i++) {
    results.push(Math.floor(Math.random() * sides) + 1)
  }
  return results
}

function parseDiceFormula(formula: string): { count: number; sides: number; modifier: number } {
  const match = formula.match(/^(\d+)?d(\d+)([+-]\d+)?$/i)
  if (!match) return { count: 1, sides: 20, modifier: 0 }
  return {
    count: parseInt(match[1] || '1'),
    sides: parseInt(match[2]),
    modifier: parseInt(match[3] || '0'),
  }
}

export async function rollDiceAction(input: {
  session_id: string
  campaign_id: string
  roll_type: RollType
  dice_formula: string
  ability?: string
  skill?: string
  dc?: number
  advantage_type?: AdvantageType
  is_secret?: boolean
  character_name?: string
}): Promise<{ success: boolean; roll?: CampaignDiceRoll; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { count, sides, modifier } = parseDiceFormula(input.dice_formula)
  const advantage = input.advantage_type ?? 'normal'

  let diceResults: number[]
  if (sides === 20 && count === 1 && advantage !== 'normal') {
    // Roll 2d20 for advantage/disadvantage
    const twoRolls = rollDice(20, 2)
    const chosen = advantage === 'advantage' ? Math.max(...twoRolls) : Math.min(...twoRolls)
    diceResults = [chosen]
  } else {
    diceResults = rollDice(sides, count)
  }

  const diceSum = diceResults.reduce((a, b) => a + b, 0)
  const total = diceSum + modifier

  const isCritHit = sides === 20 && count === 1 && diceResults[0] === 20
  const isCritFail = sides === 20 && count === 1 && diceResults[0] === 1
  const isSuccess = input.dc !== undefined ? total >= input.dc : null

  const { data, error } = await supabase
    .from('campaign_dice_rolls')
    .insert({
      session_id: input.session_id,
      campaign_id: input.campaign_id,
      player_id: user.id,
      character_name: input.character_name ?? null,
      roll_type: input.roll_type,
      dice_formula: input.dice_formula,
      dice_results: diceResults,
      modifier,
      total,
      ability: input.ability ?? null,
      skill: input.skill ?? null,
      dc: input.dc ?? null,
      is_critical_hit: isCritHit,
      is_critical_fail: isCritFail,
      is_success: isSuccess,
      is_secret: input.is_secret ?? false,
      advantage_type: advantage,
    })
    .select()
    .single()

  if (error) {
    console.error('Error recording dice roll:', error)
    return { success: false, error: error.message }
  }

  // Also send as a message
  const rollDisplay = isCritHit ? '🎯 CRITICAL HIT!' : isCritFail ? '💀 CRITICAL FAIL!' : `Rolled ${total}`
  await sendMessage({
    session_id: input.session_id,
    campaign_id: input.campaign_id,
    message_type: 'roll',
    content: `${input.character_name ?? 'Unknown'} rolls ${input.dice_formula}: [${diceResults.join(', ')}] + ${modifier} = **${total}** ${rollDisplay}${input.dc ? ` (DC ${input.dc}: ${isSuccess ? '✅ Success' : '❌ Fail'})` : ''}`,
    roll_data: {
      formula: input.dice_formula,
      dice: [{ sides, count, results: diceResults }],
      modifier,
      total,
      advantage_type: advantage,
      is_critical_hit: isCritHit,
      is_critical_fail: isCritFail,
    },
    character_name: input.character_name,
    visible_to: input.is_secret ? [user.id] : [],
  })

  return { success: true, roll: data as unknown as CampaignDiceRoll }
}

// =====================================================
// NARRATIVE IDOLS
// =====================================================

export async function getCampaignIdols(campaignId: string): Promise<{
  success: boolean; idols?: NarrativeIdol[]; error?: string
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('narrative_idols')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false })

  if (error) return { success: false, error: error.message }
  return { success: true, idols: (data ?? []) as unknown as NarrativeIdol[] }
}

export async function grantIdol(input: {
  campaign_id: string
  player_id: string
  session_id: string
  name: string
  description?: string
  idol_type: IdolType
  power: IdolPower | string
  visual?: string
  reason: string
}): Promise<{ success: boolean; idol?: NarrativeIdol; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('narrative_idols')
    .insert({
      campaign_id: input.campaign_id,
      holder_id: input.player_id,
      name: input.name,
      description: input.description ?? null,
      visual: input.visual ?? null,
      idol_type: input.idol_type,
      power: input.power,
      status: 'held',
      earned_by: input.player_id,
      earned_in_session: input.session_id,
      earned_reason: input.reason,
    })
    .select()
    .single()

  if (error) {
    console.error('Error granting idol:', error)
    return { success: false, error: error.message }
  }

  // Update player idol count
  await supabase.rpc('increment_player_idols', {
    p_campaign_id: input.campaign_id,
    p_user_id: input.player_id,
  }).catch(() => {})

  // Send message
  await sendMessage({
    session_id: input.session_id,
    campaign_id: input.campaign_id,
    message_type: 'idol',
    content: `🏆 **${input.name}** has been granted! ${input.reason}`,
    reference_data: { idol_id: data?.id, power: input.power },
  })

  return { success: true, idol: data as unknown as NarrativeIdol }
}

export async function useIdol(idolId: string, sessionId: string, campaignId: string, effect: string): Promise<{
  success: boolean; error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Verify holder
  const { data: idol } = await supabase
    .from('narrative_idols')
    .select('*')
    .eq('id', idolId)
    .eq('holder_id', user.id)
    .eq('status', 'held')
    .single()

  if (!idol) return { success: false, error: 'Idol not found or not held by you' }

  const { error } = await supabase
    .from('narrative_idols')
    .update({
      status: 'used',
      used_in_session: sessionId,
      used_effect: effect,
      holder_id: null,
    })
    .eq('id', idolId)

  if (error) {
    console.error('Error using idol:', error)
    return { success: false, error: error.message }
  }

  // Send dramatic message
  await sendMessage({
    session_id: sessionId,
    campaign_id: campaignId,
    message_type: 'idol',
    content: `⚡ **${(idol as Record<string, unknown>).name}** has been activated! ${effect}. The Everloop trembles...`,
    reference_data: { idol_id: idolId, power: (idol as Record<string, unknown>).power },
  })

  revalidatePath(`/campaigns/${campaignId}`)
  return { success: true }
}

// =====================================================
// NPCs
// =====================================================

export async function getCampaignNpcs(campaignId: string): Promise<{
  success: boolean; npcs?: CampaignNpc[]; error?: string
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('campaign_npcs')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false })

  if (error) return { success: false, error: error.message }
  return { success: true, npcs: (data ?? []) as unknown as CampaignNpc[] }
}

export async function createNpc(input: {
  campaign_id: string
  name: string
  description?: string
  npc_type?: string
  personality?: string
  voice_style?: string
  motivations?: string
  secrets?: string
  canon_entity_id?: string
  stats?: Record<string, unknown>
}): Promise<{ success: boolean; npc?: CampaignNpc; error?: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('campaign_npcs')
    .insert(input)
    .select()
    .single()

  if (error) {
    console.error('Error creating NPC:', error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/campaigns/${input.campaign_id}`)
  return { success: true, npc: data as unknown as CampaignNpc }
}
