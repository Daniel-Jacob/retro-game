## Why

The skate level is visually bare and doesn't carry the band theme the player picked, and there's little to jump besides the ramps. Adding band graffiti to the level walls ties the run to the chosen band, and placing retro props (record player, tape recorder, soda stand) as obstacles to clear gives the level character and more to do.

## What Changes

- The skate level backdrop SHALL display **graffiti of the selected band** (its logo/tag, themed to the band's colors), consistent with the hallway intro.
- Add **retro prop obstacles** to the level — a **record player**, a **tape recorder**, and a **generic retro soda stand** (original red/white "SODA" styling, **no Coca-Cola trademark**) — drawn as original pixel art.
- Props are **solid obstacles**: the skater must use a ramp or jump to clear them. **Clearing** a prop (passing over it while airborne) awards **bonus points** with an on-screen cue; running into one while grounded **stops** the skater (it blocks, like a wall) so it must be jumped.
- Props are sized/placed so a normal jump (or a nearby ramp) can clear them — challenging but not unfair.
- Reuses the existing UI theme and the band's generated logo art; no new gameplay systems beyond the clear bonus.

## Capabilities

### Modified Capabilities
- `skate-gameplay`: The level gains (1) a **band-graffiti backdrop** themed to the selected band, and (2) **retro prop obstacles** (record player, tape recorder, soda stand) that are solid, must be cleared by jumping/ramping, and award a bonus when cleared. Existing movement, ramp, grind, combo, and end-of-run behavior are unchanged.

## Impact

- **Modified code**: `src/gen/textures.js` (new procedural prop textures: record player, tape recorder, retro soda stand), `src/scenes/SkateScene.js` (graffiti backdrop using the band logo + tags; place props as static solid bodies with a "clear" sensor and bonus; collision with the player).
- **Reuses**: the band logo texture (`logoKey`) already generated for the hallway, and `ui-theme` helpers for any text.
- **No change** to scoring rules beyond an additive clear bonus, and no change to audio, the song backend, or other scenes.
- **No new dependencies**.
- **Trademark note**: the soda stand is an **original generic** retro design (no Coca-Cola wordmark/logo), consistent with the project's avoidance of trademarked assets.
