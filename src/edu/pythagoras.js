// Pythagorean-theorem content (spec: pythagoras-ramps).
//
// Each ramp is a right triangle sized from a real Pythagorean triple, so the
// labels are mathematically truthful. `a` is the rise (vertical leg), `b` is the
// run (horizontal leg, the longer one so ramps stay sensible), `c` the incline
// (hypotenuse). `scale` converts triple units → pixels.

export const TRIPLES = [
  { a: 3, b: 4, c: 5, scale: 20 }, // 60 x 80, hyp 100
  { a: 6, b: 8, c: 10, scale: 12 }, // 72 x 96, hyp 120
  { a: 5, b: 12, c: 13, scale: 8 }, // 40 x 96, hyp 104 (shallow)
  { a: 8, b: 15, c: 17, scale: 7 }, // 56 x 105, hyp 119
];

// Pick a triple by ramp index (cycles the list).
export function tripleForRamp(i) {
  return TRIPLES[i % TRIPLES.length];
}

// Pixel dimensions of a ramp's right triangle.
export function rampDims(t) {
  return { rise: t.a * t.scale, run: t.b * t.scale, hyp: t.c * t.scale };
}

// The generic theorem.
export const THEOREM = 'a² + b² = c²';

// Substituted form, e.g. "3² + 4² = 5²".
export function formula(t) {
  return `${t.a}² + ${t.b}² = ${t.c}²`;
}

// Worked-out form, e.g. "9 + 16 = 25".
export function worked(t) {
  return `${t.a * t.a} + ${t.b * t.b} = ${t.c * t.c}`;
}
