# Spec Delta

## Purpose

Defines how the player sees and controls the 2048 game in the browser: board display, input, animation, dialogs, theme, and which preferences persist across reloads.

## ADDED Requirements

### Requirement: Board display
The interface SHALL show the board as a square grid of the current size, each tile showing its value with a background color specific to that value. It SHALL also show the current score, the best score for the current size, a new game control, an undo control, a board size selector and a theme toggle.

#### Scenario: Initial screen
- **WHEN** the page loads
- **THEN** a 4x4 board with two tiles is shown along with score 0, the best score for 4x4, and the new game, undo, size and theme controls

#### Scenario: Large values stay readable
- **WHEN** a tile holds a value of 4 or more digits on a 6x6 board
- **THEN** the full value is visible inside the tile without overflow

### Requirement: Keyboard input
Arrow keys and W/A/S/D SHALL trigger moves up/left/down/right. Handled keys SHALL NOT scroll the page.

#### Scenario: Arrow key move
- **WHEN** the player presses the left arrow key
- **THEN** a left move is applied and the page does not scroll

### Requirement: Touch input
A swipe on the board SHALL trigger a move in the swipe's dominant direction. Swipes shorter than a minimum distance SHALL be ignored, and swiping on the board SHALL NOT scroll the page.

#### Scenario: Swipe up
- **WHEN** the player swipes mostly upward across the board on a touch screen
- **THEN** an up move is applied and the page does not scroll

#### Scenario: Tap is not a move
- **WHEN** the player taps the board without dragging
- **THEN** no move is applied

### Requirement: Tile animation
Tiles SHALL visibly slide from their old cell to their new cell when a move is applied. Spawned tiles and tiles produced by a merge SHALL play a short pop effect. Undo SHALL show the restored board without sliding. Moves entered during an animation SHALL be applied, not dropped.

#### Scenario: Slide on move
- **WHEN** a tile moves from column 4 to column 1
- **THEN** the tile is seen travelling across the row to column 1

#### Scenario: Rapid input
- **WHEN** the player presses two arrow keys in quick succession
- **THEN** both moves are applied in order

### Requirement: Reduced motion
When the operating system requests reduced motion, the interface SHALL show moves without sliding or pop animations.

#### Scenario: Reduced motion preference
- **WHEN** the user's system has reduced motion enabled and a move is applied
- **THEN** tiles appear in their new cells without animation

### Requirement: Win dialog
When the game enters the won state, the interface SHALL show a dialog offering "Keep playing" and "New game". Moves SHALL NOT be applied while the dialog is open.

#### Scenario: Keep playing from dialog
- **WHEN** the win dialog is open and the player chooses "Keep playing"
- **THEN** the dialog closes and the current game continues

### Requirement: Game over dialog
When the game enters the game over state, the interface SHALL show a dialog with the final score offering "New game" and "Undo".

#### Scenario: Undo from game over dialog
- **WHEN** the game over dialog is open and the player chooses "Undo"
- **THEN** the dialog closes and the last move is undone

### Requirement: New game control
The new game control SHALL start a new game on the current board size.

#### Scenario: Restart
- **WHEN** the player activates new game mid-game
- **THEN** a fresh game starts on the same board size with score 0 and no undo available

### Requirement: Undo control state
The undo control SHALL be disabled when there is nothing to undo.

#### Scenario: Undo disabled at start
- **WHEN** a new game has just started
- **THEN** the undo control is disabled

### Requirement: Theme
The interface SHALL support light and dark themes. Without a saved choice it SHALL follow the system color scheme. Toggling the theme SHALL apply immediately and SHALL persist across reloads.

#### Scenario: Persisted dark mode
- **WHEN** the player switches to dark mode and reloads the page
- **THEN** the page loads in dark mode

### Requirement: Persistence
Best scores per board size and the theme choice SHALL persist across reloads. The in-progress game, the selected board size and undo history SHALL NOT persist; a reload starts a new 4x4 game. If saved data is missing or unreadable, the interface SHALL fall back to defaults without error.

#### Scenario: Best score survives reload
- **WHEN** the player reaches a best score of 500 on 5x5 and reloads
- **THEN** selecting 5x5 shows a best score of 500

#### Scenario: Storage unavailable
- **WHEN** browser storage is blocked or holds invalid data
- **THEN** the game loads with best scores of 0 and the system theme, and remains playable
