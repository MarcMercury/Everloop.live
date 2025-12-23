'use server'

import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'
import { 
  calculateReadabilityMetrics, 
  calculateSentenceMetrics,
  type ReadabilityMetrics,
  type SentenceMetrics 
} from '@/lib/utils/readability'

// Schema for voice/tone analysis
const VoiceToneSchema = z.object({
  overallTone: z.enum([
    'contemplative',
    'urgent', 
    'melancholic',
    'hopeful',
    'mysterious',
    'ominous',
    'whimsical',
    'formal',
    'intimate',
    'neutral'
  ]).describe('The dominant emotional tone of the writing'),
  
  voiceCharacteristics: z.array(z.object({
    trait: z.string().describe('A specific voice characteristic'),
    strength: z.number().min(0).max(100).describe('How strongly this trait is present (0-100)'),
    example: z.string().optional().describe('A brief quote demonstrating this trait'),
  })).describe('Key characteristics of the writing voice'),
  
  pacing: z.enum(['slow', 'measured', 'brisk', 'rapid', 'varied']).describe('The pacing/rhythm of the prose'),
  
  styleComparison: z.array(z.string()).max(3).describe('Authors or works with similar style (max 3)'),
  
  strengths: z.array(z.string()).max(4).describe('What the writing does well'),
  
  suggestions: z.array(z.object({
    area: z.string().describe('Area for potential improvement'),
    suggestion: z.string().describe('Specific actionable suggestion'),
    priority: z.enum(['low', 'medium', 'high']).describe('Priority level'),
  })).max(5).describe('Suggestions for improvement'),
  
  canonFit: z.object({
    score: z.number().min(0).max(100).describe('How well the voice fits Everloop canon style (0-100)'),
    notes: z.string().describe('Brief explanation of canon fit'),
  }).describe('How well the voice matches Everloop canonical style'),
})

export type VoiceToneAnalysis = z.infer<typeof VoiceToneSchema>

export interface FullVoiceAnalysis {
  voiceTone: VoiceToneAnalysis
  readability: ReadabilityMetrics
  sentences: SentenceMetrics
  analyzedAt: string
  wordCount: number
}

export async function analyzeVoiceTone(
  text: string
): Promise<{ success: boolean; analysis?: FullVoiceAnalysis; error?: string }> {
  try {
    if (!text || text.trim().length < 100) {
      return { success: false, error: 'Text must be at least 100 characters for analysis' }
    }

    const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length
    
    if (wordCount < 50) {
      return { success: false, error: 'Text must be at least 50 words for accurate analysis' }
    }

    // Calculate readability metrics synchronously
    const readability = calculateReadabilityMetrics(text)
    const sentences = calculateSentenceMetrics(text)

    // Get AI-powered voice/tone analysis
    const { object: voiceTone } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: VoiceToneSchema,
      prompt: `You are a literary analyst specializing in voice and tone analysis for the Everloop collaborative fiction universe. Everloop stories are characterized by a "contemplative, high-function, elegant" style.

Analyze the following text for voice and tone characteristics:

---
${text.slice(0, 6000)}
---

Provide detailed analysis of:
1. The overall emotional tone
2. Key voice characteristics with strength ratings
3. Pacing and rhythm
4. Similar authors/works for reference
5. Specific strengths of the writing
6. Actionable suggestions for improvement
7. How well the voice fits the Everloop canon style (contemplative, elegant, thoughtful)

Be specific and constructive. Reference the text where possible.`,
    })

    return {
      success: true,
      analysis: {
        voiceTone,
        readability,
        sentences,
        analyzedAt: new Date().toISOString(),
        wordCount,
      },
    }
  } catch (error) {
    console.error('Voice/tone analysis error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Analysis failed',
    }
  }
}

// Quick analysis for real-time indicators (lighter weight)
export async function getQuickToneIndicator(
  text: string
): Promise<{ tone: string; confidence: number } | null> {
  if (!text || text.length < 50) return null

  try {
    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: z.object({
        tone: z.string(),
        confidence: z.number().min(0).max(100),
      }),
      prompt: `In one word, what is the dominant tone of this text? Also rate your confidence (0-100).

Text: "${text.slice(0, 500)}"`,
    })

    return object
  } catch {
    return null
  }
}
