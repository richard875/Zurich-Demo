// The motion tokens in styles/globals.css that Motion needs for the quote steps: durations in
// seconds, easings as cubic-bezier points. Everything else moves in CSS and reads the tokens there.
// tests/motion-tokens.test.ts keeps the two in step.
export const ease = {
  // zurich.com.au's curve for every entrance and reveal.
  entrance: [0, 0, 0, 1],
  // CSS's ease-in-out, for state changes.
  state: [0.42, 0, 0.58, 1],
} as const;

export const duration = {
  press: 0.1,
  state: 0.2,
  switchIn: 0.25,
  switchOut: 0.15,
  enter: 0.5,
  settle: 0.6,
  confirm: 0.3,
} as const;
