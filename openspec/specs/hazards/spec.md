# hazards Specification

## Purpose
Define the lethal obstructions in the skate level — ground hazards that approach the player and an airplane that drops falling containers — which are telegraphed and avoidable but end the run on collision.

## Requirements

### Requirement: Ground hazards
The skate level SHALL include moving ground hazards — other skateboarders and BMX bikers — that approach the player and SHALL end the run on contact.

#### Scenario: Ground hazard approaches
- **WHEN** a ground hazard is active
- **THEN** it moves toward the player along the ground at a readable speed

#### Scenario: Jumping a ground hazard
- **WHEN** the player jumps over an approaching ground hazard without touching it
- **THEN** the run continues

#### Scenario: Hitting a ground hazard
- **WHEN** the player collides with a ground hazard
- **THEN** the run ends in a game over

### Requirement: Airplane container drops
An airplane SHALL periodically cross overhead and drop falling containers that end the run on contact, with the landing point telegraphed before impact.

#### Scenario: Telegraphed drop
- **WHEN** the airplane drops a container
- **THEN** a landing marker is shown at the target location before the container reaches the ground

#### Scenario: Dodging a container
- **WHEN** the player moves clear of the container's landing path
- **THEN** the run continues

#### Scenario: Hit by a container
- **WHEN** a falling container collides with the player
- **THEN** the run ends in a game over

### Requirement: Hazards are fair and avoidable
Hazards SHALL be telegraphed and spaced so they can be avoided with normal movement and jumps; the start of a run SHALL have a brief hazard-free grace period.

#### Scenario: Clearable spacing
- **WHEN** multiple hazards are present
- **THEN** they are spaced and timed so the player can avoid them with jumps and movement

#### Scenario: Start grace
- **WHEN** a run begins
- **THEN** no hazard can hit the player during a brief initial grace period

### Requirement: Wipeout game over
A run that ends by hitting a hazard SHALL be presented as a wipeout (distinct from completing the run), carrying the score earned so far.

#### Scenario: Wipeout shown
- **WHEN** the run ends because the player hit a hazard
- **THEN** the game-over screen indicates a wipeout and shows the score earned so far
