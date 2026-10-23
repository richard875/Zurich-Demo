// Made-up first names for the apply form, so nobody types their real name into a demo. Common English
// names, as many female as male; one is picked at random each time the form opens.
const FEMALE_NAMES = [
  'Amelia',
  'Charlotte',
  'Chloe',
  'Eleanor',
  'Emily',
  'Florence',
  'Grace',
  'Hannah',
  'Harriet',
  'Isabelle',
  'Lucy',
  'Matilda',
  'Olivia',
  'Poppy',
  'Sophie',
] as const;

const MALE_NAMES = [
  'Alfie',
  'Archie',
  'Edward',
  'Freddie',
  'George',
  'Harry',
  'Henry',
  'Jack',
  'James',
  'Oliver',
  'Oscar',
  'Samuel',
  'Theo',
  'Thomas',
  'William',
] as const;

export const DEMO_FIRST_NAMES: readonly string[] = [...FEMALE_NAMES, ...MALE_NAMES];

export function randomDemoName(): string {
  return DEMO_FIRST_NAMES[Math.floor(Math.random() * DEMO_FIRST_NAMES.length)] ?? 'Olivia';
}
