export type ThemeMode = 'light' | 'dark'
export type BestScores = Record<number, number>

const BEST_KEY = '2048.best'
const THEME_KEY = '2048.theme'

// Storage can be blocked (private mode, disabled site data) or hold garbage; never let that break the game.
function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // ignore: preferences just won't persist
  }
}

export function loadBest(): BestScores {
  try {
    const parsed: unknown = JSON.parse(read(BEST_KEY) ?? '{}')
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    return Object.fromEntries(
      Object.entries(parsed).filter(([, v]) => typeof v === 'number' && Number.isFinite(v) && v >= 0),
    )
  } catch {
    return {}
  }
}

export const saveBest = (best: BestScores) => write(BEST_KEY, JSON.stringify(best))

export function loadTheme(): ThemeMode | null {
  const v = read(THEME_KEY)
  return v === 'light' || v === 'dark' ? v : null
}

export const saveTheme = (mode: ThemeMode) => write(THEME_KEY, mode)
