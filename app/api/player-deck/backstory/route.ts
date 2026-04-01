import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { race, subrace, charClass, subclass, background, alignment, name, personality, ideals, bonds, flaws, appearance, field } = body

  if (!race || !charClass) {
    return NextResponse.json({ error: 'Missing race or class' }, { status: 400 })
  }

  // field = which section to generate: 'backstory' | 'personality' | 'all'
  const generateField = field || 'all'

  const charSummary = [
    name ? `Name: ${name}` : null,
    `Race: ${subrace ? `${subrace} ` : ''}${race}`,
    `Class: ${subclass ? `${subclass} ` : ''}${charClass}`,
    background ? `Background: ${background}` : null,
    alignment ? `Alignment: ${alignment}` : null,
    appearance ? `Appearance: ${appearance}` : null,
    personality ? `Existing personality: ${personality}` : null,
    ideals ? `Existing ideals: ${ideals}` : null,
    bonds ? `Existing bonds: ${bonds}` : null,
    flaws ? `Existing flaws: ${flaws}` : null,
  ].filter(Boolean).join('\n')

  let systemPrompt: string
  let userPrompt: string

  if (generateField === 'backstory') {
    systemPrompt = `You are a D&D character backstory writer. Write compelling, concise backstories for player characters. Keep it 3-5 sentences — evocative but not overwrought. Include a hook (an unresolved question or motivation) that can drive gameplay. Match the tone to the character's alignment and class.`
    userPrompt = `Write a backstory for this character:\n${charSummary}\n\nWrite ONLY the backstory text, no labels or headers.`
  } else if (generateField === 'personality') {
    systemPrompt = `You are a D&D character personality writer. Generate personality traits, ideals, bonds, and flaws for player characters. Keep each section to 1-2 sentences. Make them specific and actionable during gameplay — traits a player can actually roleplay at the table.`
    userPrompt = `Generate personality details for this character:\n${charSummary}\n\nRespond in exactly this format (include the labels):\nPERSONALITY: [1-2 sentences]\nIDEALS: [1-2 sentences]\nBONDS: [1 sentence]\nFLAWS: [1 sentence]`
  } else {
    systemPrompt = `You are a D&D character backstory and personality writer. Generate a complete character personality profile and backstory. Keep backstory to 3-5 sentences with a gameplay hook. Keep personality/ideals/bonds/flaws to 1-2 sentences each. Be specific and actionable for live gameplay.`
    userPrompt = `Generate a full personality profile and backstory for this character:\n${charSummary}\n\nRespond in exactly this format (include the labels):\nPERSONALITY: [1-2 sentences]\nIDEALS: [1-2 sentences]\nBONDS: [1 sentence]\nFLAWS: [1 sentence]\nBACKSTORY: [3-5 sentences]`
  }

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  return result.toTextStreamResponse()
}
