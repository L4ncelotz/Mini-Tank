# Mini Tank Duel — Tasks

## Current Status

Phase 3 — Ricochet complete.

## Done

- [x] Phase 1 — Foundation
  - [x] Create Vite + TypeScript project
  - [x] Create Canvas
  - [x] Add resize handling
  - [x] Add stable game loop
  - [x] Add keyboard input manager
  - [x] Add player tank entity
  - [x] Add forward movement
  - [x] Add reverse movement
  - [x] Add rotation
  - [x] Add arena boundary collision
  - [x] Add minimal rendering
  - [x] Run typecheck
  - [x] Run build
  - [x] Verify controls manually
- [x] Phase 2 — Basic Combat
  - [x] Add bullet configuration and types
  - [x] Add fire input to InputManager
  - [x] Update Tank entity with cooldown and HP
  - [x] Implement Bullet entity
  - [x] Implement bullet collision and CombatSystem
  - [x] Update Renderer to draw bullets and dummy target
  - [x] Integrate CombatSystem into Game coordinator
  - [x] Write unit tests for combat and bullets
  - [x] Run typecheck and production build
  - [x] Verify firing, cooldown, and collisions in browser
- [x] Phase 3 — Ricochet
  - [x] Add maxBounces to bullet configuration and types
  - [x] Update Bullet entity with bounces and maxBounces
  - [x] Implement deterministic wall ricochet in CollisionSystem
  - [x] Add visual bounce feedback to Renderer
  - [x] Integrate bounce event handling in CombatSystem and Game
  - [x] Write unit tests for ricochet reflection and limits
  - [x] Run typecheck and production build
  - [x] Verify ricochet reflection, feedback, and one-bounce limit in browser

## In Progress

None

## Next

- [ ] Phase 4 — Match System
- [ ] Phase 5 — Basic AI
- [ ] Phase 6 — Defensive and Tactical AI
- [ ] Phase 7 — Arena Maps
- [ ] Phase 8 — Dash and Game Feel
- [ ] Phase 9 — Audio
- [ ] Phase 10 — Ranked Bots
- [ ] Phase 11 — Local Stats and Final Polish

## Notes

Keep this file updated after each implementation task.

Do not mark tasks complete unless the implementation exists and the project checks pass.
