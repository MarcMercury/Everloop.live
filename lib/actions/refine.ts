'use server'

import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

/**
 * Refines rough notes into polished prose using AI
 * Uses the Vercel AI SDK's generateText for generation
 */
export async function refineNotesSimple(roughNotes: string): Promise<{
  success: boolean
  prose?: string
  error?: string
}> {
  if (!roughNotes || roughNotes.trim().length < 10) {
    return { success: false, error: 'Please provide at least a few words to refine.' }
  }

  try {
    const result = await generateText({
      model: openai('gpt-4o-mini'),
      system: `You are a fantasy novelist writing for the Everloop universe - a vast collaborative world where reality itself shifts and stories shape existence.

Your task is to transform rough notes into atmospheric, polished prose. Follow these guidelines:
- Write in an immersive, literary style suitable for fantasy fiction
- Maintain a slightly mystical, ancient tone
- Keep the original meaning and ideas, just elevate the prose
- Don't add new plot points or information not implied by the notes
- Output only the refined prose, no explanations or meta-commentary
- Match the apparent scope - if notes are brief, keep output concise`,
      prompt: `Transform these rough notes into polished fantasy prose:\n\n${roughNotes}`,
      maxOutputTokens: 1500,
    })

    return { success: true, prose: result.text }
  } catch (error) {
    console.error('Refine error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to refine notes' 
    }
  }
}
