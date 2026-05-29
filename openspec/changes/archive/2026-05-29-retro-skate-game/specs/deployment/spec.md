## ADDED Requirements

### Requirement: Static production build
The project SHALL produce a static production build (HTML/JS/CSS/assets) suitable for serving by a static web server.

#### Scenario: Build succeeds
- **WHEN** the production build command is run
- **THEN** a static output directory is produced containing the playable game with hashed asset filenames

### Requirement: Rootless container image
The project SHALL provide a Docker image that serves the static game and SHALL run as a non-root user with no privilege escalation, compatible with OpenShift constraints.

#### Scenario: Image runs rootless
- **WHEN** the container image is run
- **THEN** the web server process runs as a non-root user on an unprivileged port without requiring privilege escalation or host networking

#### Scenario: Multi-stage build
- **WHEN** the image is built
- **THEN** a build stage compiles the static assets and a separate runtime stage serves them, keeping the runtime image free of build tooling

### Requirement: Serving the game
The container SHALL serve the game over HTTP such that opening the mapped port in a browser loads the playable game.

#### Scenario: Game is reachable
- **WHEN** the container is run and its HTTP port is mapped to the host
- **THEN** opening that port in a browser loads and runs the game

#### Scenario: Asset MIME types
- **WHEN** the browser requests JavaScript, image, and audio assets
- **THEN** the server returns them with correct content types so the game loads correctly

### Requirement: Documentation
The project SHALL document how to build, run, and configure the game, including the band-to-song-URL configuration and the copyright/licensing note for streamed songs.

#### Scenario: README covers build/run/config
- **WHEN** a deployer reads the project README
- **THEN** it explains how to build the image, run it, set per-band song URLs, and the licensing caveat for streaming real songs
