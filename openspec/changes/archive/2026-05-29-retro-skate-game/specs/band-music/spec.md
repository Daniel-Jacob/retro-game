## ADDED Requirements

### Requirement: Per-band song mapping
Each band SHALL map to a configurable song URL, externalized in band configuration so it can change without modifying game logic.

#### Scenario: Selecting a band picks its song
- **WHEN** a band is selected
- **THEN** the song associated with that band's configured URL is the track used for playback

#### Scenario: Unset song URL
- **WHEN** a selected band has no configured song URL
- **THEN** the game continues to play silently without errors

### Requirement: Streaming playback
The game SHALL stream the band song from its URL and loop it for the duration of play.

#### Scenario: Song streams and loops
- **WHEN** a band with a configured song URL begins play
- **THEN** the song streams from the URL and loops continuously while the player is in the hallway and gameplay scenes

#### Scenario: Playback failure is non-fatal
- **WHEN** a song URL fails to load or stream
- **THEN** the game continues to run without crashing

### Requirement: Autoplay-compliant start
The game SHALL start audio only after a user gesture, to comply with browser autoplay policies.

#### Scenario: Audio waits for user gesture
- **WHEN** the page first loads with no user interaction
- **THEN** no audio plays until the player makes a selection gesture (band selection)

### Requirement: Volume and mute control
The player SHALL be able to mute/unmute and the mute state SHALL persist across scenes for the session.

#### Scenario: Toggling mute
- **WHEN** the player activates the mute control
- **THEN** audio is silenced
- **AND** the mute state remains in effect across scene transitions until toggled again
