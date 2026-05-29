## Why

Tricks are currently shallow: two keys do near-identical spins worth the same flat points. Giving the player a small vocabulary of distinct, named tricks — **ollie, kickflip, pop shove-it** — each on its own control and worth different points, makes air time expressive and rewards skill (harder trick = more points).

## What Changes

- Replace the generic two-key trick input with **three named air tricks**, each on a **distinct control**:
  - **Ollie** — the basic pop; easiest, lowest points.
  - **Pop shove-it** — board spins 180°; medium points.
  - **Kickflip** — board flips; highest points.
- Each trick **awards different points** into the combo (reflecting difficulty), instead of a single flat value.
- Each trick has a **distinct animation** and an on-screen cue naming the trick and its points (e.g. `KICKFLIP +150`).
- Tricks remain **air-only**; the existing combo/multiplier and bail-on-bad-landing rules are unchanged (landing mid-trick still bails).

## Capabilities

### Modified Capabilities
- `skate-gameplay`: Adds a **named-tricks** requirement — three distinct air tricks (ollie, kickflip, pop shove-it) on separate controls, each with its own animation and **trick-specific point value** that feeds the existing combo/score. The generic "air trick scoring" behavior still holds; this specializes it.

## Impact

- **Modified code**: `src/scenes/SkateScene.js` — define a trick table (name, key, points, animation), rebind trick keys, rewrite `doTrick()` to award per-trick points and play the matching animation, and show the trick name + points in the flash; update the HUD control hint.
- **Reuses**: the existing airborne check, combo/multiplier, bail logic, and `showFlash` cue; no change to scoring math beyond per-trick base points.
- **No change** to movement, ramps, grinds, props, hazards, audio, backend, or other scenes; no new dependencies.
- **Tuning**: control mappings and point values are constants for easy adjustment.
