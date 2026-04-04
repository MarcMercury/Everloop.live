// ═══════════════════════════════════════════════════════════
// ElevenLabs API Client - Voice & Audio Generation
// Uses official @elevenlabs/elevenlabs-js SDK
// Features: TTS, Sound Effects, Voice Management
// ═══════════════════════════════════════════════════════════

import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'

// ─── Client Singleton ───────────────────────────────────

let _client: ElevenLabsClient | null = null

function getClient(): ElevenLabsClient {
  if (!_client) {
    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!apiKey) {
      throw new Error('ELEVENLABS_API_KEY environment variable is not set')
    }
    _client = new ElevenLabsClient({ apiKey })
  }
  return _client
}

// ─── Voice Presets for Everloop ─────────────────────────

export const EVERLOOP_VOICE_PRESETS = {
  // Narrator voices for story reading and lore
  narrator_epic: {
    voiceId: 'pNInz6obpgDQGcFmaJgB', // Adam - deep, authoritative
    modelId: 'eleven_multilingual_v2',
    settings: { stability: 0.7, similarity_boost: 0.8 },
  },
  narrator_mystical: {
    voiceId: 'EXAVITQu4vr4xnSDxMaL', // Bella - warm, ethereal
    modelId: 'eleven_multilingual_v2',
    settings: { stability: 0.5, similarity_boost: 0.75 },
  },
  // DM voice for campaign narration
  dm_voice: {
    voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold - commanding
    modelId: 'eleven_multilingual_v2',
    settings: { stability: 0.6, similarity_boost: 0.85 },
  },
  // NPC voices for dialogue
  npc_gruff: {
    voiceId: 'SOYHLrjzK2X1ezoPC6cr', // Harry - gruff, older
    modelId: 'eleven_flash_v2_5',
    settings: { stability: 0.5, similarity_boost: 0.7 },
  },
  npc_gentle: {
    voiceId: 'MF3mGyEYCl7XYWbV9V6O', // Elli - soft, gentle
    modelId: 'eleven_flash_v2_5',
    settings: { stability: 0.6, similarity_boost: 0.75 },
  },
  npc_sinister: {
    voiceId: 'N2lVS1w4EtoT3dr4eOWO', // Callum - dark, intense
    modelId: 'eleven_multilingual_v2',
    settings: { stability: 0.4, similarity_boost: 0.8 },
  },
} as const

export type VoicePresetKey = keyof typeof EVERLOOP_VOICE_PRESETS

// ─── Stream to Buffer Helper ────────────────────────────

async function streamToBuffer(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (value) chunks.push(value)
  }
  return Buffer.concat(chunks)
}

// ─── Text to Speech ─────────────────────────────────────

export interface TTSOptions {
  text: string
  voiceId?: string
  preset?: VoicePresetKey
  modelId?: string
  stability?: number
  similarityBoost?: number
  outputFormat?: string
}

export async function textToSpeech(options: TTSOptions): Promise<Buffer> {
  const client = getClient()

  let voiceId = options.voiceId
  let modelId = options.modelId ?? 'eleven_multilingual_v2'
  let stability = options.stability
  let similarityBoost = options.similarityBoost

  // Apply preset if specified
  if (options.preset) {
    const preset = EVERLOOP_VOICE_PRESETS[options.preset]
    voiceId = voiceId ?? preset.voiceId
    modelId = modelId ?? preset.modelId
    stability = stability ?? preset.settings.stability
    similarityBoost = similarityBoost ?? preset.settings.similarity_boost
  }

  if (!voiceId) {
    throw new Error('Either voiceId or preset must be provided')
  }

  const audioStream = await client.textToSpeech.convert(voiceId, {
    text: options.text,
    modelId,
    voiceSettings: stability !== undefined || similarityBoost !== undefined
      ? {
          stability: stability ?? 0.5,
          similarityBoost: similarityBoost ?? 0.75,
        }
      : undefined,
  })

  // Collect stream into buffer
  return streamToBuffer(audioStream as unknown as ReadableStream<Uint8Array>)
}

// ─── Streaming Text to Speech ───────────────────────────

export async function textToSpeechStream(options: TTSOptions): Promise<ReadableStream> {
  const client = getClient()

  let voiceId = options.voiceId
  let modelId = options.modelId ?? 'eleven_multilingual_v2'
  let stability = options.stability
  let similarityBoost = options.similarityBoost

  if (options.preset) {
    const preset = EVERLOOP_VOICE_PRESETS[options.preset]
    voiceId = voiceId ?? preset.voiceId
    modelId = modelId ?? preset.modelId
    stability = stability ?? preset.settings.stability
    similarityBoost = similarityBoost ?? preset.settings.similarity_boost
  }

  if (!voiceId) {
    throw new Error('Either voiceId or preset must be provided')
  }

  const audioStream = await client.textToSpeech.stream(voiceId, {
    text: options.text,
    modelId,
    voiceSettings: stability !== undefined || similarityBoost !== undefined
      ? {
          stability: stability ?? 0.5,
          similarityBoost: similarityBoost ?? 0.75,
        }
      : undefined,
  })

  return audioStream as unknown as ReadableStream
}

// ─── Sound Effects Generation ───────────────────────────

export interface SoundEffectOptions {
  text: string
  duration_seconds?: number
  prompt_influence?: number
}

export async function generateSoundEffect(
  options: SoundEffectOptions
): Promise<Buffer> {
  const client = getClient()

  const audioStream = await client.textToSoundEffects.convert({
    text: options.text,
    durationSeconds: options.duration_seconds,
    promptInfluence: options.prompt_influence,
  })

  return streamToBuffer(audioStream as unknown as ReadableStream<Uint8Array>)
}

// ─── Voice Library ──────────────────────────────────────

export async function listVoices() {
  const client = getClient()
  return client.voices.search()
}

export async function getVoice(voiceId: string) {
  const client = getClient()
  return client.voices.get(voiceId)
}

// ─── Everloop-Specific Audio Helpers ────────────────────

/**
 * Generate atmospheric ambience for a campaign scene
 */
export async function generateSceneAmbience(
  sceneType: string,
  mood: string
): Promise<Buffer> {
  const prompts: Record<string, string> = {
    'combat_tense': 'Intense battle ambience with sword clashing, war drums, and distant explosions',
    'combat_chaotic': 'Chaotic battlefield with multiple weapons clashing, screams, and magical energy blasts',
    'exploration_mysterious': 'Mysterious dungeon ambience with echoing drips, distant whispers, and subtle magical hum',
    'exploration_peaceful': 'Peaceful forest ambience with birdsong, gentle breeze through leaves, and a babbling brook',
    'narrative_dark': 'Dark atmospheric drone with low rumbling, ominous wind, and faint otherworldly whispers',
    'narrative_triumphant': 'Triumphant fanfare with brass horns, celebratory drums, and cheering crowd',
    'social_peaceful': 'Busy tavern ambience with murmured conversations, clinking glasses, and crackling fireplace',
    'rest_peaceful': 'Calm campfire ambience with crackling fire, crickets, and gentle night breeze',
    'puzzle_mysterious': 'Mysterious puzzle room with mechanical ticking, glowing energy hum, and echoing stone chambers',
    'boss_tense': 'Epic boss encounter ambience with deep rumbling, crackling dark energy, and intense atmospheric tension',
  }

  const key = `${sceneType}_${mood}`
  const prompt = prompts[key] ?? `${mood} ${sceneType} fantasy RPG ambience`

  return generateSoundEffect({
    text: prompt,
    duration_seconds: 22,
    prompt_influence: 0.5,
  })
}

/**
 * Generate narration audio for story content
 */
export async function narrateStoryExcerpt(
  text: string,
  tone: 'epic' | 'mystical' | 'dark' = 'epic'
): Promise<Buffer> {
  const presetMap: Record<string, VoicePresetKey> = {
    epic: 'narrator_epic',
    mystical: 'narrator_mystical',
    dark: 'npc_sinister',
  }

  return textToSpeech({
    text,
    preset: presetMap[tone],
  })
}

/**
 * Generate NPC dialogue audio for campaigns
 */
export async function generateNPCDialogue(
  text: string,
  voiceStyle: 'gruff' | 'gentle' | 'sinister' | 'commanding' = 'commanding'
): Promise<Buffer> {
  const presetMap: Record<string, VoicePresetKey> = {
    gruff: 'npc_gruff',
    gentle: 'npc_gentle',
    sinister: 'npc_sinister',
    commanding: 'dm_voice',
  }

  return textToSpeech({
    text,
    preset: presetMap[voiceStyle],
  })
}
