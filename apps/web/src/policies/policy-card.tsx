import { formatCents, formatWholeDollars } from '@shared/money';
import type { Policy } from '@shared/application';
import { IconCircle } from '@/components/icon-circle';
import { ZurichIcon, type ZurichIconName } from '@/components/zurich-icon';
import { cn } from '@/lib/cn';
import { Reveal } from '@/motion/reveal';

// Each status is a coloured pill with its own icon, so it never relies on colour alone.
const STATUS: Record<Policy['status'], { label: string; pill: string; icon?: ZurichIconName }> = {
  PROCESSING: { label: 'Processing', pill: 'bg-lemon' },
  ACTIVE: { label: 'Active', pill: 'bg-mint', icon: 'check:line' },
  REFERRED: { label: 'Being reviewed', pill: 'bg-lemon', icon: 'clock:line' },
};

const appliedOn = new Intl.DateTimeFormat('en-AU', { dateStyle: 'medium' });

// The cover step's card: the product's icon and name, its status pill, and the details in a Zurich
// White panel inside. The cards that arrive on screen with the list fade and rise in one after
// another, as the home page's do; the rest reveal as they're scrolled to. When the policy has just
// turned active while the page is open, the pill fades from Lemon to Mint (a Lemon layer fading out
// over it) and its tick pops; the label swaps at once. With reduced motion, all of it is still.
export function PolicyCard({
  policy,
  revealIndex,
  justActivated,
}: {
  policy: Policy;
  revealIndex: number;
  justActivated: boolean;
}) {
  const status = STATUS[policy.status];
  return (
    <Reveal
      as="li"
      entrance={revealIndex}
      className="grid gap-6 rounded-card bg-white p-6 ring-1 ring-dove md:p-10"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <IconCircle name="family:line" />
          <div className="grid gap-1">
            <h2 className="text-b-20 font-semibold">
              {formatWholeDollars(policy.lifeCover)} Ezicover Life Insurance
            </h2>
            {policy.incomeProtection !== null && (
              <p className="text-muted-foreground">
                with Ezicover Income Protection of {formatWholeDollars(policy.incomeProtection)} a
                month
              </p>
            )}
          </div>
        </div>
        <p
          className={cn(
            'relative isolate inline-flex items-center gap-2 overflow-hidden rounded-full px-3 py-1 text-sm font-medium',
            status.pill,
          )}
          data-testid="policy-status"
        >
          {justActivated && (
            <span
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-lemon [--tw-animation-fill-mode:forwards] motion-safe:animate-out motion-safe:fade-out motion-safe:duration-(--motion-confirm) motion-safe:ease-state motion-reduce:hidden"
            />
          )}
          {status.icon ? (
            <ZurichIcon
              name={status.icon}
              className={cn('text-base', justActivated && 'motion-safe:animate-pop')}
            />
          ) : (
            // Processing pulses while the policy is being set up.
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-dark-blue motion-safe:animate-pulse"
            />
          )}
          {status.label}
        </p>
      </div>
      <dl className="grid gap-4 rounded-input bg-zurich-white p-4 sm:grid-cols-3 md:px-6">
        <div className="grid gap-1">
          <dt className="text-sm text-muted-foreground">Premium</dt>
          <dd className="font-medium">{formatCents(policy.monthlyPremiumCents)} a month</dd>
        </div>
        <div className="grid gap-1">
          <dt className="text-sm text-muted-foreground">Applied</dt>
          <dd className="font-medium">{appliedOn.format(new Date(policy.createdAt))}</dd>
        </div>
        <div className="grid gap-1">
          <dt className="text-sm text-muted-foreground">Policy number</dt>
          <dd className="font-medium" data-testid="policy-number">
            {policy.policyNumber ?? (policy.status === 'REFERRED' ? 'After review' : 'Coming soon')}
          </dd>
        </div>
      </dl>
    </Reveal>
  );
}
