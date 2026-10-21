// Only names from the icon sets imported in globals.css render.
export type ZurichIconName =
  'arrow-right:line' | 'check:line' | 'family:line' | 'financial-health:line';

export function ZurichIcon({ name, className }: { name: ZurichIconName; className?: string }) {
  return <i z-icon="" icon={name} aria-hidden="true" className={className} />;
}
