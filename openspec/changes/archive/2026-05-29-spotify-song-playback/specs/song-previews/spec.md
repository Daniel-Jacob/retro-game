## ADDED Requirements

### Requirement: Resolve band track to preview URL
The backend SHALL expose an endpoint that, given a band id, resolves the band's configured track id to a 30-second preview URL from an external preview provider (the iTunes Lookup API) and returns it to the front-end.

#### Scenario: Preview available
- **WHEN** the front-end requests the song for a band whose track has a preview
- **THEN** the backend returns the track's preview URL and basic metadata

#### Scenario: No preview available
- **WHEN** the requested track has no preview URL
- **THEN** the backend returns a successful response indicating no preview is available

#### Scenario: Unknown band
- **WHEN** the requested band id is not configured
- **THEN** the backend returns a not-found response

#### Scenario: Provider unreachable
- **WHEN** the preview provider call fails or times out
- **THEN** the backend returns an error response and the front-end treats it as "play silently" without crashing

### Requirement: No credentials required
Preview resolution SHALL NOT require any API key, client secret, or user login; the backend SHALL call the public preview provider without authentication.

#### Scenario: Works without any secret configured
- **WHEN** the service is deployed with no API credentials of any kind
- **THEN** preview resolution still works for tracks that have previews

#### Scenario: No secret in the browser
- **WHEN** the browser loads the game or calls the song endpoint
- **THEN** no API key or secret is present in any response or static asset (there is none to leak)

### Requirement: Track configuration
Each band SHALL map to a configurable track id, held server-side as the single source of truth, so the playable song can change without modifying game logic or the front-end.

#### Scenario: Unconfigured track
- **WHEN** a band has no configured track id
- **THEN** the backend returns a successful response indicating the band is silent

### Requirement: Caching and rate-limit friendliness
The backend SHALL cache resolved preview URLs per track id so repeated requests do not call the preview provider every time.

#### Scenario: Cached preview reused
- **WHEN** the same band's song is requested again within the cache lifetime
- **THEN** the backend returns the cached preview URL without making another provider call
