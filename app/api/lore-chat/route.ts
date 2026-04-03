import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'
import OpenAI from 'openai'

export const runtime = 'nodejs'
export const maxDuration = 30

interface LoreEntity {
  id: string
  name: string
  type: string
  description: string | null
  extended_lore: Record<string, unknown> | null
  tags: string[] | null
  similarity: number
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const body = await request.json()
  const { question, history } = body as {
    question: string
    history?: Array<{ role: 'user' | 'assistant'; content: string }>
  }

  if (!question || typeof question !== 'string' || question.length > 2000) {
    return new Response(JSON.stringify({ error: 'Invalid question (max 2000 chars)' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    // Step 1: Generate embedding for the user's question
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: question.slice(0, 4000),
    })
    const embedding = embeddingResponse.data[0].embedding

    // Step 2: Retrieve relevant canon entities via vector similarity
    const { data: loreData, error: loreError } = await supabase.rpc('match_canon_entities', {
      query_embedding: embedding,
      match_threshold: 0.25,
      match_count: 10,
    } as unknown as undefined) as { data: LoreEntity[] | null; error: Error | null }

    if (loreError) {
      console.error('[Lore Chat] Vector search error:', loreError)
    }

    const entities = (loreData ?? []) as LoreEntity[]

    // Step 3: Also fetch canonical stories that might be relevant (keyword search)
    const keywords = question.split(/\s+/).filter(w => w.length > 3).slice(0, 3)
    let storyContext = ''
    if (keywords.length > 0) {
      const searchTerm = keywords[0]
      const { data: stories } = await supabase
        .from('stories')
        .select('title, summary')
        .eq('canon_status', 'canonical')
        .ilike('title', `%${searchTerm}%`)
        .limit(3)

      if (stories && stories.length > 0) {
        storyContext = (stories as Array<{ title: string; summary: string | null }>).map(s =>
          `Story: "${s.title}"\n${s.summary || ''}`
        ).join('\n\n---\n\n')
      }
    }

    // Step 4: Build RAG context
    const loreContext = entities.length > 0
      ? entities.map(e => {
          const loreDetails = e.extended_lore
            ? Object.entries(e.extended_lore)
                .filter(([key]) => key !== 'image_url')
                .map(([key, value]) => `  ${key}: ${JSON.stringify(value)}`)
                .join('\n')
            : ''
          return `**${e.name}** (${e.type}) [match: ${(e.similarity * 100).toFixed(0)}%]
${e.description || 'No description'}
${loreDetails ? loreDetails : ''}
Tags: ${e.tags?.join(', ') || 'none'}`
        }).join('\n\n---\n\n')
      : 'No specific lore entries matched this query.'

    // Step 5: Stream the AI response
    const systemPrompt = `You are the Lore Oracle of Everloop — the living memory of the world.

ROLE: Answer questions about the Everloop universe using ONLY the provided Lore Context. If the context doesn't contain the answer, say so honestly rather than inventing lore.

WORLD OVERVIEW:
- The Pattern is the vast lattice binding time, space, and thought — woven by the First Architects
- The Fray is the unraveling edge of reality where loops collapse
- Shards are broken remnants of the Anchors that once held the world together
- The Fold is the intermediary plane of thought and design
- The Drift is the primordial sea of chaos
- Canon entities have types: character, location, artifact, event, faction, concept, creature

RULES:
- Be precise. Cite entity names when referencing lore.
- If information conflicts, note the discrepancy.
- Never invent facts not in the provided context.
- If asked about something not in the lore, say "This isn't recorded in the current canon" rather than guessing.
- Keep answers concise but thorough. Use markdown formatting.
- Match the contemplative, high-function tone of Everloop.`

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
    ]

    // Inject conversation history (last 6 turns max)
    if (history && Array.isArray(history)) {
      const recent = history.slice(-6)
      for (const msg of recent) {
        messages.push({ role: msg.role, content: msg.content })
      }
    }

    messages.push({
      role: 'user',
      content: `## Lore Context (Retrieved from canon database):
${loreContext}

${storyContext ? `## Relevant Canon Stories:\n${storyContext}\n\n` : ''}## Question:
${question}`,
    })

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 800,
      temperature: 0.4,
      stream: true,
    })

    // Return as SSE stream
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          // Send matched entities as metadata first
          const meta = {
            type: 'meta',
            entities: entities.map(e => ({
              id: e.id,
              name: e.name,
              type: e.type,
              similarity: e.similarity,
            })),
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(meta)}\n\n`))

          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content
            if (content) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'text', content })}\n\n`)
              )
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (err) {
          console.error('[Lore Chat] Streaming error:', err)
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', content: 'Stream interrupted' })}\n\n`)
          )
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    console.error('[Lore Chat] Error:', err)
    return new Response(JSON.stringify({ error: 'Failed to process question' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
