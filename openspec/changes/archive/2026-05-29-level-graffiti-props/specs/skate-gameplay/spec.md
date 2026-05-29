## ADDED Requirements

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
