# Mini Tank Duel — Architecture

## Technical Direction

Use:

- Vite
- TypeScript
- HTML Canvas 2D
- Web Audio API
- localStorage

Do not use:

- React
- backend frameworks
- databases
- multiplayer networking
- heavy game engines
- unnecessary runtime dependencies

## Architecture Goals

The architecture should be:

- small
- understandable
- easy to modify
- suitable for AI-assisted development
- easy to debug
- deterministic where practical

Avoid architecture designed for hypothetical future scale.

## Suggested Project Structure

```text
src/
├─ main.ts
├─ game/
│  ├─ Game.ts
│  ├─ GameLoop.ts
│  └─ GameState.ts
├─ input/
│  └─ InputManager.ts
├─ entities/
│  ├─ Tank.ts
│  └─ Bullet.ts
├─ systems/
│  ├─ CollisionSystem.ts
│  ├─ CombatSystem.ts
│  └─ RoundManager.ts
├─ ai/
│  ├─ AIController.ts
│  └─ AIConfig.ts
├─ maps/
│  ├─ Arena.ts
│  └─ arenaData.ts
├─ rendering/
│  └─ Renderer.ts
├─ audio/
│  └─ AudioManager.ts
├─ storage/
│  └─ StatsStorage.ts
└─ config/
   └─ gameplay.ts
```

This is a guideline, not a requirement to create every file immediately.

Only create modules when the feature exists.

## Main Responsibilities

### `main.ts`

Responsible for:

- creating the canvas
- bootstrapping the game
- starting the game loop

Keep it small.

### `Game`

Responsible for:

- owning active game state
- coordinating major systems
- updating entities
- controlling current phase of play

It should not contain every low-level implementation detail.

### `GameLoop`

Responsible for:

- update timing
- fixed timestep or stable delta handling
- render scheduling

Gameplay behavior should not depend heavily on frame rate.

### `InputManager`

Responsible for:

- keyboard state
- pressed/released handling where needed
- exposing clean input queries

Do not place gameplay decisions inside input handling.

### `Tank`

Responsible for tank state such as:

- position
- rotation
- velocity or movement state
- HP
- fire cooldown
- dash cooldown when implemented

Player and AI should ideally use the same tank rules.

### `Bullet`

Responsible for:

- position
- direction
- speed
- bounce count
- lifetime
- owner

Bullet movement should remain simple and deterministic.

### `CollisionSystem`

Responsible for collision checks such as:

- tank vs arena walls
- bullet vs walls
- bullet vs tanks
- arena boundaries

Keep collision logic independent from rendering.

### `RoundManager`

Responsible for:

- round state
- score
- round resets
- Best-of-5 logic
- match completion

### `AIController`

Responsible for deciding AI actions.

It should output actions similar to player controls:

- accelerate
- reverse
- rotate
- fire
- dash later

The AI should not directly manipulate tank position or bypass normal gameplay rules.

### `Arena`

Responsible for:

- arena dimensions
- walls
- spawn points
- map-specific geometry

Maps should be data-driven where practical.

### `Renderer`

Responsible for drawing:

- background
- walls
- tanks
- bullets
- particles later
- HUD

Rendering should not modify gameplay state.

### `AudioManager`

Responsible for lightweight sound playback.

Implement only when the audio phase begins.

### `StatsStorage`

Responsible for local persistent data such as:

- rank
- wins
- losses
- match history summary if needed

Use localStorage only.

## Coordinate System

Use world-space coordinates for gameplay.

Canvas rendering should convert world state to pixels consistently.

Avoid mixing DOM layout coordinates with gameplay coordinates.

## Gameplay Configuration

Store important tuning constants in a central configuration module when they become relevant.

Examples:

```ts
export const PLAYER_CONFIG = {
  forwardSpeed: 220,
  reverseSpeed: 140,
  rotationSpeed: 2.6,
};

export const BULLET_CONFIG = {
  speed: 420,
  cooldown: 1.0,
  maxBounces: 1,
};
```

Exact values should be tuned through playtesting.

## Update Order

A reasonable update sequence:

```text
read input
↓
AI decision
↓
tank movement
↓
fire requests
↓
bullet movement
↓
collision resolution
↓
damage / deaths
↓
round state
↓
render
```

Adjust if implementation requires it, but keep order predictable.

## AI Design

Prefer one of:

- finite state machine
- utility scoring
- small hybrid of both

Do not use machine learning.

Recommended initial AI actions:

- choose movement direction
- choose rotation direction
- choose whether to fire

Later AI features may include:

- incoming bullet prediction
- cover scoring
- player cooldown estimation
- ricochet evaluation

## Testing Strategy

Prioritize deterministic tests for logic that is easy to isolate.

Good candidates:

- ricochet reflection
- round score
- Best-of-5 completion
- cooldown timing
- AI utility calculations
- map spawn validation

Manual verification is still required for game feel.

## Performance

This project is small.

Avoid premature optimization.

Basic targets:

- stable 60 FPS on ordinary desktop browsers
- minimal allocations inside hot update loops
- no unnecessary DOM updates every frame

Canvas 2D is sufficient.
