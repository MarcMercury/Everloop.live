import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const {
    questId,
    participationId,
    playerAction,
    character,
    narrativeHistory,
    config,
    difficulty,
    everloopOverlay,
    currentAct,
  } = body

  if (!questId || !playerAction) {
    return NextResponse.json({ error: 'Missing questId or playerAction' }, { status: 400 })
  }

  // Verify participation
  const { data: participation } = await supabase
    .from('quest_participants')
    .select('id, quest_id, user_id')
    .eq('id', participationId)
    .eq('user_id', user.id)
    .single()

  if (!participation) {
    return NextResponse.json({ error: 'Not a participant' }, { status: 403 })
  }

  // Build narrator style
  const style = config?.style ?? 'atmospheric'
  const pacing = config?.pacing ?? 'moderate'

  const styleGuide: Record<string, string> = {
    atmospheric: 'Rich sensory descriptions. Focus on mood, environment, and subtle details.',
    cinematic: 'Vivid action sequences. Camera-like focus shifts, dramatic reveals.',
    minimalist: 'Short, punchy sentences. Leave space for imagination.',
    verbose: 'Detailed world-building. Extensive description of every element.',
    poetic: 'Lyrical prose. Metaphor and rhythm. Beauty in the telling.',
  }

  const pacingGuide: Record<string, string> = {
    slow: 'Take time. Linger on details. Build tension gradually.',
    moderate: 'Balanced pacing. Mix action with description.',
    fast: 'Quick beats. Push the narrative forward. Urgency.',
    frenetic: 'Breakneck speed. Events cascade. Barely time to breathe.',
  }

  const difficultyGuide: Record<string, string> = {
    story_mode: 'Favor the player. Challenges are present but outcomes lean positive. Death is rare.',
    standard: 'Fair challenge. Success and failure both have weight. Standard D&D balance.',
    brutal: 'Harsh. Resources are scarce. Failure has real consequences. The world does not care about the player.',
    chaos: 'Reality is unstable. Rules shift. Hidden mechanics at play. Nothing is certain. Twist expectations.',
  }

  let systemPrompt = `You are an AI Quest Narrator for Everloop — a collaborative storytelling platform set in a fractured, looping reality.

## Your Role
You narrate a guided quest experience. You respond to the player's actions with vivid, in-character narration that advances the story. You control NPCs, describe environments, present challenges, and react to player choices.

## Narrator Style: ${style}
${styleGuide[style] ?? styleGuide.atmospheric}

## Pacing: ${pacing}
${pacingGuide[pacing] ?? pacingGuide.moderate}

## Difficulty: ${difficulty}
${difficultyGuide[difficulty] ?? difficultyGuide.standard}

## Current Act: ${currentAct}

## Rules
- Respond in 2-4 paragraphs per turn
- End each response with either a clear choice point, a question, or a moment of tension
- Never take actions FOR the player character — describe the world's response to their actions
- Include sensory details (sounds, smells, textures)
- Track narrative continuity from the conversation history
- If the player attempts something, adjudicate the outcome naturally based on difficulty setting
- NPCs should have distinct voices and motivations`

  if (character) {
    systemPrompt += `

## Player Character
- Name: ${character.name}
- Race: ${character.race}
- Class: ${character.class} (Level ${character.level})
- HP: ${character.hp}
- AC: ${character.ac}
Reference the character's class abilities and background naturally. A rogue might notice hidden things; a cleric might sense divine presence.`
  }

  if (everloopOverlay && character?.everloop_traits?.length > 0) {
    systemPrompt += `

## Everloop Narrative Tags (CRITICAL DIFFERENTIATOR)
This character has special Everloop traits that MUST influence the narrative:
${character.everloop_traits.map((t: string) => `- ${t}`).join('\n')}

These traits affect perception, available interactions, and story branches:
- "memory-fractured": Character gets sudden flashback visions, déjà vu, unreliable memories
- "dream-sensitive": Character perceives hidden dream-layer elements, whispers from the Loop
- "shard-touched": Character can interact with reality shards, unstable matter
- "oathbound": Character's sworn oaths have supernatural weight, breaking them has consequences
- "fold-marked": Character exists partially outside normal time, sees echoes of alternate timelines

Weave these into the narration naturally. If a trait would reveal extra information or trigger a special interaction, include it as an "everloopEffect" in your response.`
  } else if (everloopOverlay) {
    systemPrompt += `

## Everloop Mode Active
The world has Everloop elements: reality can fracture, time loops exist, the Fray (chaos energy) permeates everything. Weave subtle hints of the Loop's instability into the environment.`
  }

  // Build messages from history
  const messages: { role: 'user' | 'assistant'; content: string }[] = []

  if (narrativeHistory) {
    for (const entry of narrativeHistory) {
      if (entry.role === 'player') {
        messages.push({ role: 'user', content: entry.content })
      } else if (entry.role === 'narrator') {
        messages.push({ role: 'assistant', content: entry.content })
      }
    }
  }

  messages.push({ role: 'user', content: playerAction })

  try {
    const result = await generateText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      messages,
    })

    // Check if the response mentions an everloop effect
    let everloopEffect: string | null = null
    const text = result.text
    if (everloopOverlay) {
      // Simple extraction — look for narrative cues
      const effectPatterns = [
        /the (?:loop|fray|fold|shard) ([^.]+)/i,
        /reality (?:shifts?|fractures?|bends?) ([^.]+)/i,
        /a vision (?:of|flashes) ([^.]+)/i,
      ]
      for (const pattern of effectPatterns) {
        const match = text.match(pattern)
        if (match) {
          everloopEffect = match[0]
          break
        }
      }
    }

    return NextResponse.json({
      narration: text,
      everloopEffect,
    })
  } catch (error) {
    console.error('Quest narration error:', error)
    return NextResponse.json({ error: 'Narration failed' }, { status: 500 })
  }
}
