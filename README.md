# 2048

The sliding-tile puzzle 2048 for the browser, built with React, TypeScript and MUI.

Combine equal tiles to reach the 2048 tile.

## Features

- Tiles slide with animation, and new and merged tiles pop
- Undo any number of moves, including after game over
- Board sizes 3x3, 4x4, 5x5 and 6x6
- A separate best score for each board size, saved in the browser
- Light and dark themes; follows your system setting until you choose one
- Option to keep playing after reaching 2048
- Keyboard and touch controls
- Animations turn off when your system asks for reduced motion

## Getting started

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Then open the URL that Vite prints (usually http://localhost:5173).

## Controls

| Action | Input |
|---|---|
| Move | Arrow keys, `W` `A` `S` `D`, or swipe on the board |
| Undo | **Undo** button |
| Restart | **New game** button |
| Change board size | `3×3` / `4×4` / `5×5` / `6×6` buttons (starts a new game) |
| Toggle theme | Sun/moon icon |

Reloading the page starts a new 4x4 game. The browser keeps only your best scores and your theme choice.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm test` | Run the unit tests (Vitest) |
| `npm run build` | Type-check and build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Lint with oxlint |

## Project structure

```
src/
  game/engine.ts       Game rules: move, merge, spawn, score, win/over, undo
  game/engine.test.ts  Tests for the rules
  storage.ts           Saves best scores and theme (falls back safely if storage is blocked)
  Board.tsx            Board, tiles, animations, swipe input
  App.tsx              Game state, keyboard input, controls, dialogs, theme
openspec/
  specs/               Behavior specs: game-rules, game-interface
  changes/archive/     Past change proposals, designs and task lists
```

The rules in `engine.ts` are pure functions that don't depend on React, so you can test them without a browser.

## Specs and workflow

Changes to this project are planned with [OpenSpec](https://github.com/Fission-AI/OpenSpec). The current behavior is described in `openspec/specs/`. In Claude Code, the `/opsx:explore`, `/opsx:propose`, `/opsx:apply` and `/opsx:archive` commands (stored in `.claude/`) take a change from idea to archived spec.

## License

[MIT](LICENSE)
