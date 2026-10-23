import { useEffect, useMemo, useReducer, useState } from 'react'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import CssBaseline from '@mui/material/CssBaseline'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import UndoIcon from '@mui/icons-material/Undo'
import Board from './Board'
import { type Direction, type GameState, keepPlaying, move, newGame, SIZES, status, undo } from './game/engine'
import { type BestScores, loadBest, loadTheme, saveBest, saveTheme, type ThemeMode } from './storage'

type State = { game: GameState; animate: boolean; best: BestScores }
// Random numbers are drawn before dispatch so the reducer stays pure (StrictMode runs it twice).
type Action =
  | { type: 'move'; dir: Direction; rolls: number[] }
  | { type: 'newGame'; size: number; rolls: number[] }
  | { type: 'undo' }
  | { type: 'keepPlaying' }

const rolls = () => Array.from({ length: 4 }, () => Math.random())
const fromRolls = (r: number[]) => {
  let i = 0
  return () => r[i++ % r.length]
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'move': {
      const game = move(state.game, action.dir, fromRolls(action.rolls))
      // Best only ever rises, so undo can't lower it.
      const best =
        game.score > (state.best[game.size] ?? 0) ? { ...state.best, [game.size]: game.score } : state.best
      return { game, animate: true, best }
    }
    case 'newGame':
      return { ...state, game: newGame(action.size, fromRolls(action.rolls)), animate: true }
    case 'undo':
      return { ...state, game: undo(state.game), animate: false }
    case 'keepPlaying':
      return { ...state, game: keepPlaying(state.game), animate: false }
  }
}

const KEYS: Record<string, Direction> = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', s: 'down', a: 'left', d: 'right',
  W: 'up', S: 'down', A: 'left', D: 'right',
}

export default function App() {
  const [{ game, animate, best }, dispatch] = useReducer(reducer, undefined, () => ({
    game: newGame(4),
    animate: true,
    best: loadBest(),
  }))
  const [savedTheme, setSavedTheme] = useState<ThemeMode | null>(loadTheme)
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)', { noSsr: true })
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)', { noSsr: true })
  const mode: ThemeMode = savedTheme ?? (prefersDark ? 'dark' : 'light')
  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode])

  const state = status(game)
  const bestForSize = best[game.size] ?? 0

  useEffect(() => saveBest(best), [best])

  useEffect(() => {
    if (state !== 'playing') return
    const onKey = (e: KeyboardEvent) => {
      const dir = KEYS[e.key]
      if (!dir || e.metaKey || e.ctrlKey || e.altKey) return
      e.preventDefault()
      dispatch({ type: 'move', dir, rolls: rolls() })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [state])

  const startNew = (size = game.size) => dispatch({ type: 'newGame', size, rolls: rolls() })
  const toggleTheme = () => {
    const next = mode === 'dark' ? 'light' : 'dark'
    setSavedTheme(next)
    saveTheme(next)
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm" sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Stack
          direction="row"
          sx={{ width: 'min(92vw, 480px)', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}
        >
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
            2048
          </Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Chip label={`Score ${game.score}`} color="primary" aria-live="polite" />
            <Chip label={`Best ${bestForSize}`} variant="outlined" />
            <IconButton onClick={toggleTheme} aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Stack>
        </Stack>

        <Stack
          direction="row"
          sx={{ width: 'min(92vw, 480px)', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}
        >
          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={() => startNew()}>
              New game
            </Button>
            <Button
              variant="outlined"
              startIcon={<UndoIcon />}
              disabled={game.history.length === 0}
              onClick={() => dispatch({ type: 'undo' })}
            >
              Undo
            </Button>
          </Stack>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={game.size}
            onChange={(_, size: number | null) => size && startNew(size)}
            aria-label="Board size"
          >
            {SIZES.map((s) => (
              <ToggleButton key={s} value={s}>
                {s}×{s}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>

        <Board
          size={game.size}
          tiles={game.tiles}
          spawnFrom={game.history.at(-1)?.nextId ?? 0}
          animate={animate && !reducedMotion}
          onSwipe={(dir) => state === 'playing' && dispatch({ type: 'move', dir, rolls: rolls() })}
        />

        <Typography variant="body2" color="text.secondary">
          Arrow keys or WASD to move · swipe on touch screens
        </Typography>
      </Container>

      <Dialog open={state === 'won'}>
        <DialogTitle>You win!</DialogTitle>
        <DialogContent>
          <DialogContentText>You reached 2048 with a score of {game.score}.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => startNew()}>New game</Button>
          <Button variant="contained" onClick={() => dispatch({ type: 'keepPlaying' })} autoFocus>
            Keep playing
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={state === 'over'}>
        <DialogTitle>Game over</DialogTitle>
        <DialogContent>
          <DialogContentText>Final score: {game.score}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => dispatch({ type: 'undo' })} disabled={game.history.length === 0}>
            Undo
          </Button>
          <Button variant="contained" onClick={() => startNew()} autoFocus>
            New game
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  )
}
