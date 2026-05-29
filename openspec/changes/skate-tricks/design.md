## Context

`SkateScene` already has an air-trick system: `buildInput()` binds `Z`→`doTrick('kickflip', 360)` and `X`→`doTrick('grab', -360)`; `doTrick(_name, spin)` is air-only, tweens the sprite's angle, and on completion adds a flat **+100** to the combo, bumps the multiplier, and flashes `+TRICK`. Landing while a trick is still mid-animation calls `bail()` (combo lost). Jump (UP/SPACE) gives air; combo banks on a clean landing.

The requester wants three real, named tricks — **ollie, kickflip, pop shove-it** — on different controls, each worth different points.

## Goals / Non-Goals

**Goals:**
- Three distinct named tricks, each on its own key, performable while airborne.
- Distinct point values per trick (harder = more), feeding the existing combo/score.
- A distinct animation and a named on-screen cue per trick.
- Keep air-only restriction, combo/multiplier, and bail-on-bad-landing intact.
- Make controls and points easy to tune (a constants table).

**Non-Goals:**
- Trick-string grammar, manuals, reverts, or input combos/sequences.
- Ground tricks, grind-trick variants, or per-band trick sets.
- Changing jump, ramps, grinds, props, hazards, or scoring math beyond per-trick base points.

## Decisions

### A trick table drives input, animation, and scoring
Define `const TRICKS = { ollie: {label:'OLLIE', key:'Z', points:50, anim:'ollie'}, shoveit: {label:'POP SHOVE-IT', key:'C', points:100, anim:'shove'}, kickflip: {label:'KICKFLIP', key:'X', points:150, anim:'flip'} }`. `buildInput()` binds each key to `doTrick(<id>)`; `doTrick` looks up the def, plays `anim`, and on completion awards `def.points`. One table = one place to retune controls/points/feel. *Alternative:* hard-code three near-duplicate handlers — rejected (duplication, harder to tune).

### Control mapping
- `Z` → **Ollie** (easiest, +50)
- `C` → **Pop shove-it** (+100)
- `X` → **Kickflip** (hardest, +150)
Jump stays on `UP`/`SPACE`. Replaces the old `Z` kickflip / `X` grab bindings. Chosen for an easy left-hand cluster; documented in the HUD hint and README-style control list. Values/keys are tunable constants.

### Distinct animations (read-at-a-glance)
Reuse the angle tween but differentiate so each trick *looks* different:
- **Ollie** — quick nose-lift: tilt to ~ -18° and back (no full rotation); short duration.
- **Kickflip** — full 360° roll (as today).
- **Pop shove-it** — 180°-feel: a brief horizontal squash (scaleX dip) + a half spin / flipX toggle to suggest the board spinning under the rider, returning to upright.
All complete within the existing `TRICK_MS` window so the bail timing is unchanged. Keep them short enough to land cleanly off a normal jump.

### Scoring: per-trick base points into the combo
On trick completion (in air), add `def.points` to the pending combo and bump the multiplier (as today), then bank on a clean landing via the existing path. Harder trick → bigger combo contribution → more banked score. The flash shows `"<LABEL> +<points>"`. No change to the multiplier/banking math. *Alternative:* multiply per-trick — rejected (keeps scoring readable; difficulty is expressed via base points).

### Bail behavior unchanged
Landing before the trick animation settles still calls `bail()` (lose the combo). Since all tricks fit in `TRICK_MS`, the existing land-timing check works as-is. Spamming a second trick before the first finishes is ignored (existing `trickActive` guard).

## Risks / Trade-offs

- **[Animations look too similar]** → Differentiate by motion type (tilt vs full roll vs squash+half-spin), not just degrees; verify the three read distinctly in play.
- **[Key discoverability]** → Show the three tricks + keys in the HUD hint; keep the cluster simple (Z/X/C).
- **[Balance: best trick always optimal]** → Acceptable and intended (skill expression); points are tunable if one dominates.
- **[Bail timing drift]** → Keep every trick within `TRICK_MS` so the existing mid-trick land/bail check stays valid.

## Migration Plan

Front-end gameplay change only. Rebuild and redeploy the existing image; no config/data/API changes. Rollback = redeploy the previous image. Verify in-browser: each key performs its named trick with its animation while airborne, awards its points (shown in the cue), feeds the combo, and bails if landed mid-trick.

## Open Questions

- Exact point values (50 / 100 / 150 assumed) and key layout (Z/X/C assumed) — easy to retune.
- Whether a landed trick should also require a *clean* (upright) landing visual beyond the existing timing check. (Assumed: existing timing-based bail is sufficient.)
