import { describe, it, expect } from 'vitest'
import { MODULE_REGISTRY } from '../constants/modules'
import type { ModuleKind } from '../types/modules'

const ALL_MODULE_KINDS: ModuleKind[] = [
  'countdown-timer',
  'todo-list',
  'note-pad',
  'project-tracker',
  'lava-lamp',
  'kaleidoscope',
  'date-display',
  'wave-box',
  'habit-tracker',
  'pomodoro-timer',
  'quick-links',
  'mini-calendar',
  'sticky-notes',
]

describe('MODULE_REGISTRY constant', () => {
  it('has an entry for every ModuleKind', () => {
    for (const kind of ALL_MODULE_KINDS) {
      expect(MODULE_REGISTRY).toHaveProperty(kind)
    }
  })

  it('all 13 known module kinds are present', () => {
    const keys = Object.keys(MODULE_REGISTRY)
    expect(keys).toHaveLength(13)
    for (const kind of ALL_MODULE_KINDS) {
      expect(keys).toContain(kind)
    }
  })

  it('each entry has label, description, defaultW, defaultH, minW, minH', () => {
    for (const kind of ALL_MODULE_KINDS) {
      const entry = MODULE_REGISTRY[kind]
      expect(entry).toHaveProperty('label')
      expect(entry).toHaveProperty('description')
      expect(entry).toHaveProperty('defaultW')
      expect(entry).toHaveProperty('defaultH')
      expect(entry).toHaveProperty('minW')
      expect(entry).toHaveProperty('minH')
      expect(typeof entry.label).toBe('string')
      expect(typeof entry.description).toBe('string')
      expect(typeof entry.defaultW).toBe('number')
      expect(typeof entry.defaultH).toBe('number')
      expect(typeof entry.minW).toBe('number')
      expect(typeof entry.minH).toBe('number')
    }
  })

  it('defaultW >= minW for every entry', () => {
    for (const kind of ALL_MODULE_KINDS) {
      const entry = MODULE_REGISTRY[kind]
      expect(entry.defaultW, `${kind}: defaultW should be >= minW`).toBeGreaterThanOrEqual(entry.minW)
    }
  })

  it('defaultH >= minH for every entry', () => {
    for (const kind of ALL_MODULE_KINDS) {
      const entry = MODULE_REGISTRY[kind]
      expect(entry.defaultH, `${kind}: defaultH should be >= minH`).toBeGreaterThanOrEqual(entry.minH)
    }
  })

  it('if maxW is present, defaultW <= maxW', () => {
    for (const kind of ALL_MODULE_KINDS) {
      const entry = MODULE_REGISTRY[kind]
      if (entry.maxW !== undefined) {
        expect(entry.defaultW, `${kind}: defaultW should be <= maxW`).toBeLessThanOrEqual(entry.maxW)
      }
    }
  })
})
