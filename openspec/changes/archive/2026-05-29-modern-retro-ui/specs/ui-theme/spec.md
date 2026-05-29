## ADDED Requirements

### Requirement: Shared visual theme
The game SHALL define a single shared visual theme (palette, fonts, and reusable component styles) and SHALL apply it consistently across all scenes.

#### Scenario: Consistent styling across scenes
- **WHEN** any scene renders its UI (boot, band selection, hallway, gameplay HUD, game over)
- **THEN** it uses the shared theme's palette, fonts, and component styles rather than ad-hoc per-scene styling

### Requirement: Retro display typography
The theme SHALL provide a retro display font for headings/titles and a legible body font for labels and help text, and the game SHALL ensure fonts are loaded before the first interactive scene renders.

#### Scenario: Fonts ready before first screen
- **WHEN** the game finishes booting
- **THEN** the configured theme fonts are loaded
- **AND** the band-selection screen renders its text in those fonts without a fallback-font flash

#### Scenario: Font load failure is non-fatal
- **WHEN** a theme font fails to load
- **THEN** the game falls back to a system font and still runs

### Requirement: Crisp UI text
UI text SHALL render crisply (not heavily pixelated/blurred) even though game-world sprites use pixel-art rendering.

#### Scenario: Legible text at the display resolution
- **WHEN** the game is scaled to fit the browser window
- **THEN** headings and labels remain sharp and readable rather than visibly blocky

### Requirement: Retro CRT accents
The theme SHALL provide subtle retro accents (e.g. scanlines, vignette, and theme-colored glow on focused elements) that enhance the look without harming readability or performance.

#### Scenario: Accents applied subtly
- **WHEN** a scene shows the CRT/retro overlay
- **THEN** the scanline/vignette/glow accents are visible but text and characters remain clearly legible

### Requirement: Smooth scene transitions
Transitions between scenes SHALL use a smooth visual transition (e.g. a fade) rather than an instant cut.

#### Scenario: Fade between scenes
- **WHEN** the game moves from one scene to the next
- **THEN** it performs a brief fade-out/fade-in instead of an abrupt jump
