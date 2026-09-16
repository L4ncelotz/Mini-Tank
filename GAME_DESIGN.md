# Mini Tank Duel — Game Design

## High-Level Concept

Mini Tank Duel is a small competitive single-player browser game where the player fights an AI-controlled tank in short top-down arena duels.

The game should feel like PvP even though the opponent is AI.

The experience should be:

- easy to understand
- quick to restart
- competitive
- readable
- skill-based
- replayable without requiring large amounts of content

## Core Gameplay Pillars

### 1. Positioning

Players should gain advantages by controlling angles, distance, and cover.

### 2. Prediction

Good players should be rewarded for anticipating movement and firing before the opponent reaches a position.

### 3. Ricochet

Wall bounces are a core combat mechanic.

Ricochet should allow:

- indirect attacks
- corner pressure
- escape-route denial
- trick shots
- tactical shots against covered opponents

## Camera

Top-down 2D.

The camera should remain readable and stable during normal play.

Small screen shake may be added later for impact feedback.

## Controls

Player controls:

- `W` — move forward
- `S` — reverse
- `A` — rotate left
- `D` — rotate right
- `Space` — fire
- `Shift` — short dash

There is no mouse aiming.

The tank fires in its facing direction.

## Tank Feel

Movement should be arcade-like with slight weight.

Desired behavior:

- responsive steering
- modest acceleration feel
- limited sliding
- reverse slower than forward movement
- rotation readable but not sluggish
- dash short enough to remain tactical

Avoid realistic tank physics.

## Match Structure

A match is Best-of-5.

The first side to win 3 rounds wins the match.

Target round duration:

- approximately 60–90 seconds
- faster rounds are acceptable when one player gains a strong advantage

Round flow:

1. spawn
2. short ready state
3. fight
4. round winner
5. short reset
6. next round

## Combat

Each tank has HP.

Initial tuning should stay simple.

Suggested starting values:

- Tank HP: 3
- Bullet damage: 1
- Fire cooldown: around 1 second
- Bullet bounce limit: 1
- Bullet lifetime: limited

These values are tuning defaults, not immutable rules.

## Bullets

Bullets should:

- move visibly
- have a clear direction
- collide with walls
- collide with tanks
- ricochet once
- disappear on the next wall collision after the allowed bounce
- disappear when lifetime expires

Bullet speed must allow reaction but still create pressure.

## Dash

Dash is a short movement burst.

It should:

- have a cooldown
- be visually readable
- not grant excessive invulnerability
- primarily help reposition or evade

Dash is a later implementation phase.

## Maps

Use handcrafted arenas.

Do not use procedural generation initially.

Initial map set:

### Open Arena

Purpose:

- movement
- direct aim
- spacing

### Crossfire

Purpose:

- ricochet opportunities
- side angles
- pressure around cover

### Corridor

Purpose:

- prediction
- lane control
- corner timing

Maps should be reasonably symmetrical to avoid obvious side advantage.

## AI Philosophy

The AI should feel like an opponent, not a turret.

It should consider:

- player position
- player facing direction
- distance
- line of sight
- nearby walls
- incoming bullets
- its own firing cooldown
- estimated player firing cooldown
- available cover
- safe movement options
- current tactical advantage

Possible tactical states:

- reposition
- engage
- evade
- pressure
- recover

The AI should have human-like reaction delays.

Difficulty should not simply increase aim accuracy.

## Ranked Bot Progression

Planned ranks:

- Bronze
- Silver
- Gold
- Platinum
- Diamond
- Master

Behavior progression:

### Bronze

- basic movement
- direct shots
- weak positioning

### Silver

- basic dodging
- better spacing

### Gold

- uses cover
- safer repositioning

### Platinum

- movement prediction
- pressure after player fires

### Diamond

- stronger timing
- more advanced evasive behavior
- begins deliberate ricochet use

### Master

- combines available systems well
- strong positioning
- strong timing
- strong ricochet decisions

No rank may use impossible reaction times or hidden information.

## Visual Direction

Style:

- minimal
- futuristic
- arcade
- geometric
- readable

Avoid detailed military realism.

Use simple Canvas shapes for:

- tanks
- projectiles
- walls
- effects
- HUD

Visual priority:

1. gameplay readability
2. tank silhouette
3. projectile readability
4. hit feedback
5. polish

## Audio Direction

Audio comes after core gameplay.

Desired sounds:

- firing
- ricochet
- hit
- round win
- match win
- dash

Use lightweight browser audio.

## Out of Scope for Initial Version

Do not build these initially:

- online multiplayer
- accounts
- backend
- database
- shop
- skins
- battle pass
- large weapon system
- procedural maps
- campaign
- complex progression tree
