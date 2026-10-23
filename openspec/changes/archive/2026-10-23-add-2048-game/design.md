# Design

## Context

Greenfield: the repository contains only OpenSpec configuration. Stack is fixed by the user: React + TypeScript, MUI for UI components. Requirements are in `specs/game-rules/spec.md` and `specs/game-interface/spec.md`.

## Goals / Non-Goals

**Goals:**
- All game rules in one pure, framework-free module that is unit-testable with deterministic randomness.
- Sliding animation driven by CSS transitions, with no animation library and no timers in game state.

**Non-Goals:**
- Global state libraries (Redux, Zustand). One screen does not need them.
- A custom MUI theme palette for tile colors. A plain lookup map is simpler.
- Server-side rendering, routing, PWA/offline support.

## Decisions

### 1. Tooling: Vite `react-ts` template + Vitest
`npm create vite@latest . -- --template react-ts` provides dev server, build and TS config. Vitest reuses the Vite config, so tests need no extra setup.
Alternatives: Create React App (deprecated), Next.js (routing and SSR not needed).

### 2. File layout
```
src/
  game/engine.ts        pure rules: types, newGame, move, undo, status
  game/engine.test.ts   Vitest unit tests for game-rules scenarios
  storage.ts            localStorage read/write with try/catch fallback
  Board.tsx             grid background + absolutely positioned tiles, swipe handling
  App.tsx               reducer, keyboard listener, header controls, dialogs, theme
  main.tsx              Vite entry
```

### 3. Tiles carry stable ids
```ts
type Tile = { id: number; value: number; row: number; col: number; consumed?: boolean };
type Snapshot = { tiles: Tile[]; score: number; nextId: number };
type GameState = Snapshot & { size: number; history: Snapshot[]; keepPlaying: boolean };
```
React keys tiles by `id`, so a tile that changes cell is the same DOM node and its CSS `transform` transition shows the slide. A `number[][]` grid was rejected because it loses tile identity and cannot animate slides.

`nextId` lives in state (not a module counter) so the engine stays pure and tests are reproducible.

### 4. Merge representation: consumed tiles linger for one move
On merge, the tile nearest the edge keeps its id and doubles its value (a move-local flag prevents a second merge). The other tile moves to the same cell and is flagged `consumed`. Consumed tiles are still rendered (below the survivor) so they visibly slide into the merge. They are dropped at the start of the next `move`, `undo` or `newGame`, and are ignored for occupancy and game-over checks.
Alternative considered: a `setTimeout` to remove merged tiles after the transition. Rejected because it puts timers into state updates and races with fast input.

### 5. Status is derived, not stored
`status(state)` returns `won` if a 2048 tile exists and `!keepPlaying`, else `over` if no move is possible, else `playing`. Won is checked first so a winning final move still shows the win; after "keep playing" the game-over check applies. Undo then re-evaluates state for free: undoing out of game over, or undoing the winning move, needs no special cases. `keepPlaying` is a per-game flag, not part of undo snapshots.

### 6. Randomness is passed in through the action
`move(state, dir, rand)` and `newGame(size, rand)` take `rand: () => number`. The React reducer must stay pure (StrictMode runs reducers twice in development), so the component draws the random numbers before dispatching: `dispatch({ type: 'move', dir, rolls: [Math.random(), Math.random()] })`. The reducer wraps them in a `rand` function. Tests pass fixed sequences.

### 7. Move algorithm
For each line along the direction, take the non-consumed tiles ordered from the destination edge, walk them, and merge a tile into the previous one when values match and the previous one is not already merged this move. Assign positions from the edge outward. If no tile's position or value changed, return the original state unchanged (no spawn, no history push). Otherwise push the previous snapshot to `history`, spawn one tile, add merge values to `score`.

### 8. Undo
`undo` pops the last snapshot from `history` and restores `tiles`, `score` and `nextId`. Restoring `nextId` is harmless because ids only need to be unique among rendered tiles. Undo is rendered without slide by toggling a `noTransition` flag on the board for that render (the reducer records the last action type).

### 9. Rendering
- The board is a `Paper` with `container-type: inline-size`. It is `min(92vw, 480px)` square, and cell size is `100cqw / size` minus gaps.
- Background cells come from a static CSS grid. Tiles are absolutely positioned with `transform: translate(col * step, row * step)` and `transition: transform 100ms ease-in-out`.
- Pop: an inner element is keyed by `` `${id}-${value}` `` and runs a CSS keyframe scale animation on mount. That covers both spawns (new id) and merges (new value) without extra state.
- Font size scales with `cqw` and digit count, so 4-digit values fit on 6x6.
- Reduced motion uses `useMediaQuery('(prefers-reduced-motion: reduce)')` and sets `transition: none` and `animation: none`.

### 10. Input
- Keyboard: one `keydown` listener on `window` in `App`. It maps arrows and WASD, calls `preventDefault` on handled keys, and ignores input while a dialog is open (status `won` or `over`).
- Swipe: `pointerdown`/`pointerup` on the board with `touch-action: none`. Dominant axis of the delta, ignored below 30 px.
- Rapid input: every key dispatches immediately. CSS transitions retarget mid-flight, so nothing is queued or dropped.

### 11. MUI usage
`ThemeProvider` + `CssBaseline` with `createTheme({ palette: { mode } })`. Components: `Typography`, `Chip` (score/best), `Button` (new game, undo), `ToggleButtonGroup` (size), `IconButton` (theme toggle, using the `@mui/icons-material` LightMode/DarkMode icons), `Paper` (board), `Dialog` (win/over). Tile colors come from a `Record<number, { bg: string; fg: string }>`, with values above 2048 sharing one color.

### 12. Persistence
`storage.ts` exposes `loadBest(): Record<number, number>`, `saveBest`, `loadTheme(): 'light' | 'dark' | null` and `saveTheme`. Every access is wrapped in `try/catch` and invalid JSON or shapes fall back to defaults. Keys: `2048.best`, `2048.theme`. The best score is updated in an effect when `score > best[size]`, so undo can never lower it.

## Risks / Trade-offs

- [MUI + Emotion add ~100 KB gzipped] → Accepted. The user chose MUI; this is a single-page game.
- [Unlimited undo history grows memory] → Each snapshot is at most 36 small objects. Even thousands of moves stay well under 1 MB.
- [Restoring `nextId` on undo could reuse an id still mounted mid-transition] → Undo renders without transitions and consumed tiles are dropped on undo, so no stale node shares an id.
- [Pointer swipe could conflict with page scroll on mobile] → `touch-action: none` applies only to the board element.
- [`cqw` units need a modern browser] → Supported in all evergreen browsers since 2023. Older browsers are out of scope.
