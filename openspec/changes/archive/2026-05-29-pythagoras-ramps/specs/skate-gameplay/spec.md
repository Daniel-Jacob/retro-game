## MODIFIED Requirements

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
