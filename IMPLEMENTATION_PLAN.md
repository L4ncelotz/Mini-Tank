# Mini Tank Duel — Implementation Plan

## Development Principle

Build the game in small playable increments.

Each phase should leave the project in a working state.

Do not implement future phases early.

---

## Phase 1 — Foundation

### Goal

Create a playable movement prototype.

### Scope

- Vite + TypeScript setup
- Canvas setup
- resize handling
- stable game loop
- keyboard input manager
- one controllable player tank
- forward movement
- reverse movement
- tank rotation
- arena boundaries
- minimal rendering

### Do Not Add Yet

- AI
- bullets
- HP
- rounds
- maps
- dash
- rank
- audio
- particles

### Completion Criteria

- player can drive around the arena
- movement is frame-rate stable
- tank cannot leave arena bounds
- build/typecheck succeeds

---

## Phase 2 — Basic Combat

### Goal

Add direct shooting.

### Scope

- Bullet entity
- fire input
- fire cooldown
- bullet movement
- bullet lifetime
- bullet vs wall collision
- bullet vs tank hit detection infrastructure

Add a stationary dummy target if needed for testing.

### Do Not Add Yet

- ricochet
- active AI
- round system

### Completion Criteria

- bullets fire consistently
- cooldown works
- collisions are reliable
- bullets are removed correctly

---

## Phase 3 — Ricochet

### Goal

Implement the core signature mechanic.

### Scope

- bullet reflection from walls
- maximum one bounce
- bounce counter
- readable bounce feedback
- remove bullet after disallowed additional wall collision

### Completion Criteria

- reflection direction is correct
- one-bounce limit is reliable
- behavior is deterministic enough to test

---

## Phase 4 — Match System

### Goal

Turn the prototype into an actual duel structure.

### Scope

- tank HP
- damage
- death
- round win
- round reset
- round score
- Best-of-5
- match win
- simple HUD

### Completion Criteria

- one side can win a round
- first to 3 round wins ends the match
- reset state is clean
- HUD reflects actual state

---

## Phase 5 — Basic AI

### Goal

Create a functional opponent.

### Scope

- AI-controlled tank using normal tank controls
- target awareness
- basic movement
- face player
- direct firing
- basic repositioning
- configurable reaction delay

### AI Constraint

The AI may not directly manipulate position or bypass cooldowns.

### Completion Criteria

- AI can independently fight the player
- AI uses the same gameplay rules
- reaction delay is visible
- no impossible aim

---

## Phase 6 — Defensive and Tactical AI

### Goal

Make the bot feel less mechanical.

### Scope

- incoming bullet detection
- evade behavior
- distance management
- safer repositioning
- simple cover awareness
- detect approximate player fire cooldown
- pressure player after a missed shot or recent fire

Possible states:

- reposition
- engage
- evade
- pressure
- recover

### Completion Criteria

- AI behavior visibly changes by situation
- AI can avoid some obvious incoming shots
- AI does not instantly dodge at fire time
- behavior remains readable

---

## Phase 7 — Arena Maps

### Goal

Introduce gameplay variety through geometry.

### Scope

Implement 3 handcrafted maps:

1. Open Arena
2. Crossfire
3. Corridor

Each map includes:

- dimensions
- wall geometry
- spawn points

### Completion Criteria

- all maps are playable
- spawn points are valid
- wall geometry does not trap tanks unintentionally
- maps produce meaningfully different fights

---

## Phase 8 — Dash and Game Feel

### Goal

Improve movement depth and feedback.

### Scope

- short dash
- dash cooldown
- dash feedback
- hit flash
- muzzle flash
- ricochet effect
- simple particles
- subtle screen shake

### Completion Criteria

- dash adds tactical value
- effects improve readability
- effects do not obscure gameplay

---

## Phase 9 — Audio

### Goal

Add lightweight game feedback.

### Scope

- fire sound
- ricochet sound
- hit sound
- dash sound
- round win sound
- match win sound

Use Web Audio API or lightweight local assets.

### Completion Criteria

- sound events match gameplay
- audio does not block game startup
- no unnecessary audio dependency

---

## Phase 10 — Ranked Bots

### Goal

Add replayable progression.

### Scope

Ranks:

- Bronze
- Silver
- Gold
- Platinum
- Diamond
- Master

Rank should primarily change AI behavior.

Possible progression:

- reaction timing
- positioning quality
- dodge quality
- cover use
- movement prediction
- pressure timing
- ricochet decision quality

### Important

Do not implement harder ranks as simple accuracy multipliers.

### Completion Criteria

- rank differences are behaviorally noticeable
- no rank cheats
- progression is stored locally

---

## Phase 11 — Local Stats and Final Polish

### Scope

- wins
- losses
- current rank
- match count
- basic settings
- balance pass
- final UI cleanup
- bug fixing

Optional only if still useful:

- recent match summary
- small accessibility settings

### Completion Criteria

- game can be opened and played without developer tools
- complete match loop is stable
- no critical gameplay bugs
- controls are explained in-game
