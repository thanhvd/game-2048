# AGENTS.md

2048 browser game. Vite + React 19 + TypeScript + MUI. No backend.

## Commands

- `npm test`: Vitest unit tests (engine + storage)
- `npm run build`: `tsc -b` type-check, then Vite build. Test files are type-checked too.
- `npm run lint`: oxlint. Keep it warning-free.
- `npm run dev`: dev server

Before calling work done, run test, build and lint. For UI changes, also check the result in a browser.

## Specs come first

- `openspec/specs/game-rules` and `openspec/specs/game-interface` are the behavior contract. Read the relevant spec before changing behavior.
- New behavior goes through OpenSpec: `/opsx:explore` → `/opsx:propose` → `/opsx:apply` → `/opsx:archive`. Don't change spec'd behavior silently. If code and spec disagree, raise it.
- Past decisions and their reasoning are in `openspec/changes/archive/*/design.md`.

## Architecture invariants

- `src/game/engine.ts` is pure and has no React imports. All game rules live there; UI files never reimplement rules.
- Randomness is injected as `rand: () => number`. In `App.tsx`, random numbers are drawn **before** `dispatch` (`rolls`) because StrictMode runs reducers twice, so the reducer must stay pure.
- Tiles have stable `id`s; React keys on them so tiles can slide. Don't switch to a `number[][]` grid.
- On merge, the edge-side tile keeps its id and doubles. The other tile stays for one render with `consumed: true` so it can slide into the merge, and is dropped on the next `move`/`undo`. Consumed tiles never count for occupancy or game over.
- `status()` is derived, not stored: `won` (2048 tile and `!keepPlaying`) is checked before `over`.
- A move that changes nothing returns the **same state object**. Tests rely on this.
- Undo snapshots are `{ tiles, score, nextId }`. `keepPlaying` is not part of a snapshot.
- The best score lives in reducer state and only ever rises. The effect only writes it to storage.
- Every `localStorage` access goes through `src/storage.ts`, which uses try/catch and shape validation. Blocked or corrupt storage must never break the game.
- `Board.tsx` sizes everything in `cqw` (container query units) relative to the board width. The pop animation is keyed on `${id}-${value}`. Tiles with `id >= spawnFrom` get the spawn pop; others get the merge pop.

## Code style

- No semicolons, single quotes, 2-space indent. Match the existing files.
- Import MUI components per path (`@mui/material/Button`), not from the barrel.
- Comments only for non-obvious reasons, same density as now.
- Engine tests build boards with `fromGrid([[...]])` and use `seq(...)` for deterministic randomness.
