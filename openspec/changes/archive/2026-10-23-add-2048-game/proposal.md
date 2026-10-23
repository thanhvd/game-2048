# Proposal

## Why

The project is empty. This change builds a playable 2048 game in the browser as its first deliverable, with the extras chosen during exploration: undo, selectable board size, dark mode and continuing after 2048.

## What Changes

- New browser app (React + TypeScript, built with Vite, UI components from MUI).
- Core 2048 rules: slide and merge tiles in four directions, spawn a new tile after each move that changes the board, track score, detect win (2048 tile) and game over.
- Sliding tile animation, with a pop effect on spawned and merged tiles.
- Keyboard (arrow keys, WASD) and touch swipe input.
- Undo of any number of moves within the current game, restoring board and score exactly.
- Board size selection from 3x3 to 6x6; changing size starts a new game.
- Best score saved per board size across reloads.
- Light/dark theme toggle saved across reloads.
- Win dialog with "keep playing" and "new game"; game over dialog with "new game" and "undo".

## Capabilities

### New Capabilities
- `game-rules`: Board mechanics independent of presentation: moving and merging tiles, spawning, scoring, win/loss detection, undo and board size.
- `game-interface`: How the player sees and controls the game: board rendering, input, animation, dialogs, theme and saved preferences.

### Modified Capabilities

None.

## Impact

- New project scaffold: `package.json`, Vite config, `src/`.
- New dependencies: `react`, `react-dom`, `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`; dev: `vite`, `typescript`, `vitest`.
- Browser `localStorage` used for best scores and theme only. No backend.
- Out of scope: redo, saving an in-progress game across reloads, leaderboards, sound.
