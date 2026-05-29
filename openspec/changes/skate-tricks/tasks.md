## 1. Trick definitions

- [x] 1.1 Add a `TRICKS` table in `src/scenes/SkateScene.js` (ollie/kickflip/pop-shove-it) with `label`, `key`, `points`, and `anim` — defaults: ollie `Z` +50, pop shove-it `C` +100, kickflip `X` +150

## 2. Input rebinding

- [x] 2.1 In `buildInput()`, replace the old `Z` kickflip / `X` grab bindings with one binding per trick key from the table (keep jump on UP/SPACE and mute on M)

## 3. Trick behavior & scoring

- [x] 3.1 Rewrite `doTrick(trickId)` to look up the def, stay air-only and guarded by `trickActive`, play the trick's animation, and on completion award `def.points` to the combo + bump the multiplier
- [x] 3.2 Give each trick a distinct animation within `TRICK_MS`: ollie = nose-lift tilt, kickflip = full 360° roll, pop shove-it = squash + half-spin/flip
- [x] 3.3 Show a named cue on completion (e.g. `KICKFLIP +150`); keep the existing bail-on-mid-trick-landing behavior intact

## 4. HUD / discoverability

- [x] 4.1 Update the gameplay control hint to list the three tricks and their keys

## 5. Verification

- [x] 5.1 Build and run; confirm each key performs its named trick with a distinct animation while airborne and does nothing on the ground
- [x] 5.2 Confirm each trick awards its own points (cue shows name + points), feeds the combo, and that landing mid-trick still bails
- [x] 5.3 Confirm movement/ramps/grinds/props/hazards/combo banking still work
