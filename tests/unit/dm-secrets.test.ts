import { describe, expect, it, vi } from 'vitest'
import { attachDmSecrets, QUEST_NPC_PUBLIC_COLUMNS, QUEST_SCENE_PUBLIC_COLUMNS } from '@/lib/quests/columns'

type Client = Parameters<typeof attachDmSecrets>[0]

function queryResult(data: unknown, error: unknown = null) {
  const chain = { select: () => chain, eq: () => Promise.resolve({ data, error }) }
  return chain
}

describe('public column lists', () => {
  it('never include DM-only fields', () => {
    expect(QUEST_SCENE_PUBLIC_COLUMNS.split(', ')).not.toContain('dm_notes')
    expect(QUEST_NPC_PUBLIC_COLUMNS.split(', ')).not.toContain('secrets')
  })
})

describe('attachDmSecrets', () => {
  it('merges secrets returned by the RPC', async () => {
    const client = {
      rpc: vi.fn(async () => ({ data: { scenes: { s1: 'trapdoor' }, npcs: { n1: 'traitor' } }, error: null })),
      from: vi.fn(),
    } as unknown as Client
    const out = await attachDmSecrets(client, 'q', { scenes: [{ id: 's1' }, { id: 's2' }], npcs: [{ id: 'n1' }] })
    expect(out.scenes).toEqual([{ id: 's1', dm_notes: 'trapdoor' }, { id: 's2', dm_notes: null }])
    expect(out.npcs).toEqual([{ id: 'n1', secrets: 'traitor' }])
  })

  it('returns nulls without a direct read when the caller is not the DM', async () => {
    const from = vi.fn()
    const client = { rpc: vi.fn(async () => ({ data: null, error: null })), from } as unknown as Client
    const out = await attachDmSecrets(client, 'q', { scenes: [{ id: 's1' }] })
    expect(out.scenes).toEqual([{ id: 's1', dm_notes: null }])
    expect(from).not.toHaveBeenCalled()
  })

  it('falls back to direct column reads before the migration is applied', async () => {
    const client = {
      rpc: vi.fn(async () => ({ data: null, error: { message: 'function get_quest_dm_secrets does not exist' } })),
      from: vi.fn((table: string) =>
        table === 'quest_scenes'
          ? queryResult([{ id: 's1', dm_notes: 'old note' }])
          : queryResult([{ id: 'n1', secrets: 'old secret' }]),
      ),
    } as unknown as Client
    const out = await attachDmSecrets(client, 'q', { scenes: [{ id: 's1' }], npcs: [{ id: 'n1' }] })
    expect(out.scenes[0].dm_notes).toBe('old note')
    expect(out.npcs[0].secrets).toBe('old secret')
  })
})
