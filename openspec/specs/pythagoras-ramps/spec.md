# pythagoras-ramps Specification

## Purpose
Ramps are right triangles sized to Pythagorean triples and labeled with the theorem and its worked values, turning each ramp into a math lesson the player encounters while skating.

## Requirements

### Requirement: Ramps are right triangles sized to Pythagorean triples
Each ramp SHALL be a right triangle whose rise and run are proportional to a real Pythagorean triple `(a, b, c)`, so that the labeled side values satisfy `a² + b² = c²` exactly.

#### Scenario: Ramp geometry matches its triple
- **WHEN** a ramp is created from a triple `(a, b, c)`
- **THEN** its rise corresponds to `a`, its run to `b`, and its incline (hypotenuse) to `c`, scaled by a constant
- **AND** the displayed values satisfy `a² + b² = c²`

### Requirement: Pythagorean theorem label on each ramp
Each ramp SHALL display the Pythagorean theorem `a² + b² = c²` with the ramp's actual values filled in and worked out, and SHALL label the triangle's two legs and hypotenuse.

#### Scenario: Formula shown with values
- **WHEN** a ramp is on screen
- **THEN** the formula `a² + b² = c²` is shown with the ramp's numbers substituted (e.g. `3² + 4² = 5²`) and the worked result (e.g. `9 + 16 = 25`)

#### Scenario: Sides labeled
- **WHEN** a ramp is on screen
- **THEN** its rise leg is labeled `a`, its run leg `b`, and its incline `c` with their numeric values

### Requirement: Varied examples across the level
The level SHALL present more than one distinct Pythagorean triple across its ramps.

#### Scenario: Different ramps show different triples
- **WHEN** the player skates through the level past multiple ramps
- **THEN** at least two different triples (different value sets) are shown

### Requirement: Legible, world-anchored labels
Ramp labels SHALL be legible against the level and SHALL scroll with the ramp (anchored to the world, not fixed to the screen), without obscuring the HUD.

#### Scenario: Labels track their ramp
- **WHEN** the camera scrolls as the player moves
- **THEN** each ramp's labels move with that ramp and remain readable

#### Scenario: Labels do not block the HUD
- **WHEN** labels and the HUD are both on screen
- **THEN** the HUD (score, combo, timer) remains readable above the labels
