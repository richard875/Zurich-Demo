// Only names from the icon sets imported in the root layout render. The design tokens have no
// "chevron" icon: arrow-right and arrow-down are drawn as chevrons.
export type ZurichIconName =
  | 'alert-circle:line'
  | 'arrow-down:line'
  | 'arrow-left:line'
  | 'arrow-right:line'
  | 'check:line'
  | 'clock:line'
  | 'close:line'
  | 'document-contract:line'
  | 'family:line'
  | 'financial-health:line'
  | 'fingerprint-scan:line'
  | 'heart-medical:line'
  | 'info:line'
  | 'launch:line'
  | 'lock-closed:line'
  | 'login:line'
  | 'menu:line'
  | 'minus:line'
  | 'mobile:line'
  | 'phone:line'
  | 'plus:line'
  | 'search:line'
  | 'shield-check:line'
  | 'star:line'
  | 'user-male:line';

export function ZurichIcon({ name, className }: { name: ZurichIconName; className?: string }) {
  return <i z-icon="" icon={name} aria-hidden="true" className={className} />;
}
