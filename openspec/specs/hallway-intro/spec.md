# hallway-intro Specification

## Purpose
Define the side-scrolling graffiti hallway intro scene shown after band selection, which themes the walls to the chosen band, starts the band's music, and transitions into gameplay.

## Requirements

### Requirement: Graffiti hallway scene
After a band is selected, the game SHALL show a side-scrolling hallway intro scene whose walls display graffiti of the selected band's logo.

#### Scenario: Hallway shows the selected band's logo
- **WHEN** the hallway intro scene starts for a selected band
- **THEN** the hallway walls render graffiti using that band's logo/theme
- **AND** a band whose logo differs produces visibly different hallway graffiti

#### Scenario: No band selected
- **WHEN** the hallway scene is entered without a valid selected band in session state
- **THEN** the game returns to the band-selection scene instead of rendering an empty hallway

### Requirement: Transition into gameplay
The hallway intro SHALL move the player into the skate gameplay scene.

#### Scenario: Player advances through the hallway
- **WHEN** the player moves/skates to the end of the hallway or confirms to continue
- **THEN** the game transitions to the skate gameplay scene with the same band theme

### Requirement: Music starts in the hallway
The selected band's music SHALL begin playing when the hallway intro is entered (the first scene following the user's selection gesture).

#### Scenario: Theme music begins
- **WHEN** the hallway intro scene starts and a song URL is configured for the band
- **THEN** that band's song begins streaming and continues into gameplay
