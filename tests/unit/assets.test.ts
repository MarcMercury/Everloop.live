import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { assetUrl } from '@/lib/assets'

describe('assetUrl', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://abc.supabase.co/')
  })
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('maps public/-style paths into the site-assets bucket', () => {
    expect(assetUrl('/Maps/3D/bellroot-vale.glb')).toBe(
      'https://abc.supabase.co/storage/v1/object/public/site-assets/Maps/3D/bellroot-vale.glb',
    )
  })

  it('encodes spaces once, even if the input is already encoded', () => {
    const expected = 'https://abc.supabase.co/storage/v1/object/public/site-assets/Maps/New%20Structure%20Map.png'
    expect(assetUrl('/Maps/New Structure Map.png')).toBe(expected)
    expect(assetUrl('/Maps/New%20Structure%20Map.png')).toBe(expected)
  })
})
