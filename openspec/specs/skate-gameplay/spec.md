# skate-gameplay Specification

## Purpose
Define the core skate gameplay scene: skater movement and jumping, ramps and air tricks, grinding, scoring/combos, and end-of-run handling.

## Requirements

### Requirement: Skater movement
The skate gameplay scene SHALL render the selected band character on a skateboard in a side-scrolling level and SHALL respond to player input for moving and jumping under gravity.

#### Scenario: Moving and jumping
- **WHEN** the player presses movement and jump controls
- **THEN** the skater accelerates horizontally, jumps when on the ground, and falls under gravity

#### Scenario: Camera follows the skater
- **WHEN** the skater moves through the level
- **THEN** the camera scrolls to keep the skater in view

### Requirement: Ramps and air
The level SHALL include ramps that launch the skater into the air when ridden with sufficient speed, enabling air tricks. Each ramp SHALL be right-triangular and SHALL carry a Pythagorean-theorem label (see the `pythagoras-ramps` capability); the launch/air behavior is unchanged by the labeling.

#### Scenario: Launching off a ramp
- **WHEN** the skater rides up a ramp with forward speed
- **THEN** the skater is launched into an airborne state

#### Scenario: Air trick scoring
- **WHEN** the skater performs a trick input while airborne
- **THEN** trick points accrue and contribute to the current combo

#### Scenario: Ramp shows its math label
- **WHEN** a ramp is on screen
- **THEN** it displays its Pythagorean-theorem label with values, without changing how it launches the skater

### Requirement: Grinding
The level SHALL include grindable rails/ledges, and the skater SHALL be able to grind along them when landing on a grind surface with sufficient horizontal speed.

#### Scenario: Entering a grind
- **WHEN** the skater lands on a rail/ledge grind surface while moving horizontally
- **THEN** the skater enters a grind state, locks to the rail, and accrues score over the grind duration

#### Scenario: Exiting a grind
- **WHEN** the rail ends or the player jumps off
- **THEN** the skater leaves the grind state and returns to normal movement

### Requirement: Scoring and combos
The game SHALL track a score and a combo multiplier that increases while tricks/grinds are chained without touching flat ground and banks on a clean landing.

#### Scenario: Combo banks on landing
- **WHEN** the skater chains tricks/grinds and then lands cleanly on the ground
- **THEN** the accumulated combo is multiplied into the score and the combo resets

#### Scenario: Bail resets combo
- **WHEN** the skater lands badly (e.g., mid-trick) or bails
- **THEN** the current combo is lost without banking

### Requirement: End of run
The gameplay scene SHALL end the run on a defined condition (reaching the level end or running out of time/lives) and SHALL pass the final score to the game-over scene.

#### Scenario: Run completes
- **WHEN** the end-of-run condition is met
- **THEN** the game transitions to the game-over scene showing the final score

### Requirement: Band graffiti backdrop
The skate level SHALL display graffiti of the selected band (its logo/tag, themed to the band's colors) on the level backdrop, scrolling with the world.

#### Scenario: Selected band's graffiti shown in the level
- **WHEN** the skate level is played for a selected band
- **THEN** the level backdrop shows that band's logo/tag graffiti
- **AND** a different selected band shows visibly different graffiti

#### Scenario: Graffiti does not obscure gameplay or HUD
- **WHEN** graffiti, gameplay elements, and the HUD are on screen
- **THEN** the graffiti sits behind the gameplay and the HUD remains readable

### Requirement: Retro prop obstacles
The level SHALL include retro prop obstacles — at minimum a record player, a tape recorder, and a generic retro soda stand (original styling, no trademarked branding) — rendered as original pixel art and placed on the level.

#### Scenario: Props are present and distinct
- **WHEN** the player skates through the level
- **THEN** retro props of more than one type are visible and visually distinguishable

#### Scenario: Props are solid
- **WHEN** the grounded skater runs into a prop
- **THEN** the prop blocks forward movement (it must be jumped or ramped over) rather than being passed through

### Requirement: Clearing a prop awards a bonus
When the skater clears a prop by passing over it while airborne, the game SHALL award bonus points and show an on-screen cue, counting each prop only once per run.

#### Scenario: Successful clear
- **WHEN** the airborne skater passes over a prop
- **THEN** a bonus is added to the score and a clear cue is shown

#### Scenario: No double counting
- **WHEN** the same prop is cleared again or hovered repeatedly
- **THEN** the bonus is awarded only once for that prop in the run

#### Scenario: Clearable by design
- **WHEN** a prop is placed in the level
- **THEN** it is positioned and sized so the skater can clear it with a normal jump or a nearby ramp
