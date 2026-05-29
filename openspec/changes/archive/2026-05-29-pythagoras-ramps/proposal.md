## Why

The game is a fun skater, but we want it to teach something too. Skate ramps are literally right triangles — a perfect, intuitive hook for the Pythagorean theorem. Labeling each ramp with its sides and the worked formula turns every jump into a tiny math lesson without interrupting play.

## What Changes

- Each ramp SHALL be a **right triangle** whose rise (a) and run (b) match a real **Pythagorean triple** (e.g. 3-4-5, 6-8-10, 5-12-13), so the numbers shown are mathematically truthful — not arbitrary labels on an isosceles wedge.
- Each ramp SHALL display an **educational overlay**: the legs `a` and `b` and hypotenuse `c` labeled on the triangle, plus the theorem **`a² + b² = c²`** with the ramp's actual values filled in and worked out (e.g. `3² + 4² = 5²` → `9 + 16 = 25`).
- Ramps SHALL vary their triple so players see **different values** across the level.
- Labels SHALL use the existing UI theme and stay **legible** against the level, scrolling with the ramp (world-anchored, not screen-fixed).
- Gameplay is otherwise **unchanged**: ramps still launch the skater the same way.

## Capabilities

### New Capabilities
- `pythagoras-ramps`: The educational content layer — right-triangle ramps sized to Pythagorean triples, with their sides labeled and the theorem `a² + b² = c²` shown with correct values worked out on each ramp.

### Modified Capabilities
- `skate-gameplay`: The "Ramps and air" requirement is updated so ramps are explicitly **right-triangular and carry the Pythagorean label**, while keeping the existing launch/air behavior.

## Impact

- **Modified code**: `src/gen/textures.js` (generate ramp wedges at triple proportions, or per-ramp sizing), `src/scenes/SkateScene.js` (`addRamp` places a labeled triangle with side labels + worked formula; pick a triple per ramp), and a small helper/data list of triples.
- **Possibly new code**: a tiny `src/edu/pythagoras.js` (triple list + label/string helpers) to keep the math/text logic out of the scene.
- **No change** to scoring, audio, the song backend, or other scenes.
- **No new dependencies**; labels reuse the `ui-theme` text helpers.
- **Educational integrity**: values are always correct because ramp geometry is derived from the triple.
