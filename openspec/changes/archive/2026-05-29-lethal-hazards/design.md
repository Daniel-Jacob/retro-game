## Context

`SkateScene` is a side-scrolling level with movement, ramps (Pythagoras-labeled), grind rails, clear-for-bonus retro props, a band-graffiti backdrop, a HUD, and an `endRun()` that ends on reaching the goal or the timer hitting 0 — then transitions to `GameOverScene` (which reads the score from the registry and shows "RUN OVER"). There is currently **no way to lose by failure** — no danger.

The requester wants lethal obstructions that cause game over: other skateboarders, BMX bikers, and an airplane dropping containers to avoid. These are distinct from the existing retro props (which are solid and award a bonus when cleared) — hazards **end the run on contact**.

## Goals / Non-Goals

**Goals:**
- Ground hazards (skater, BMX biker) that move toward the player and must be jumped.
- An airplane that periodically crosses overhead and drops falling containers that must be dodged.
- Any hazard collision → immediate game over, carrying the current score, shown as a wipeout.
- Telegraphed, fair, dodgeable hazards (readable approach speed; a landing marker for containers).
- No change to existing movement/ramp/grind/combo/prop/goal/timer behavior.

**Non-Goals:**
- A lives/health system (collision is instant game over, as requested) — though the code keeps the crash path isolated so lives could be added later.
- Enemy AI beyond simple movement/dropping; no pathfinding or attacks.
- Multiplayer, difficulty menus, or per-band hazard theming.
- Reworking scoring (a crash just ends the run with the score so far).

## Decisions

### A dedicated hazards layer, separate from props
Hazards live in their own group(s) with their own collision handler that calls `crash()` → `endRun('crash')`. They are NOT added to `solids` (which only blocks) — overlap with a hazard is fatal, not blocking. Keeping hazards separate from the clear-for-bonus props avoids confusing the two systems. *Alternative:* reuse props with a "lethal" flag — rejected (muddies two opposite behaviors).

### Ground hazards: approach-and-jump
Skater/BMX hazards spawn ahead of the player (off the right edge of the camera) and move **leftward toward the player** along the floor at a readable speed, so the player must time a **jump** over them. Spawned on a timer with spacing so two never stack unfairly; capped count on screen. Visually distinct from the player (different silhouette/color; BMX has wheels+frame, skater faces the player). Overlap with the player at any time = crash. *Alternative:* static hazards the player skates into — rejected (less dynamic; the user asked for moving skaters/bikers).

### Aerial hazard: airplane + telegraphed container drops
An airplane sprite crosses the top of the screen on a timer. While overhead it **drops a container** aimed near the player's current x; before the container falls (or as it falls), a **landing marker/shadow** appears on the ground at the target x to telegraph the impact, giving the player time to move away or jump through the gap. The falling container is fatal on contact with the player; once it lands it briefly remains then clears (or becomes a short-lived ground hazard). *Alternative:* instant column strike — rejected (no telegraph = unfair).

### Crash → game over with a wipeout state
`crash()` guards against double-trigger, sets a registry crash flag (e.g. `REG.CRASHED = true`), banks no combo (a crash loses the run), stores the score, and transitions to `GameOverScene`. `GameOverScene` reads the flag and shows **"WIPEOUT!"** (vs the normal "RUN OVER") and resets the flag. Reuses the existing end-of-run → game-over flow. *Alternative:* a separate crash scene — rejected (game-over already does the job).

### Telegraph + fairness tuning
- Ground hazards approach at a speed the tuned jump clears; spaced so the player can land between them.
- Container markers appear with enough lead time to react; drops are aimed with slight randomness around the player, not pixel-locked, so standing still isn't an instant loss but dodging is needed.
- Brief **grace** at level start / right after a crash-free respawn-free run start (no hazards in the first short stretch) so the player gets going.
- All spawn rates/speeds are constants at the top of the scene for easy tuning.

### Procedural hazard art
Add to `textures.js`: `hazard-skater` (an opposing skater), `hazard-bmx` (BMX bike + rider), `plane` (small retro airplane), `container` (shipping/crate container), and a `marker` (landing reticle/shadow). Original pixel art, consistent with the existing style. Sized so collisions read fairly (bodies match the visible shape).

## Risks / Trade-offs

- **[Instant game over feels brutal]** → Telegraphing, spacing, a no-hazard grace stretch at the start, and tuned speeds keep it fair. If still too harsh, a lives system is a small follow-up (the crash path is isolated). Flagged as an open question.
- **[Unavoidable container drops]** → Aim with lead-time markers and slight spread (not locked to the player); ensure there's always room to dodge (don't drop onto a spot boxed in by rails/props).
- **[Hazard vs. ramp/grind interaction]** → Don't spawn ground hazards on ramps/rails; clear hazards that would overlap level geometry. A grinding player still dies on hazard contact (intended).
- **[Performance/leaks from spawns]** → Destroy hazards once off-screen behind the player or after landing; cap concurrent hazards.
- **[Collision-box mismatch]** → Set hazard bodies to the visible footprint so deaths feel deserved.

## Migration Plan

Front-end gameplay change only. Rebuild and redeploy the existing image; no config/data/API changes. Rollback = redeploy the previous image. Verify in-browser: ground hazards approach and can be jumped, the airplane drops telegraphed containers, hitting any hazard triggers a wipeout game over with the score, and existing mechanics still work.

## Open Questions

- Instant game over vs. a small number of lives. (Assumed: instant game over, per the request; lives is an easy later toggle.)
- Spawn frequency / difficulty curve — fixed vs. ramping up over the run. (Assumed: fixed, tuned-fair constants; could ramp later.)
- Whether a landed container persists as a jumpable ground obstacle or clears quickly. (Assumed: clears shortly after landing to avoid clutter.)
