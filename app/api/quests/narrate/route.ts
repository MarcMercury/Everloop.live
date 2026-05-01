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

  // Verify participation belongs to the requested quest
  const participationRow = participation as { id: string; quest_id: string; user_id: string }
  if (participationRow.quest_id !== questId) {
    return NextResponse.json({ error: 'Participation does not match quest' }, { status: 403 })
  }

  // Load the designer's quest_structure so the narrator can follow the intended flow
  const { data: questRow } = await supabase
    .from('quests')
    .select('quest_structure')
    .eq('id', questId)
    .single()
  const questStructure = (questRow as { quest_structure?: Record<string, unknown> } | null)?.quest_structure ?? null

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
    story_mode: 'Favor the player. Challenges are present but outcomes lean positive. The Shard reveals itself gently. Monsters are rare and more tragic than deadly.',
    standard: 'Fair challenge. Success and failure both have weight. Shards are hard-won. Monsters are dangerous but comprehensible. The Fray hums at the edges.',
    brutal: 'Harsh. Resources are scarce. Failure has real consequences. Monsters are drawn to instability and appear where the Fray runs deep. Shards are guarded, buried, or wielded by those who don\'t understand them.',
    chaos: 'Reality is fractured. The Drift presses through. Monsters manifest without warning — alien, unstable, wrong. Shards destabilize everything around them. Nothing is certain. The Pattern itself is failing.',
  }

  let systemPrompt = `You are an AI Quest Narrator for Everloop — a collaborative storytelling platform set in a fractured, looping reality.

## Your Role
You narrate a guided quest experience. You respond to the player's actions with vivid, in-character narration that advances the story. You control NPCs, describe environments, present challenges, and react to player choices.

## The World
The Everloop is held together by the Pattern — a vast lattice woven by the First Architects. When the Rogue Architects broke the world, the Anchors shattered into Shards. These Shards are scattered across every region in unknown numbers, quietly pulling toward one another, reshaping the world around them. Every quest in the Everloop ultimately bends toward a Shard, whether the characters realize it or not.

After the Fray — the breaking — Monsters began to appear. They are not native to the Everloop. They are fragments of the Drift, the primordial sea of chaos, leaking through cracks in reality. Where the Fray is strongest, Monsters manifest: creatures that defy logic, bodies that shift, behaviors that don't align with survival. If a Monster appears, something broke nearby — and that break connects to a Shard or the Fray.

## Narrator Style: ${style}
${styleGuide[style] ?? styleGuide.atmospheric}

## Pacing: ${pacing}
${pacingGuide[pacing] ?? pacingGuide.moderate}

## Difficulty: ${difficulty}
${difficultyGuide[difficulty] ?? difficultyGuide.standard}

## Current Act: ${currentAct}

## Narrative Gravity (CRITICAL)
Every quest ultimately connects to a Shard. This does NOT mean you mention Shards constantly. It means:
- The hidden force shaping events should slowly reveal itself
- NPCs may know more than they say about what lies beneath a region
- A missing person, a war, a ruin, a relic — each should point toward something deeper holding the world together (or tearing it apart)
- Monsters are never random — they appear because reality fractured somewhere nearby. Imply the instability that birthed them
- By the quest's end, the player should encounter or approach something that connects to a Shard: finding one, learning of one, seeing the consequences of one, or making a decision about one

## Rules
- Respond in 2-4 paragraphs per turn
- End each response with either a clear choice point, a question, or a moment of tension
- Never take actions FOR the player character — describe the world's response to their actions
- Include sensory details (sounds, smells, textures)
- Track narrative continuity from the conversation history
- If the player attempts something, adjudicate the outcome naturally based on difficulty setting
- NPCs should have distinct voices and motivations
- When introducing Monsters, describe the wrongness of reality around them — the air that tastes of copper, the light that bends, the silence where sound should be
- Let the pull toward Shards feel atmospheric and gravitational, never like a quest marker`

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
- "shard-touched": Character can sense Shards nearby — a pull, a warmth, a wrongness in reality. They may interact with unstable matter, perceive what a Shard is doing to the world around it
- "oathbound": Character's sworn oaths have supernatural weight, breaking them has consequences
- "fold-marked": Character exists partially outside normal time, sees echoes of alternate timelines

Weave these into the narration naturally. If a trait would reveal extra information or trigger a special interaction, include it as an "everloopEffect" in your response. Shard-touched characters should feel the gravitational pull of nearby Shards and sense when Monsters are near (as both are connected to reality's fractures).`
  } else if (everloopOverlay) {
    systemPrompt += `

## Everloop Mode Active
The world has Everloop elements: reality can fracture, time loops exist, the Fray permeates everything. Weave subtle hints of the Loop's instability into the environment. Monsters — manifestations of the Drift leaking through broken reality — may appear where the Fray is strongest. They are never random; they are symptoms of something deeper. Everything in this quest should quietly pull toward a Shard, even if the player doesn't know it yet.`
  }

  // Append the designer's quest flow as narrative scaffolding (without exposing it verbatim)
  if (questStructure && typeof questStructure === 'object') {
    const flow = (questStructure as { flow?: { nodes?: Array<{ id: string; kind: string; data?: Record<string, unknown> }>; edges?: Array<{ source: string; target: string }> } }).flow
    if (flow?.nodes?.length) {
      const beats = flow.nodes
        .map(n => {
          const d = n.data ?? {}
          const label = (d.label as string) ?? n.kind
          const desc = (d.description as string) ?? ''
          const extras: string[] = []
          if (n.kind === 'encounter' && d.monsters) extras.push(`monsters: ${d.monsters}`)
          if (n.kind === 'npc' && d.npc_name) extras.push(`npc: ${d.npc_name}`)
          if (n.kind === 'skill_check' && d.ability) extras.push(`check: ${d.ability}${d.dc ? ` DC ${d.dc}` : ''}`)
          if (n.kind === 'choice' && d.outcomes) extras.push(`outcomes: ${(d.outcomes as string).replace(/\n/g, ' / ')}`)
          if (n.kind === 'reward' && d.reward) extras.push(`reward: ${d.reward}`)
          const tail = extras.length ? ` [${extras.join('; ')}]` : ''
          return `- (${n.id}) ${n.kind.toUpperCase()} :: ${label}${desc ? ` — ${desc}` : ''}${tail}`
        })
        .join('\n')
      const edges = (flow.edges ?? []).map(e => `${e.source} -> ${e.target}`).join(', ')
      systemPrompt += `

## Designer's Quest Outline (CRITICAL — follow this flow)
The designer has authored this quest as a directed graph of beats. Use this as your skeleton: introduce these beats in roughly this order, honor the branches, and steer the player back to the main thread when they wander. NEVER read this list aloud — it is your private outline.

Beats:
${beats}

Connections: ${edges || '(none yet)'}

Use the Hook beat as the opening, weave through Scenes and Encounters, present Choices as genuine forks, narrate Skill Checks with appropriate tension, deliver Rewards meaningfully, and culminate in the Goal. The Goal should reveal the Shard-tied truth at the heart of the quest.`
    }
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
