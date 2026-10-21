// Only names from the icon sets imported in the root layout render.
export type ZurichIconName =
  | 'arrow-down:line'
  | 'arrow-left:line'
  | 'arrow-right:line'
  | 'check:line'
  | 'close:line'
  | 'family:line'
  | 'financial-health:line';

export function ZurichIcon({ name, className }: { name: ZurichIconName; className?: string }) {
  return <i z-icon="" icon={name} aria-hidden="true" className={className} />;
}
