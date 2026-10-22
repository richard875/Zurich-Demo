// Only names from the icon sets imported in the root layout render. The design tokens have no
// "chevron" icon: arrow-right and arrow-down are drawn as chevrons.
export type ZurichIconName =
  | 'arrow-down:line'
  | 'arrow-left:line'
  | 'arrow-right:line'
  | 'check:line'
  | 'close:line'
  | 'document-contract:line'
  | 'family:line'
  | 'financial-health:line'
  | 'launch:line'
  | 'menu:line'
  | 'minus:line'
  | 'mobile:line'
  | 'phone:line'
  | 'plus:line'
  | 'star:line'
  | 'user-male:line';

export function ZurichIcon({ name, className }: { name: ZurichIconName; className?: string }) {
  return <i z-icon="" icon={name} aria-hidden="true" className={className} />;
}
