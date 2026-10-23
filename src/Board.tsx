import { useRef } from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import { keyframes } from '@mui/material/styles'
import type { Direction, Tile } from './game/engine'

const TILE_COLORS: Record<number, { bg: string; fg: string }> = {
  2: { bg: '#eee4da', fg: '#776e65' },
  4: { bg: '#ede0c8', fg: '#776e65' },
  8: { bg: '#f2b179', fg: '#f9f6f2' },
  16: { bg: '#f59563', fg: '#f9f6f2' },
  32: { bg: '#f67c5f', fg: '#f9f6f2' },
  64: { bg: '#f65e3b', fg: '#f9f6f2' },
  128: { bg: '#edcf72', fg: '#f9f6f2' },
  256: { bg: '#edcc61', fg: '#f9f6f2' },
  512: { bg: '#edc850', fg: '#f9f6f2' },
  1024: { bg: '#edc53f', fg: '#f9f6f2' },
  2048: { bg: '#edc22e', fg: '#f9f6f2' },
}
const SUPER_COLOR = { bg: '#3c3a32', fg: '#f9f6f2' }

const GAP = 3 // cqw: board sizes are expressed as % of the board width via container query units
const SLIDE_MS = 100
const MIN_SWIPE_PX = 30

const spawnPop = keyframes`from { transform: scale(0) } to { transform: scale(1) }`
const mergePop = keyframes`0% { transform: scale(1) } 50% { transform: scale(1.2) } 100% { transform: scale(1) }`

type Props = {
  size: number
  tiles: Tile[]
  spawnFrom: number // tiles with id >= spawnFrom appeared this move
  animate: boolean
  onSwipe: (dir: Direction) => void
}

export default function Board({ size, tiles, spawnFrom, animate, onSwipe }: Props) {
  const start = useRef<{ x: number; y: number } | null>(null)
  const cell = (100 - GAP * (size + 1)) / size
  const at = (row: number, col: number) =>
    `translate(${GAP + col * (cell + GAP)}cqw, ${GAP + row * (cell + GAP)}cqw)`
  const square = { position: 'absolute', top: 0, left: 0, width: `${cell}cqw`, height: `${cell}cqw`, borderRadius: 1 } as const

  const onPointerUp = (e: React.PointerEvent) => {
    if (!start.current) return
    const dx = e.clientX - start.current.x
    const dy = e.clientY - start.current.y
    start.current = null
    if (Math.max(Math.abs(dx), Math.abs(dy)) < MIN_SWIPE_PX) return
    if (Math.abs(dx) > Math.abs(dy)) onSwipe(dx > 0 ? 'right' : 'left')
    else onSwipe(dy > 0 ? 'down' : 'up')
  }

  return (
    <Paper
      elevation={0}
      role="grid"
      aria-label={`${size} by ${size} game board`}
      onPointerDown={(e) => (start.current = { x: e.clientX, y: e.clientY })}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (start.current = null)}
      sx={(theme) => ({
        position: 'relative',
        width: 'min(92vw, 480px)',
        aspectRatio: '1',
        containerType: 'inline-size',
        touchAction: 'none',
        userSelect: 'none',
        borderRadius: 2,
        bgcolor: theme.palette.mode === 'dark' ? '#3a3a3c' : '#bbada0',
      })}
    >
      {Array.from({ length: size * size }, (_, i) => (
        <Box
          key={`cell-${i}`}
          sx={(theme) => ({
            ...square,
            transform: at(Math.floor(i / size), i % size),
            bgcolor: theme.palette.mode === 'dark' ? '#4a4a4e' : '#cdc1b4',
          })}
        />
      ))}
      {tiles.map((t) => {
        const color = TILE_COLORS[t.value] ?? SUPER_COLOR
        const digits = String(t.value).length
        const pop = t.id >= spawnFrom ? spawnPop : mergePop
        return (
          <Box
            key={t.id}
            sx={{
              ...square,
              transform: at(t.row, t.col),
              transition: animate ? `transform ${SLIDE_MS}ms ease-in-out` : 'none',
              zIndex: t.consumed ? 1 : 2,
            }}
          >
            <Box
              key={`${t.id}-${t.value}`}
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 1,
                bgcolor: color.bg,
                color: color.fg,
                fontWeight: 700,
                fontSize: `${cell * (digits <= 2 ? 0.5 : digits === 3 ? 0.4 : digits === 4 ? 0.32 : 0.26)}cqw`,
                // Pop after the slide; backwards fill keeps a spawned tile hidden until then.
                animation: animate && !t.consumed ? `${pop} 150ms ease ${SLIDE_MS}ms backwards` : 'none',
              }}
            >
              {t.value}
            </Box>
          </Box>
        )
      })}
    </Paper>
  )
}
