## Context

`SkateScene` builds ramps via `addRamp(x, mirrored)`, which draws a single shared `ramp` texture — an 80×80 right-triangle wedge (isosceles: legs equal, so its true hypotenuse is `80√2`, an irrational number). Ramps launch the skater on contact via an overlap launch zone. The game already has a UI theme (`src/ui/theme.js`) with `makeText` and a palette.

The requester wants the game to be educational: show the Pythagorean theorem with the values filled in, on the ramps. Ramps are right triangles, so this is a natural fit — but the current isosceles wedge can't carry honest whole-number labels.

## Goals / Non-Goals

**Goals:**
- Every ramp is a right triangle whose rise:run equals a real Pythagorean triple, so labeled values are exactly correct.
- Show, on/near each ramp: the legs `a` (rise) and `b` (run) and hypotenuse `c` labeled, plus `a² + b² = c²` with the ramp's numbers filled in and worked out.
- Vary triples across ramps so multiple examples appear.
- Labels are legible, theme-styled, and scroll with the ramp.
- Keep launch/air gameplay behavior unchanged.

**Non-Goals:**
- Quizzes, scoring for math, or interactive problem-solving (display only).
- Other theorems or subjects (Pythagoras only for now).
- Changing grind/scoring/audio/other scenes.
- Realistic ramp physics tied to the angle (launch stays as-is).

## Decisions

### Ramp geometry derived from a Pythagorean triple
Replace the fixed 80×80 wedge with per-ramp dimensions from a triple `(a, b, c)` and a pixel scale `s`: run `b·s`, rise `a·s`, hypotenuse `c·s` (the skating incline). Because the shape comes from the triple, the labels can't be wrong. Generate the wedge per ramp (parameterized `generateRampTexture(scene, key, a, b, s)`), or draw it directly with Graphics in the scene. *Alternative:* keep one wedge and just print numbers — rejected (the picture would contradict the math; bad for a teaching tool).

### Triple set, cycled per ramp
A small ordered list — `[3,4,5]`, `[6,8,10]`, `[5,12,13]`, `[8,15,17]` — assigned per ramp so the level shows different values. Pixel scale chosen per triple so ramps stay a sensible size on the 960×540 canvas (e.g. scale so the run is ~90–150px; clamp rise so tall triples like 5-12-13 aren't absurd — may orient the longer leg as the run). *Alternative:* random — rejected (want deterministic, resume-safe, and curated sizes).

### Label layout
For each ramp, a small world-anchored label group:
- side labels placed along the triangle: `b` near the base (run), `a` near the vertical (rise), `c` along the incline (optionally rotated to the slope),
- a compact formula card near the ramp top: `a² + b² = c²` on one line and the worked numbers `aa + bb = cc` (e.g. `9 + 16 = 25`) below, in theme text on a faint panel for contrast.
Labels use `makeText` (body/small) + a translucent `panel`, set at a depth above the level but below the HUD/CRT, and scroll with the world (default scroll factor). *Alternative:* screen-fixed callout — rejected (wouldn't tie the math to the specific ramp).

### Keep launch behavior
The launch zone still sits over the incline; only its size follows the new ramp dimensions. Launch velocity/logic is unchanged, so the run still plays the same. Mirrored ramps flip the triangle and label anchoring.

### Math/text helper module
`src/edu/pythagoras.js` exports the triple list and helpers (`formula(a,b,c)` → `"a² + b² = c²"`, `worked(a,b,c)` → `"9 + 16 = 25"`, superscript digits). Keeps strings/data testable and out of the scene.

## Risks / Trade-offs

- **[Label clutter / readability over the level]** → Use a faint panel behind the formula, concise text, and place labels in open space above each ramp; keep font sizes small but legible; labels sit below the CRT/HUD depth.
- **[Tall triples make oversized ramps]** → Per-triple pixel scale + clamping; orient so the longer leg is the horizontal run, keeping ramp height reasonable and still jumpable.
- **[Geometry vs. launch feel]** → Different ramp sizes could change how launches feel; keep launch velocity constant and verify each ramp is still rideable/launchable.
- **[Hypotenuse label rotation]** → Rotating `c` to the slope can hurt legibility; if it looks bad, place `c` parallel near the incline without rotation. Decide during implementation.
- **[Resolution/scroll]** → Labels are world-anchored so they pan correctly; verify they don't overlap rails/platforms at each ramp's location.

## Migration Plan

Front-end visual/content change only. Rebuild and redeploy the existing image; no config/data/API changes. Rollback = redeploy previous image. Verify in-browser that each ramp shows correct, legible, triple-accurate labels and that launches still work.

## Open Questions

- Units on the labels — unitless vs. `m` (meters). (Assumed: unitless numbers for clarity; revisit if a unit reads better.)
- Whether to rotate the hypotenuse label along the slope. (Assumed: start non-rotated for legibility.)
- How many ramps / which triples in the final level. (Assumed: 3–4 ramps cycling the triple list.)
