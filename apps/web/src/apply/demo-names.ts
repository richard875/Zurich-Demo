// Made-up first names for the apply form, so nobody types their real name into a demo. Common English
// names; one is picked at random each time the form opens.
export const DEMO_FIRST_NAMES: readonly string[] = [
  'Alfie',
  'Amelia',
  'Archie',
  'Charlotte',
  'Chloe',
  'Edward',
  'Eleanor',
  'Emily',
  'Florence',
  'Freddie',
  'George',
  'Grace',
  'Hannah',
  'Harriet',
  'Harry',
  'Henry',
  'Isabelle',
  'Jack',
  'James',
  'Lucy',
  'Matilda',
  'Oliver',
  'Olivia',
  'Oscar',
  'Poppy',
  'Samuel',
  'Sophie',
  'Theo',
  'Thomas',
  'William',
];

export function randomDemoName(): string {
  return DEMO_FIRST_NAMES[Math.floor(Math.random() * DEMO_FIRST_NAMES.length)] ?? 'Olivia';
}
