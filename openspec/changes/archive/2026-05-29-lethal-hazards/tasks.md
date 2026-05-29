## 1. Hazard art

- [x] 1.1 Add procedural textures in `src/gen/textures.js`: `hazard-skater` (opposing skater), `hazard-bmx` (BMX bike + rider), `plane` (retro airplane), `container` (crate/shipping container), `marker` (landing reticle/shadow)
- [x] 1.2 Make hazards visually distinct from the player and size them so collision bodies match the visible shape; call the generator from `generateAllTextures`

## 2. Ground hazards

- [x] 2.1 Add a `hazards` group + a spawn timer; spawn skater/BMX hazards off the right edge ahead of the player
- [x] 2.2 Move ground hazards leftward toward the player at a readable speed; destroy them once off-screen behind the player; cap concurrent count and space spawns
- [x] 2.3 Avoid spawning on ramps/rails; keep them on the floor so they can be jumped

## 3. Airplane + container drops

- [x] 3.1 Add an airplane that periodically crosses overhead on a timer
- [x] 3.2 Drop a container aimed near the player's x (slight spread); show a landing `marker` on the ground before/while it falls (telegraph)
- [x] 3.3 Make the falling container fatal on contact; clear it shortly after it lands

## 4. Crash → wipeout game over

- [x] 4.1 Add `crash()` (guarded) on player–hazard overlap → end the run with the current score; add a `REG.CRASHED` flag in `src/state.js`
- [x] 4.2 Wire overlaps: player vs ground hazards and player vs falling containers both call `crash()`
- [x] 4.3 In `GameOverScene`, show "WIPEOUT!" (vs "RUN OVER") when `REG.CRASHED` is set, then reset the flag

## 5. Fairness & tuning

- [x] 5.1 Add a brief hazard-free grace period at run start; expose spawn rates/speeds as tunable constants
- [x] 5.2 Ensure hazards are dodgeable: approach speed clears with the tuned jump, container markers give lead time, drops aren't boxed in by rails/props

## 6. Verification

- [x] 6.1 Build and run; confirm ground hazards approach and can be jumped, and the airplane drops telegraphed containers
- [x] 6.2 Confirm hitting any hazard triggers an immediate game over showing "WIPEOUT" with the score so far
- [x] 6.3 Confirm existing movement/ramps/grinds/combos/props/goal/timer still work and the start grace period holds
