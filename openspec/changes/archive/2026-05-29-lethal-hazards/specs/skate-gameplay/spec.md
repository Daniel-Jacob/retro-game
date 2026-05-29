## MODIFIED Requirements

### Requirement: End of run
The gameplay scene SHALL end the run on a defined condition — reaching the level end, running out of time, or **colliding with a hazard (a crash/wipeout)** — and SHALL pass the final score to the game-over scene.

#### Scenario: Run completes
- **WHEN** the end-of-run condition is met (goal reached or timer expired)
- **THEN** the game transitions to the game-over scene showing the final score

#### Scenario: Run ends on a crash
- **WHEN** the player collides with a hazard
- **THEN** the run ends immediately and the game transitions to the game-over scene with the score earned so far, presented as a wipeout
