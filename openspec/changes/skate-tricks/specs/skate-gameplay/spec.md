## ADDED Requirements

### Requirement: Named air tricks
The game SHALL provide three distinct named air tricks — an ollie, a kickflip, and a pop shove-it — each performed by its own control while the skater is airborne, each with a distinct animation, and each awarding a trick-specific point value (reflecting difficulty) into the current combo. Performing a trick while grounded SHALL have no effect.

#### Scenario: Distinct controls perform distinct tricks
- **WHEN** the airborne skater presses the ollie, kickflip, or pop-shove-it control
- **THEN** the corresponding named trick is performed with its own animation

#### Scenario: Trick-specific points
- **WHEN** a trick completes in the air
- **THEN** its trick-specific point value is added to the combo (different tricks award different amounts)
- **AND** an on-screen cue names the trick and its points

#### Scenario: Tricks are air-only
- **WHEN** a trick control is pressed while the skater is on the ground
- **THEN** no trick is performed

#### Scenario: Landing mid-trick bails
- **WHEN** the skater lands before the trick animation completes
- **THEN** the trick does not score and the current combo is lost (a bail)
