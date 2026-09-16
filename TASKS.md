# Mini Tank Duel — Tasks

## Current Status

Phase 6 — Defensive and Tactical AI complete.

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
- [x] Phase 4 — Match System
  - [x] Add MATCH_CONFIG and match types
  - [x] Add reset method to Tank entity
  - [x] Implement RoundManager with Best-of-5 logic
  - [x] Integrate RoundManager and restart in Game coordinator
  - [x] Update Renderer with scoreboard and round state banners
  - [x] Write unit tests for RoundManager and match flow
  - [x] Run typecheck and production build
  - [x] Verify round transitions, score tracking, and match win in browser
- [x] Phase 5 — Basic AI
  - [x] Create AI configuration module AIConfig
  - [x] Implement AIController with target awareness and reaction delay
  - [x] Implement AI steering, facing player, and movement repositioning
  - [x] Implement AI direct firing using normal tank controls
  - [x] Integrate AIController into Game coordinator
  - [x] Update Renderer HUD labels for AI opponent
  - [x] Write unit tests for AIController logic and constraints
  - [x] Run typecheck and production build
  - [x] Verify AI duel behavior in live browser
- [x] Phase 6 — Defensive and Tactical AI
  - [x] Add tactical state types and config in AIConfig
  - [x] Implement incoming bullet detection with trajectory projection
  - [x] Implement evade behavior with reaction delay
  - [x] Implement player cooldown estimation and pressure state
  - [x] Implement recover and tactical repositioning states
  - [x] Integrate bullets into AIController update in Game coordinator
  - [x] Update Renderer HUD with AI tactical state indicator
  - [x] Write unit tests for defensive and tactical AI states
  - [x] Run typecheck and production build
  - [x] Verify defensive dodging, pressure windows, and readable state transitions in browser

## In Progress

None

## Next

- [ ] Phase 7 — Arena Maps
- [ ] Phase 8 — Dash and Game Feel
- [ ] Phase 9 — Audio
- [ ] Phase 10 — Ranked Bots
- [ ] Phase 11 — Local Stats and Final Polish

## Notes

Keep this file updated after each implementation task.

Do not mark tasks complete unless the implementation exists and the project checks pass.
