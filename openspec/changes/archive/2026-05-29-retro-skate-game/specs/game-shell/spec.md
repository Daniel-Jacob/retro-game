## ADDED Requirements

### Requirement: Application bootstrap
The game SHALL initialize a Phaser 3 application configured for pixel-art rendering and load global assets and band configuration before presenting any interactive scene.

#### Scenario: Game loads in the browser
- **WHEN** a user opens the game URL in a modern browser
- **THEN** the Phaser application initializes with pixel-art rendering enabled
- **AND** a boot/loading state runs while global assets and band configuration load
- **AND** the band-selection scene is shown once loading completes

#### Scenario: Missing or invalid band configuration
- **WHEN** the band configuration fails to load or contains no bands
- **THEN** the game displays a readable error message instead of a blank screen

### Requirement: Scene flow
The game SHALL progress through an ordered set of scenes: boot → band selection → hallway intro → skate gameplay → game over, and SHALL allow returning to band selection from game over.

#### Scenario: Forward progression
- **WHEN** a scene completes its purpose (loading done, band picked, hallway entered, run ended)
- **THEN** the game transitions to the next scene in the defined order

#### Scenario: Replay from game over
- **WHEN** the player chooses to play again from the game-over scene
- **THEN** the game returns to the band-selection scene

### Requirement: Shared session state
The game SHALL maintain shared session state (at minimum the selected band id and mute setting) accessible to all scenes without re-passing it through scene transitions.

#### Scenario: Selected band is available downstream
- **WHEN** a band is selected in the band-selection scene
- **THEN** the hallway, gameplay, and music systems can read the selected band id from shared state

### Requirement: Responsive scaling
The game SHALL scale its fixed internal resolution to fit the browser window while preserving the pixel-art aspect and crispness.

#### Scenario: Window resize
- **WHEN** the browser window is resized
- **THEN** the game canvas scales to fit without distorting the pixel-art proportions
