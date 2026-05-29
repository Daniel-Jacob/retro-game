## ADDED Requirements

### Requirement: Skater movement
The skate gameplay scene SHALL render the selected band character on a skateboard in a side-scrolling level and SHALL respond to player input for moving and jumping under gravity.

#### Scenario: Moving and jumping
- **WHEN** the player presses movement and jump controls
- **THEN** the skater accelerates horizontally, jumps when on the ground, and falls under gravity

#### Scenario: Camera follows the skater
- **WHEN** the skater moves through the level
- **THEN** the camera scrolls to keep the skater in view

### Requirement: Ramps and air
The level SHALL include ramps that launch the skater into the air when ridden with sufficient speed, enabling air tricks.

#### Scenario: Launching off a ramp
- **WHEN** the skater rides up a ramp with forward speed
- **THEN** the skater is launched into an airborne state

#### Scenario: Air trick scoring
- **WHEN** the skater performs a trick input while airborne
- **THEN** trick points accrue and contribute to the current combo

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
