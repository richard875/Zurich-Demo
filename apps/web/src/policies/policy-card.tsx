import { formatCents, formatWholeDollars } from '@shared/money';
import type { Policy } from '@shared/application';
import { cn } from '@/lib/cn';

const STATUS = {
  PROCESSING: {
    label: 'Processing',
    dot: 'bg-lemon ring-1 ring-dark-blue/30 motion-safe:animate-pulse',
  },
  ACTIVE: { label: 'Active', dot: 'bg-moss' },
  REFERRED: { label: 'Being reviewed', dot: 'bg-sand-stone ring-1 ring-dark-blue/30' },
} as const;

const appliedOn = new Intl.DateTimeFormat('en-AU', { dateStyle: 'medium' });

export function PolicyCard({ policy }: { policy: Policy }) {
  const status = STATUS[policy.status];
  return (
    <li className="grid gap-4 rounded-xl p-6 ring-1 ring-dove">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-medium">
            {formatWholeDollars(policy.lifeCover)} Ezicover Life Insurance
          </h2>
          {policy.incomeProtection !== null && (
            <p className="text-muted-foreground">
              with Ezicover Income Protection of {formatWholeDollars(policy.incomeProtection)} a
              month
            </p>
          )}
        </div>
        <p className="flex items-center gap-2 font-medium" data-testid="policy-status">
          <span className={cn('size-2.5 rounded-full', status.dot)} aria-hidden="true" />
          {status.label}
        </p>
      </div>
      <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-muted-foreground">Premium</dt>
          <dd>{formatCents(policy.monthlyPremiumCents)} a month</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Applied</dt>
          <dd>{appliedOn.format(new Date(policy.createdAt))}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Policy number</dt>
          <dd data-testid="policy-number">
            {policy.policyNumber ?? (policy.status === 'REFERRED' ? 'After review' : 'Coming soon')}
          </dd>
        </div>
      </dl>
    </li>
  );
}
