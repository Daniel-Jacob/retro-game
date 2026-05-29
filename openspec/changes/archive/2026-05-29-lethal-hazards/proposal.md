## Why

Right now a run can only end by reaching the goal or the timer hitting zero — there's no real danger or skill test. Adding lethal hazards you must dodge (other skaters, BMX bikers, and containers dropped from a passing airplane) makes the game tense and replayable: one wrong move ends the run.

## What Changes

- Add **lethal hazards** to the skate level that **end the run (game over) on contact**:
  - **Ground hazards** — other **skateboarders** and **BMX bikers** that move toward the player along the ground; you must **jump** them.
  - **Aerial hazard** — an **airplane** passes overhead and **drops containers** that fall to the ground; you must move clear of where they land.
- Hazards are **telegraphed and avoidable**: ground hazards approach at a readable speed; falling containers show a **landing marker/shadow** before impact, so deaths feel fair.
- Hitting any hazard triggers an immediate **game over** that carries the current score to the game-over screen, shown as a **wipeout** rather than a normal run-complete.
- Existing mechanics (movement, ramps, grinds, combos, the clear-for-bonus retro props, goal/timer end) are unchanged; hazards are an added danger layer.

## Capabilities

### New Capabilities
- `hazards`: Lethal obstructions in the skate level — ground hazards (skaters, BMX bikers) that move toward the player and an airplane that drops falling containers — which are telegraphed/avoidable and **end the run on collision**.

### Modified Capabilities
- `skate-gameplay`: The "End of run" requirement gains **collision with a hazard** as an end condition (a crash/wipeout), in addition to reaching the goal or the timer expiring.

## Impact

- **Modified code**: `src/scenes/SkateScene.js` (hazard spawning, movement, landing telegraph, player–hazard collision → crash end; pass a crash reason to game over), `src/gen/textures.js` (new procedural art: skater/BMX hazard sprites, airplane, container, landing-marker), and `src/scenes/GameOverScene.js` (show a "WIPEOUT" state when the run ended by crash).
- **Shared state**: a crash flag/reason in the registry so the game-over screen can distinguish a wipeout from a completed run.
- **Reuses**: existing `ui-theme` cues (flash/HUD), the run-end → `GameOverScene` flow, and the procedural art pipeline.
- **No change** to audio, the song backend, or other scenes; no new dependencies.
- **Balance/fairness** is the main risk — addressed by telegraphing hazards and spacing spawns so they're dodgeable.
