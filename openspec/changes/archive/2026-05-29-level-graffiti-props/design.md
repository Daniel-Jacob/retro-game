## Context

`SkateScene` builds a side-scrolling level: a tiled ground floor, a raised platform, right-triangle Pythagoras ramps, grind rails, and a goal flag, with a band-color glow backdrop. The hallway already paints the selected band's logo as graffiti (via the generated `logoKey` texture + initials text). The skate level itself shows no band identity and has only ramps/rails to interact with. Props are drawn procedurally (see `src/gen/textures.js`); the UI theme provides text/palette helpers.

Locked decisions:
- **Generic retro soda stand** — no Coca-Cola trademark; original red/white "SODA" styling.
- **Props are solid obstacles to clear** — collide if hit while grounded; bonus when cleared (jumped/ramped over).

## Goals / Non-Goals

**Goals:**
- Band graffiti on the skate-level backdrop, themed to the selected band (reuse the hallway's logo art + tags).
- Three original retro props — record player, tape recorder, generic soda stand — as solid obstacles.
- Clearing a prop (airborne pass over it) awards a bonus with a clear on-screen cue; hitting one while grounded blocks the skater (must jump).
- Sizing/placement that a normal jump or a nearby ramp can clear — fair, not frustrating.
- No change to existing movement/ramp/grind/combo/end-of-run behavior.

**Non-Goals:**
- New scoring systems beyond an additive clear bonus.
- Trademarked branding (Coca-Cola etc.).
- Destructible props, prop physics, or knockback animations.
- Changes to other scenes, audio, or the song backend.

## Decisions

### Band graffiti backdrop (reuse existing art)
Paint the selected band's `logoKey` badge + initials tags + a few spray-stripe rectangles along the level back wall at intervals, tinted with the band's `themeColor`/`accentColor`, at a low depth (behind gameplay, above the glow strip) with default scroll factor so it pans with the world. Reuses the hallway's approach so the look is consistent and no new art is needed for graffiti. *Alternative:* a dedicated graffiti texture per band — rejected (the logo art already reads as the band).

### Three procedural retro props
Add `generatePropTextures(scene)` to `textures.js` producing original pixel-art textures:
- `prop-record` — record player: low box + black platter + center label + tonearm.
- `prop-tape` — tape recorder: deck body + two reels + button row.
- `prop-soda` — retro soda stand: red cabinet, white band, an original "SODA" label, a coin slot/spout — explicitly **not** a Coca-Cola design.
Each ~40–56px wide and ~30–40px tall so a normal jump clears them. *Alternative:* one shared crate — rejected (the variety is the point).

### Props as solid obstacles + clear sensor
Each prop is placed on the floor as a **static solid body** added to the existing `solids` group, so the player `collider` already blocks horizontal movement into it (natural "stumble"/stop — must jump). Above each prop sits a thin **clear sensor** (overlap zone). When the player overlaps the sensor **while airborne and moving** (and hasn't already cleared this prop), award a **bonus** (e.g. +150) into the score/combo and show a flash cue (`CLEARED!`/`+150`). A per-prop `cleared` flag prevents double-counting. *Alternative:* award on landing past the prop — rejected (sensor-over-prop is simpler and reads as "ramped over").

### Placement and fairness
Place props on flat ground with clear run-up, and at least one positioned just after a ramp so it can be cleared with a launch. Keep props short enough for the tuned normal jump (apex ~190px) to clear. Don't place a prop where it traps the player against a rail/platform. Hitting one simply stops forward motion (collider) — the player backs up and jumps; no combo penalty, to avoid frustration. *Alternative:* knockback/penalty — rejected (too punishing for an office game).

### Depth/HUD layering
Graffiti behind gameplay (low depth); props at gameplay depth; bonus flash reuses the HUD flash style (below the CRT overlay, like existing cues). Labels/cues never cover the HUD score panels.

## Risks / Trade-offs

- **[Solid props frustrate / trap the player]** → Short props, generous spacing, run-up room, and at least one ramp-assisted; no penalty on hit (just blocked). Verify each is clearable.
- **[Clear sensor mis-fires (counts when not really over the prop)]** → Require airborne + horizontal motion + a once-per-prop flag; size the sensor to sit just above the prop footprint.
- **[Graffiti clutter vs. readability]** → Low depth, modest density, theme-tinted but subdued so it doesn't compete with gameplay or the Pythagoras labels.
- **[Prop collide box vs. art mismatch]** → Set the static body to the prop's visible footprint so collisions feel fair.
- **[Trademark]** → Soda stand is an original generic design; documented, consistent with prior IP avoidance.

## Migration Plan

Front-end visual/content change only. Rebuild and redeploy the existing image; no config/data/API changes. Rollback = redeploy the previous image. Verify in-browser: graffiti shows the picked band, each prop is visible, clearable, blocks when hit, and awards a bonus when cleared; existing gameplay unchanged.

## Open Questions

- How many props / exact placements in the final level. (Assumed: 3–5 props across the level, one ramp-assisted, cycling the three types.)
- Bonus value and whether it feeds the combo multiplier or adds flat score. (Assumed: flat bonus added to score with a flash; revisit if it should chain combos.)
