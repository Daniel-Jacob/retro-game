## MODIFIED Requirements

### Requirement: Band character roster
The band-selection scene SHALL present exactly five selectable band characters: blink-182, Green Day, Linkin Park, Sum 41, and Avril Lavigne. Each character SHALL be rendered as a recognizable, visually distinct figure with a band-specific signature look (hairstyle, outfit, accessory, and palette), at a fidelity high enough that players can tell the bands apart at a glance — using original stylized art, with no real-person likenesses or trademarked logos.

#### Scenario: Roster is displayed
- **WHEN** the band-selection scene is shown
- **THEN** all five band characters are displayed as selectable options, each with its name label and a recognizable, higher-fidelity character figure

#### Scenario: Characters are visually distinct
- **WHEN** the five characters are shown together
- **THEN** each is clearly distinguishable from the others by its signature look (not generic recolors of the same figure)

### Requirement: Selecting a band
The player SHALL be able to select one band character, and that selection SHALL lock in the band theme (character, logo, and song) for the session. The selection screen SHALL present each band on a polished, themed card and SHALL show a clear focused/selected state.

#### Scenario: Player picks a band
- **WHEN** the player selects one of the five band characters
- **THEN** the selected band id is stored in shared session state
- **AND** the game proceeds to the hallway intro scene for that band

#### Scenario: Selection highlights the active choice
- **WHEN** the player moves focus or hovers between band options
- **THEN** the currently focused card is visually highlighted (e.g. scale and theme-colored glow) before confirmation
