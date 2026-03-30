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
        reference_data: { ai_generated: true, prompt_type: input.type },
      } as never)

    return { success: true, content }
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
