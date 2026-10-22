import type { ReactNode } from 'react';
import { IconCircle } from '@/components/icon-circle';
import { ZurichIcon, type ZurichIconName } from '@/components/zurich-icon';

// A short message in a Zurich White panel: an icon, a line and what to do next. For the signed-out,
// no-quote and no-policies states.
export function MessagePanel({
  icon,
  children,
  action,
}: {
  icon: ZurichIconName;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="grid justify-items-start gap-6 rounded-card bg-zurich-white p-6 md:p-10">
      <IconCircle name={icon} />
      <p className="text-b-20">{children}</p>
      {action}
    </div>
  );
}

// Pulsing blocks in the shape of what's loading, with the message for screen readers. The footer
// stays hidden while one shows (globals.css).
export function LoadingPanel({ label, blocks = 1 }: { label: string; blocks?: number }) {
  return (
    <div role="status" data-slot="loading-panel">
      <span className="sr-only">{label}</span>
      <div aria-hidden="true" className="grid gap-6">
        {Array.from({ length: blocks }, (_, index) => (
          <div
            key={index}
            className="h-48 rounded-card bg-zurich-white motion-safe:animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

// A request that failed, read out as soon as it appears.
export function ErrorAlert({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-card bg-peach/15 p-4 font-medium ring-1 ring-peach"
    >
      <ZurichIcon name="alert-circle:line" className="mt-0.5 text-xl" />
      <p>{children}</p>
    </div>
  );
}
