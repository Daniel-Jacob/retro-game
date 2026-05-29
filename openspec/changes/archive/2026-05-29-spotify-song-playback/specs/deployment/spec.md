## MODIFIED Requirements

### Requirement: Rootless container image
The project SHALL provide a Docker image that runs a single rootless service which serves the static game and the song preview API, running as a non-root user with no privilege escalation, compatible with OpenShift constraints.

#### Scenario: Image runs rootless
- **WHEN** the container image is run
- **THEN** the service process runs as a non-root user on an unprivileged port without requiring privilege escalation or host networking

#### Scenario: Multi-stage build
- **WHEN** the image is built
- **THEN** a build stage compiles the static assets and the runtime stage runs the service, keeping the runtime image free of front-end build tooling

#### Scenario: No secrets baked into the image
- **WHEN** the image is built and run
- **THEN** it requires no API keys or secrets to serve song previews, and none are embedded in the image or static assets

### Requirement: Serving the game
The container SHALL serve the game and the song API over HTTP such that opening the mapped port in a browser loads the playable game and the song endpoint resolves preview URLs.

#### Scenario: Game is reachable
- **WHEN** the container is run and its HTTP port is mapped to the host
- **THEN** opening that port in a browser loads and runs the game

#### Scenario: Song endpoint is reachable
- **WHEN** the front-end requests a band's song from the same origin
- **THEN** the backend responds with the resolved preview URL (or a no-preview/error result the front-end handles gracefully)

#### Scenario: Asset MIME types
- **WHEN** the browser requests JavaScript, image, and audio assets
- **THEN** the server returns them with correct content types so the game loads correctly

### Requirement: Documentation
The project SHALL document how to build, run, and configure the game, including per-band track id configuration, the preview provider used, the 30-second preview limitation, and the licensing note.

#### Scenario: README covers build/run/config
- **WHEN** a deployer reads the project README
- **THEN** it explains how to build and run the image, set per-band track ids, and the preview/licensing caveats
