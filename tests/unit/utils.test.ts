import { describe, expect, it } from 'vitest'
import { calculateReadingTime, slugify } from '@/lib/utils'

describe('slugify', () => {
  it('produces URL-safe slugs', () => {
    expect(slugify('  The Bell Tree & the Broken World!  ')).toBe('the-bell-tree-the-broken-world')
    expect(slugify('Rook_and--Myx')).toBe('rook-and-myx')
  })
})

describe('calculateReadingTime', () => {
  it('rounds up at 200 words per minute', () => {
    expect(calculateReadingTime(1)).toBe(1)
    expect(calculateReadingTime(401)).toBe(3)
  })
})
