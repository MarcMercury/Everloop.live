'use server'

import { createClient } from '@/lib/supabase/server'
import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'
import OpenAI from 'openai'

// Initialize OpenAI client for embeddings
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Schema for the canon analysis response
const CanonAnalysisSchema = z.object({
  score: z.number().min(0).max(100).describe('Canon compatibility score from 0-100'),
  status: z.enum(['Approved', 'Review', 'Rejected']).describe('Overall status of the story'),
  feedback: z.array(z.string()).describe('Specific feedback points about lore consistency'),
  matchedEntities: z.array(z.string()).optional().describe('Names of canon entities found in the story'),
})

export type CanonAnalysisResult = z.infer<typeof CanonAnalysisSchema>

interface CanonEntity {
  id: string
  name: string
  type: string
  description: string | null
  extended_lore: Record<string, unknown> | null
  stability_rating: number | null
  status: string
  tags: string[] | null
  similarity: number
}

/**
 * Generates an embedding for text using OpenAI's text-embedding-3-small model
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openaiClient.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.slice(0, 8000), // Limit input to avoid token limits
  })
  
  return response.data[0].embedding
}

/**
 * Fetches relevant canon entities based on semantic similarity
 */
async function fetchRelevantCanon(embedding: number[]): Promise<CanonEntity[]> {
  const supabase = await createClient()
  
  // Call the RPC function to find similar canon entities
  // Using type assertion as the RPC function types can be complex
  const { data, error } = await supabase.rpc('match_canon_entities', {
    query_embedding: embedding,
    match_threshold: 0.5, // Lower threshold to catch more potential matches
    match_count: 10,
  } as unknown as undefined) as { data: CanonEntity[] | null; error: Error | null }
  
  if (error) {
    console.error('Error fetching canon entities:', error)
    return []
  }
  
  return (data as CanonEntity[]) || []
}

/**
 * Formats canon entities into context for the AI
 */
function formatCanonContext(entities: CanonEntity[]): string {
  if (entities.length === 0) {
    return 'No specific canon entities were found that match this story. The story should still follow the general tone and rules of the Everloop universe.'
  }
  
  return entities.map(entity => {
    const loreDetails = entity.extended_lore 
      ? Object.entries(entity.extended_lore)
          .map(([key, value]) => `  - ${key}: ${JSON.stringify(value)}`)
          .join('\n')
      : ''
    
    return `**${entity.name}** (${entity.type}, ${entity.status})
Description: ${entity.description || 'No description'}
Stability: ${entity.stability_rating || 'Unknown'}
${loreDetails ? `Lore Details:\n${loreDetails}` : ''}
Tags: ${entity.tags?.join(', ') || 'None'}
Similarity Match: ${(entity.similarity * 100).toFixed(1)}%`
  }).join('\n\n---\n\n')
}

/**
 * Main function to analyze story canon compatibility
 */
export async function analyzeStoryCanon(storyContent: string, storyTitle: string): Promise<{
  success: boolean
  analysis?: CanonAnalysisResult
  error?: string
}> {
  try {
    // Step 1: Generate embedding for the story
    const fullText = `${storyTitle}\n\n${storyContent}`
    const embedding = await generateEmbedding(fullText)
    
    // Step 2: Fetch relevant canon entities
    const relevantEntities = await fetchRelevantCanon(embedding)
    const canonContext = formatCanonContext(relevantEntities)
    
    // Step 3: Analyze with AI
    const systemPrompt = `You are the Canon Keeper of Everloop, a collaborative storytelling universe.

Your role is to analyze submitted stories for canon compatibility and provide constructive feedback.

## The Everloop Universe Rules:
1. There are exactly 13 Shards of power - no more, no less
2. The world has a dark, atmospheric, and mystical tone
3. Characters marked as 'canonical' are established and cannot be killed without proper narrative justification
4. Locations have specific characteristics that should be respected
5. Events in the timeline are fixed and cannot be contradicted

## Your Task:
Compare the User's Story against the provided Canon Context.

Check for:
1. **Contradictions** - Does the story contradict established facts? (e.g., killing a character marked alive, changing a location's nature)
2. **Tone Consistency** - Does the story match Everloop's dark, atmospheric, mystical tone?
3. **Lore Violations** - Does the story invent elements that break canon? (e.g., a 14th Shard, impossible events)
4. **Character Respect** - Are established characters portrayed consistently?

## Scoring Guide:
- 85-100: Fully canon compatible, ready for approval
- 50-84: Minor issues that need review, but generally acceptable
- 0-49: Significant lore violations that require revision

Be encouraging but honest. Help writers improve their stories to fit the universe.`

    const userPrompt = `## Canon Context (Relevant Lore):
${canonContext}

## Story to Analyze:
**Title:** ${storyTitle}

**Content:**
${storyContent}

---

Please analyze this story for canon compatibility and provide your assessment.`

    const { object: analysis } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: CanonAnalysisSchema,
      system: systemPrompt,
      prompt: userPrompt,
    })
    
    // Add matched entity names to the result
    const analysisWithEntities: CanonAnalysisResult = {
      ...analysis,
      matchedEntities: relevantEntities.map(e => e.name),
    }
    
    return {
      success: true,
      analysis: analysisWithEntities,
    }
  } catch (error) {
    console.error('Error analyzing story canon:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze story',
    }
  }
}

/**
 * Quick pre-check before full analysis (lighter weight)
 */
export async function quickCanonCheck(storyContent: string): Promise<{
  hasContent: boolean
  wordCount: number
  estimatedReadTime: number
}> {
  const wordCount = storyContent.trim().split(/\s+/).filter(w => w.length > 0).length
  const estimatedReadTime = Math.ceil(wordCount / 200) // ~200 words per minute
  
  return {
    hasContent: wordCount >= 50, // Minimum 50 words
    wordCount,
    estimatedReadTime,
  }
}
