import * as React from 'react';
import { ZurichIcon } from '@/components/zurich-icon';

// Pages this demo doesn't build open the real Zurich page in a new tab, and every such link says so.
export const newTab = { target: '_blank', rel: 'noopener noreferrer' } as const;

export function NewTabText() {
  return <span className="sr-only"> (opens in a new tab)</span>;
}

export function ExternalLink({
  children,
  ...props
}: Omit<React.ComponentProps<'a'>, 'target' | 'rel'> & { href: string }) {
  return (
    <a {...newTab} {...props}>
      {children}
      <ZurichIcon name="launch:line" />
      <NewTabText />
    </a>
  );
}
