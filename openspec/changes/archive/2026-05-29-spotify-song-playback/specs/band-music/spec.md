## MODIFIED Requirements

### Requirement: Per-band song mapping
Each band SHALL map to a configurable track id (held server-side). The front-end SHALL obtain the playable preview URL for that track from the backend rather than reading a raw audio URL from config.

#### Scenario: Selecting a band picks its song
- **WHEN** a band is selected
- **THEN** the front-end requests the preview URL for that band from the backend
- **AND** the returned preview is the track used for playback

#### Scenario: No preview available
- **WHEN** a selected band's track has no preview, is unconfigured, or the backend cannot resolve it
- **THEN** the game continues to play silently without errors

### Requirement: Streaming playback
The game SHALL stream the resolved 30-second preview and loop it for the duration of play.

#### Scenario: Song streams and loops
- **WHEN** a band whose track resolves to a preview URL begins play
- **THEN** the preview streams from that URL and loops continuously while the player is in the hallway and gameplay scenes

#### Scenario: Playback failure is non-fatal
- **WHEN** the preview URL fails to load or stream
- **THEN** the game continues to run without crashing
