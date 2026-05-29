## 1. Math content helper

- [x] 1.1 Create `src/edu/pythagoras.js` with the triple list (`[3,4,5]`, `[6,8,10]`, `[5,12,13]`, `[8,15,17]`) and per-triple pixel scale
- [x] 1.2 Add string helpers: `formula(a,b,c)` → `a² + b² = c²` (with substituted values), `worked(a,b,c)` → `9 + 16 = 25`, and a superscript helper

## 2. Triple-accurate ramp geometry

- [x] 2.1 Replace the fixed 80×80 wedge: generate a right-triangle ramp texture from `(a, b, scale)` (rise = a·s, run = b·s), supporting mirrored orientation
- [x] 2.2 Orient/clamp so tall triples (e.g. 5-12-13) stay a sensible, jumpable size on 960×540 (longer leg as the run)
- [x] 2.3 In `SkateScene.addRamp`, size the ramp and its launch zone from the chosen triple; assign a triple per ramp (cycle the list) so values vary

## 3. Ramp labels

- [x] 3.1 Label the triangle sides on/near each ramp: rise `a`, run `b`, incline `c` with numeric values
- [x] 3.2 Add a compact formula card near each ramp: `a² + b² = c²` with values, plus the worked line (`9 + 16 = 25`), on a faint themed panel
- [x] 3.3 Anchor labels to the world (scroll with the ramp) at a depth above the level but below the HUD/CRT; mirror anchoring for flipped ramps

## 4. Verification

- [x] 4.1 Build and run; confirm each ramp shows correct, triple-accurate values and the worked formula
- [x] 4.2 Confirm at least two different triples appear and labels stay legible and scroll with their ramps
- [x] 4.3 Confirm ramps still launch the skater (gameplay unchanged) and labels don't obscure the HUD
