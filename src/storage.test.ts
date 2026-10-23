import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadBest, loadTheme, saveBest, saveTheme } from './storage'

const memoryStorage = (init: Record<string, string> = {}) => {
  const data = new Map(Object.entries(init))
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
  }
}

afterEach(() => vi.unstubAllGlobals())

describe('storage', () => {
  it('round-trips best scores and theme', () => {
    vi.stubGlobal('localStorage', memoryStorage())
    saveBest({ 4: 1200, 5: 500 })
    saveTheme('dark')
    expect(loadBest()).toEqual({ 4: 1200, 5: 500 })
    expect(loadTheme()).toBe('dark')
  })

  it('returns defaults for invalid data', () => {
    vi.stubGlobal('localStorage', memoryStorage({ '2048.best': '{not json', '2048.theme': 'purple' }))
    expect(loadBest()).toEqual({})
    expect(loadTheme()).toBeNull()
  })

  it('drops invalid best entries', () => {
    vi.stubGlobal('localStorage', memoryStorage({ '2048.best': '{"4": 100, "5": "x", "6": -1}' }))
    expect(loadBest()).toEqual({ 4: 100 })
  })

  it('returns defaults and does not throw when storage throws', () => {
    const boom = () => {
      throw new Error('blocked')
    }
    vi.stubGlobal('localStorage', { getItem: boom, setItem: boom })
    expect(loadBest()).toEqual({})
    expect(loadTheme()).toBeNull()
    expect(() => saveBest({ 4: 1 })).not.toThrow()
    expect(() => saveTheme('light')).not.toThrow()
  })
})
