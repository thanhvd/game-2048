# Tasks

## 1. Project setup

- [x] 1.1 Scaffold with `npm create vite@latest . -- --template react-ts`, remove the demo content (counter, logos, `App.css` boilerplate) and verify `npm run dev` serves a blank page without errors
- [x] 1.2 Install `@mui/material @mui/icons-material @emotion/react @emotion/styled` and dev dependency `vitest`, add a `"test": "vitest run"` script, and verify `npm run build` and `npm test` (with no tests yet, passing via `--passWithNoTests`) both succeed

## 2. Game engine (`src/game/engine.ts`)

- [x] 2.1 Define `Tile`, `Snapshot`, `GameState`, `Direction` types and implement `newGame(size, rand)`, verified by a test that a 4x4 game has 2 tiles, score 0 and empty history
- [x] 2.2 Implement `move(state, dir, rand)` slide and merge logic (design decisions 4 and 7), verified by tests for every slide and merge scenario in `specs/game-rules/spec.md` (`[0,2,0,4]`, `[2,2,4,0]`, `[2,2,2,2]`, `[2,2,2,0]` right, column down)
- [x] 2.3 Add scoring, spawning (90% 2 / 10% 4 into a random empty cell) and the no-change rule, verified by tests that merges add the merged values, a changing move spawns exactly one tile, and a blocked move returns the same state with no spawn or history entry
- [x] 2.4 Implement derived `status(state)` and `keepPlaying`, verified by tests for won on a 2048 tile, no won after keep playing, and over on a full board with no equal neighbors (with moves rejected)
- [x] 2.5 Implement `undo(state)`, verified by tests that move then undo restores tiles and score exactly, undo from game over returns to playing, undo with empty history is a no-op, and consumed tiles are dropped
- [x] 2.6 Verify sizes 3 to 6 work with a test that runs `newGame` and a move on each size

## 3. Persistence (`src/storage.ts`)

- [x] 3.1 Implement `loadBest`/`saveBest`/`loadTheme`/`saveTheme` with try/catch and shape validation, verified by tests that round-trip values and that invalid JSON or a throwing `localStorage` return defaults

## 4. Board rendering (`src/Board.tsx`)

- [x] 4.1 Render the static background grid and absolutely positioned tiles keyed by id with the tile color map and `cqw` font sizing, and verify in the browser that a seeded board on 4x4 and 6x6 shows correct values and colors, with a 4-digit value fitting a 6x6 tile
- [x] 4.2 Add the slide transition, the pop keyframe on an inner element keyed `${id}-${value}`, consumed tiles rendered beneath survivors, a `noTransition` mode for undo, and reduced-motion handling, then verify in the browser that tiles slide, merges and spawns pop, and with reduced motion enabled (DevTools rendering emulation) nothing animates

## 5. App wiring (`src/App.tsx`)

- [x] 5.1 Add the `useReducer` around the engine with actions `move` (carrying pre-drawn rolls), `undo`, `newGame`, `setSize`, `keepPlaying`, and verify in the browser that new game and size change reset the board and score
- [x] 5.2 Add the window `keydown` listener (arrows and WASD, `preventDefault`, ignored while a dialog is open) and verify in the browser that keys move tiles, the page does not scroll, and rapid presses apply in order
- [x] 5.3 Add pointer swipe on the board (30 px threshold, `touch-action: none`) and verify with DevTools touch emulation that swipes move in the dominant direction and taps do nothing
- [x] 5.4 Add the header: title, score and best `Chip`s, New game and Undo `Button`s (Undo disabled when history is empty), size `ToggleButtonGroup`, theme `IconButton`, and verify each control in the browser
- [x] 5.5 Add the win `Dialog` (Keep playing / New game) and game over `Dialog` (final score, New game / Undo), and verify both by temporarily seeding a near-win and a near-full board
- [x] 5.6 Wire `ThemeProvider` with the saved theme or system preference, and best-score saving per size, then verify that dark mode and a 5x5 best score both survive a reload and that blocking site data in the browser still loads a playable game

## 6. Integration check

- [x] 6.1 Run `npm test` and `npm run build` with zero failures, then play one full game to game over in the browser, using undo at least once, and confirm it behaves per both specs
