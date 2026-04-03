'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * AI Co-DM System
 * 
 * Provides AI-powered narrative assistance for campaign sessions:
 * - NPC dialogue generation (in-character)
 * - Scene narration and descriptions
 * - Dynamic event suggestions based on context
 * - Consequence generation for player actions
 * - Lore-accurate content grounded in Everloop canon
 */

interface AINarrationInput {
  campaignId: string
  sessionId: string
  prompt: string
  context?: {
    sceneMood?: string
    sceneDescription?: string
    recentMessages?: string[]
    activeNpcs?: string[]
    playerNames?: string[]
    worldEra?: string
    frayIntensity?: number
  }
  type: 'narration' | 'npc_dialogue' | 'event' | 'consequence' | 'description'
}

interface AINarrationResult {
  success: boolean
  content?: string
  suggestedMood?: string
  error?: string
}

/**
 * Generate AI narration and post it as a campaign message
 */
export async function generateAINarration(input: AINarrationInput): Promise<AINarrationResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Not authenticated' }

  // Verify user is the DM
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, dm_id, settings')
    .eq('id', input.campaignId)
    .single()

  const campaignRow = campaign as unknown as { id: string; dm_id: string; settings: Record<string, unknown> } | null
  if (!campaignRow || campaignRow.dm_id !== user.id) {
    return { success: false, error: 'Only the DM can use AI narration' }
  }

  // Build the system prompt based on Everloop lore
  const systemPrompt = buildSystemPrompt(input)
  const userPrompt = buildUserPrompt(input)

  try {
    // Lazy-load OpenAI to avoid import cost when not used
    const { default: OpenAI } = await import('openai')
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 500,
      temperature: 0.85,
    })

    const content = completion.choices[0]?.message?.content?.trim()
    if (!content) {
      return { success: false, error: 'AI returned empty response' }
    }

    // Auto-detect mood from generated content
    const suggestedMood = detectMoodFromContent(content)

    // Post as a campaign message
    const messageType = input.type === 'npc_dialogue' ? 'ai_narration' : 'narration'

    await supabase
      .from('campaign_messages')
      .insert({
        session_id: input.sessionId,
        campaign_id: input.campaignId,
        sender_id: user.id,
        message_type: messageType,
        content,
        character_name: input.type === 'npc_dialogue' ? 'AI Co-DM' : undefined,
        reference_data: {
          ai_generated: true,
          prompt_type: input.type,
          suggested_mood: suggestedMood,
        },
      } as never)

    // Auto-update scene mood if narration suggests a shift
    if (suggestedMood && suggestedMood !== input.context?.sceneMood) {
      const { data: sessionData } = await supabase
        .from('campaign_sessions')
        .select('active_scene_id')
        .eq('id', input.sessionId)
        .single()

      const sessionRow = sessionData as unknown as { active_scene_id: string | null } | null
      if (sessionRow?.active_scene_id) {
        await supabase
          .from('campaign_scenes')
          .update({ mood: suggestedMood } as never)
          .eq('id', sessionRow.active_scene_id)
          .eq('campaign_id', input.campaignId)
      }
    }

    return { success: true, content, suggestedMood }
  } catch (err) {
    console.error('[AI Co-DM] Generation failed:', err)
    return { success: false, error: 'AI generation failed. Try again.' }
  }
}

/**
 * Generate NPC dialogue in character
 */
export async function generateNPCDialogue(
  campaignId: string,
  sessionId: string,
  npcName: string,
  npcPersonality: string | null,
  npcVoiceStyle: string | null,
  playerAction: string,
  context?: { sceneMood?: string; sceneDescription?: string }
): Promise<AINarrationResult> {
  return generateAINarration({
    campaignId,
    sessionId,
    prompt: `The player says/does: "${playerAction}". Generate a response from the NPC "${npcName}".`,
    context: {
      ...context,
      activeNpcs: [
        `${npcName} (personality: ${npcPersonality ?? 'mysterious'}, voice: ${npcVoiceStyle ?? 'calm'})`
      ],
    },
    type: 'npc_dialogue',
  })
}

/**
 * Generate scene description narration
 */
export async function generateSceneNarration(
  campaignId: string,
  sessionId: string,
  sceneTitle: string,
  sceneMood: string,
  sceneDescription: string | null,
  additionalContext?: string
): Promise<AINarrationResult> {
  return generateAINarration({
    campaignId,
    sessionId,
    prompt: `Describe the scene: "${sceneTitle}". ${additionalContext ?? ''}`,
    context: {
      sceneMood,
      sceneDescription: sceneDescription ?? undefined,
    },
    type: 'narration',
  })
}

/**
 * Generate consequences for a player action
 */
export async function generateConsequence(
  campaignId: string,
  sessionId: string,
  playerAction: string,
  rollResult?: { total: number; dc?: number; success?: boolean },
  context?: { sceneMood?: string; frayIntensity?: number }
): Promise<AINarrationResult> {
  let prompt = `A player does: "${playerAction}".`
  if (rollResult) {
    prompt += ` They rolled ${rollResult.total}${rollResult.dc ? ` against DC ${rollResult.dc}` : ''}.`
    prompt += rollResult.success ? ' They succeeded.' : ' They failed.'
  }
  prompt += ' Describe what happens next.'

  return generateAINarration({
    campaignId,
    sessionId,
    prompt,
    context,
    type: 'consequence',
  })
}

// =====================================================
// MOOD DETECTION
// =====================================================

const MOOD_KEYWORDS: Record<string, string[]> = {
  tense: ['tension', 'uneasy', 'danger', 'threat', 'watchful', 'nervous', 'tight', 'braced', 'standoff', 'edge'],
  mysterious: ['mystery', 'strange', 'whisper', 'shadow', 'riddle', 'enigma', 'shimmer', 'unknown', 'faint', 'veil'],
  peaceful: ['calm', 'gentle', 'warm', 'quiet', 'serene', 'sunlight', 'breeze', 'rest', 'tranquil', 'birdsong'],
  chaotic: ['chaos', 'explosion', 'shatter', 'scream', 'storm', 'collapse', 'roar', 'frenzy', 'crash', 'rampage'],
  dark: ['darkness', 'dread', 'cold', 'abyss', 'void', 'grim', 'shadow', 'bleak', 'decay', 'tomb'],
  triumphant: ['victory', 'triumph', 'glory', 'cheer', 'hero', 'rise', 'conquer', 'celebrate', 'radiant', 'dawn'],
  horror: ['horror', 'blood', 'scream', 'terror', 'grotesque', 'flesh', 'crawl', 'nightmare', 'writhe', 'dread'],
  wonder: ['wonder', 'awe', 'starlight', 'crystal', 'luminous', 'breathtaking', 'shimmer', 'vast', 'infinite', 'celestial'],
  melancholy: ['sorrow', 'loss', 'rain', 'tears', 'fading', 'memory', 'grief', 'lonely', 'echo', 'weep'],
}

/**
 * Detect the dominant mood from AI-generated narrative content.
 * Uses keyword frequency scoring across mood categories.
 */
function detectMoodFromContent(content: string): string | undefined {
  const lower = content.toLowerCase()
  const scores: Record<string, number> = {}

  for (const [mood, keywords] of Object.entries(MOOD_KEYWORDS)) {
    scores[mood] = 0
    for (const kw of keywords) {
      if (lower.includes(kw)) scores[mood]++
    }
  }

  // Find highest scoring mood (minimum 2 keyword hits to avoid false positives)
  let bestMood: string | undefined
  let bestScore = 1 // threshold: at least 2 hits
  for (const [mood, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score
      bestMood = mood
    }
  }

  return bestMood
}

// =====================================================
// PROMPT BUILDING
// =====================================================

function buildSystemPrompt(input: AINarrationInput): string {
  const fray = input.context?.frayIntensity ?? 0.5

  let prompt = `You are the AI Co-DM for Everloop: Live Campaign Engine.

WORLD CONTEXT:
Everloop is a universe folding, bending, and tearing in on itself. Reality is fractured into Shards of broken timelines. The Pattern is the underlying code of existence. The Fray is the entropy eating at reality's edges. Dreamers can glimpse alternate paths. Vaultkeepers guard hidden knowledge.

Current Fray Intensity: ${Math.round(fray * 100)}% — ${fray > 0.7 ? 'reality is unstable, strange things happen' : fray > 0.4 ? 'the world hums with tension' : 'relative calm, but echoes of fracture linger'}.

RULES:
- Write in second person ("You see...") for narration
- Write in first person for NPC dialogue
- Keep responses under 3 paragraphs
- Be evocative and atmospheric, matching the scene mood
- Reference Everloop lore naturally (Shards, the Fray, the Pattern)
- Never break character or mention game mechanics directly
- Create tension and wonder — this is contemplative, high-function storytelling`

  if (input.context?.sceneMood) {
    prompt += `\n\nSCENE MOOD: ${input.context.sceneMood}`
  }
  if (input.context?.sceneDescription) {
    prompt += `\nSCENE: ${input.context.sceneDescription}`
  }
  if (input.context?.activeNpcs?.length) {
    prompt += `\nACTIVE NPCs: ${input.context.activeNpcs.join(', ')}`
  }

  return prompt
}

function buildUserPrompt(input: AINarrationInput): string {
  switch (input.type) {
    case 'narration':
      return `Write atmospheric narration: ${input.prompt}`
    case 'npc_dialogue':
      return `Write NPC dialogue response: ${input.prompt}`
    case 'event':
      return `Generate a dramatic event: ${input.prompt}`
    case 'consequence':
      return `Describe the consequence: ${input.prompt}`
    case 'description':
      return `Write a vivid description: ${input.prompt}`
    default:
      return input.prompt
  }
}

// =====================================================
// FACTION EVENT ENGINE ("Living World Clock")
// =====================================================

interface FactionEvent {
  faction: string
  action: string
  consequence: string
  affectedLocation: string | null
  frayShift: number // -0.1 to +0.1
  mood: string
}

interface WorldClockResult {
  success: boolean
  events?: FactionEvent[]
  narrativeSummary?: string
  error?: string
}

/**
 * Advance the world clock — simulate faction moves during downtime.
 * Call this when players finish a Long Rest or a session ends.
 * Each faction makes one "move" based on their goals, and the results
 * are posted as 'event' messages to the campaign log.
 */
export async function advanceWorldClock(
  campaignId: string,
  sessionId: string,
  trigger: 'long_rest' | 'session_end' | 'time_skip'
): Promise<WorldClockResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Verify DM
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, dm_id, fray_intensity, settings, world_era')
    .eq('id', campaignId)
    .single()

  const campaignRow = campaign as unknown as {
    id: string; dm_id: string; fray_intensity: number | null;
    settings: Record<string, unknown> | null; world_era: string | null
  } | null

  if (!campaignRow || campaignRow.dm_id !== user.id) {
    return { success: false, error: 'Only the DM can advance the world clock' }
  }

  // Gather faction NPCs
  const { data: npcsData } = await supabase
    .from('campaign_npcs')
    .select('*')
    .eq('campaign_id', campaignId)

  const npcs = (npcsData ?? []) as unknown as Array<{
    id: string; name: string; npc_type: string;
    personality: string | null; motivations: string | null;
    secrets: string | null; description: string | null
  }>

  if (npcs.length === 0) {
    return { success: false, error: 'No NPCs in this campaign to simulate' }
  }

  // Get recent events for context
  const { data: recentMessages } = await supabase
    .from('campaign_messages')
    .select('content, message_type')
    .eq('campaign_id', campaignId)
    .in('message_type', ['event', 'narration', 'ai_narration'])
    .order('created_at', { ascending: false })
    .limit(10)

  const recentContext = (recentMessages ?? [])
    .map((m: { content: string }) => m.content)
    .reverse()
    .join('\n')

  // Get current scenes for location context
  const { data: scenes } = await supabase
    .from('campaign_scenes')
    .select('title, mood, narration, status')
    .eq('campaign_id', campaignId)
    .in('status', ['prepared', 'active', 'completed'])
    .limit(10)

  const sceneContext = (scenes ?? [])
    .map((s: { title: string; mood: string; status: string }) => `${s.title} (${s.mood}, ${s.status})`)
    .join(', ')

  const fray = campaignRow.fray_intensity ?? 0.5

  // Build the prompt for faction simulation
  const factionList = npcs.map(n =>
    `- **${n.name}** (${n.npc_type}): ${n.motivations || n.description || 'Unknown goals'}${n.secrets ? ` [SECRET: ${n.secrets}]` : ''}`
  ).join('\n')

  try {
    const { default: OpenAI } = await import('openai')
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are the World Clock Engine for Everloop. You simulate what factions and NPCs do OFF-SCREEN during player downtime.

WORLD STATE:
- Fray Intensity: ${Math.round(fray * 100)}%
- Trigger: ${trigger === 'long_rest' ? 'Players are resting (8 hours pass)' : trigger === 'session_end' ? 'Session ended (days may pass)' : 'Time skip'}
- Active Scenes: ${sceneContext || 'None'}

RULES:
- Each NPC/faction makes ONE move aligned with their motivations
- Moves should be consequential but not campaign-ending
- Higher Fray means more chaotic/unpredictable events
- Reference Everloop lore (Shards, the Pattern, the Fray) naturally
- Create hooks that the DM can present to players later
- Return VALID JSON only`
        },
        {
          role: 'user',
          content: `## Current Factions & NPCs:
${factionList}

## Recent Events:
${recentContext || 'No recent events.'}

Generate faction moves. Return a JSON object with this exact structure:
{
  "events": [
    {
      "faction": "NPC or faction name",
      "action": "What they did (1 sentence)",
      "consequence": "The visible result (1-2 sentences, atmospheric)",
      "affectedLocation": "Location name or null",
      "frayShift": 0.0,
      "mood": "tense|mysterious|dark|chaotic|peaceful"
    }
  ],
  "narrativeSummary": "A 2-3 sentence atmospheric summary of what changed in the world"
}`
        }
      ],
      max_tokens: 800,
      temperature: 0.9,
      response_format: { type: 'json_object' },
    })

    const rawContent = completion.choices[0]?.message?.content?.trim()
    if (!rawContent) {
      return { success: false, error: 'AI returned empty response' }
    }

    let parsed: { events: FactionEvent[]; narrativeSummary: string }
    try {
      parsed = JSON.parse(rawContent)
    } catch {
      return { success: false, error: 'AI returned invalid JSON' }
    }

    if (!parsed.events || !Array.isArray(parsed.events)) {
      return { success: false, error: 'AI response missing events array' }
    }

    // Post each event as a campaign message
    for (const event of parsed.events) {
      await supabase
        .from('campaign_messages')
        .insert({
          session_id: sessionId,
          campaign_id: campaignId,
          sender_id: user.id,
          message_type: 'event',
          content: `**${event.faction}**: ${event.action}\n\n${event.consequence}`,
          reference_data: {
            world_clock: true,
            trigger,
            faction: event.faction,
            affected_location: event.affectedLocation,
            fray_shift: event.frayShift,
            suggested_mood: event.mood,
          },
        } as never)
    }

    // Post the narrative summary
    if (parsed.narrativeSummary) {
      await supabase
        .from('campaign_messages')
        .insert({
          session_id: sessionId,
          campaign_id: campaignId,
          sender_id: user.id,
          message_type: 'narration',
          content: `🌍 *The world turns...*\n\n${parsed.narrativeSummary}`,
          reference_data: { world_clock: true, summary: true, trigger },
        } as never)
    }

    // Update fray intensity based on cumulative faction shifts
    const totalFrayShift = parsed.events.reduce((sum, e) => sum + (e.frayShift || 0), 0)
    if (totalFrayShift !== 0) {
      const newFray = Math.max(0, Math.min(1, fray + totalFrayShift))
      await supabase
        .from('campaigns')
        .update({ fray_intensity: newFray } as never)
        .eq('id', campaignId)
    }

    return {
      success: true,
      events: parsed.events,
      narrativeSummary: parsed.narrativeSummary,
    }
  } catch (err) {
    console.error('[World Clock] Generation failed:', err)
    return { success: false, error: 'World clock simulation failed' }
  }
}
