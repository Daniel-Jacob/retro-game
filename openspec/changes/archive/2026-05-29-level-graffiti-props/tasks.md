## 1. Prop art

- [x] 1.1 Add `generatePropTextures(scene)` to `src/gen/textures.js`: `prop-record` (record player), `prop-tape` (tape recorder), `prop-soda` (generic retro soda stand — original "SODA" styling, no trademark)
- [x] 1.2 Size props ~40–56px wide × ~30–40px tall so a normal jump clears them; call the generator from `generateAllTextures`

## 2. Band graffiti backdrop

- [x] 2.1 In `SkateScene.buildWorld`, paint the selected band's logo (`logoKey`) + initials tags + a few theme-tinted spray stripes along the back wall at intervals
- [x] 2.2 Place graffiti at a low depth (behind gameplay, above the glow strip), world-anchored; keep density modest so it doesn't clash with the Pythagoras labels or HUD

## 3. Props as solid, clearable obstacles

- [x] 3.1 Add an `addProp(x, type)` helper: place the prop image on the floor and a matching static solid body in the `solids` group (blocks the grounded skater)
- [x] 3.2 Add a thin "clear sensor" overlap zone above each prop; award a one-time bonus + flash cue when the player overlaps it while airborne and moving (per-prop `cleared` flag)
- [x] 3.3 Place 3–5 props across the level (cycling the three types), including at least one just after a ramp; ensure run-up room and that none trap the player against a rail/platform

## 4. Verification

- [x] 4.1 Build and run; confirm the picked band's graffiti shows on the level backdrop and differs by band
- [x] 4.2 Confirm the three prop types render, are solid (block when hit), and can be cleared with a jump/ramp
- [x] 4.3 Confirm clearing a prop awards the bonus once with a cue, and existing movement/ramp/grind/combo/end-of-run still work; HUD stays readable
