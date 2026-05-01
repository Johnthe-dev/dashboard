import { describe, it, expect } from 'vitest'
import { THEMES, THEME_COLORS, DEFAULT_THEME } from '../constants/themes'
import type { ThemeId } from '../types/theme'

const ALL_THEME_IDS: ThemeId[] = [
  'sticky-yellow',
  'sticky-pink',
  'ocean',
  'sage',
  'parchment',
  'slate',
  'midnight',
  'forest',
]

const HEX_RE = /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/

describe('THEMES constant', () => {
  it('has exactly 8 entries', () => {
    expect(THEMES).toHaveLength(8)
  })

  it('every entry has id, label, swatch, and colors fields', () => {
    for (const theme of THEMES) {
      expect(theme).toHaveProperty('id')
      expect(theme).toHaveProperty('label')
      expect(theme).toHaveProperty('swatch')
      expect(theme).toHaveProperty('colors')
      expect(typeof theme.id).toBe('string')
      expect(typeof theme.label).toBe('string')
      expect(typeof theme.swatch).toBe('string')
      expect(typeof theme.colors).toBe('object')
    }
  })

  it('every ThemeId appears exactly once in THEMES', () => {
    const ids = THEMES.map((t) => t.id)
    for (const expected of ALL_THEME_IDS) {
      expect(ids.filter((id) => id === expected)).toHaveLength(1)
    }
  })

  it('THEMES order is sticky-yellow, sticky-pink, ocean, sage, parchment, slate, midnight, forest', () => {
    const expectedOrder: ThemeId[] = [
      'sticky-yellow',
      'sticky-pink',
      'ocean',
      'sage',
      'parchment',
      'slate',
      'midnight',
      'forest',
    ]
    expect(THEMES.map((t) => t.id)).toEqual(expectedOrder)
  })
})

describe('THEME_COLORS constant', () => {
  const REQUIRED_FIELDS = ['bg', 'headerBg', 'text', 'textMuted', 'accent', 'border', 'inputBg'] as const

  it('has an entry for every ThemeId', () => {
    for (const id of ALL_THEME_IDS) {
      expect(THEME_COLORS).toHaveProperty(id)
    }
  })

  it('every entry has all required color fields', () => {
    for (const id of ALL_THEME_IDS) {
      const colors = THEME_COLORS[id]
      for (const field of REQUIRED_FIELDS) {
        expect(colors).toHaveProperty(field)
      }
    }
  })

  it('all color values are valid hex strings', () => {
    for (const id of ALL_THEME_IDS) {
      const colors = THEME_COLORS[id]
      for (const field of REQUIRED_FIELDS) {
        const value = colors[field]
        expect(value, `${id}.${field} should be a valid hex color`).toMatch(HEX_RE)
      }
    }
  })
})

describe('DEFAULT_THEME', () => {
  it('is sticky-yellow', () => {
    expect(DEFAULT_THEME).toBe('sticky-yellow')
  })

  it('exists in THEMES', () => {
    expect(THEMES.some((t) => t.id === DEFAULT_THEME)).toBe(true)
  })
})
