import type { ReactNode } from 'react';
import { Link } from '@modern-js/runtime/router';
import { newTab, NewTabText } from '@/components/external-link';
import { ZurichIcon } from '@/components/zurich-icon';
import { cn } from '@/lib/cn';

const linkClass =
  'inline-flex items-start gap-2 text-b-20 text-zurich-blue underline-offset-4 hover:underline';

// zurich.com.au's text link: a Zurich Blue circle with a white chevron, or the external-link icon.
export function IconLink({
  href,
  external = false,
  className,
  children,
}: {
  href: string;
  external?: boolean;
  className?: string;
  children: ReactNode;
}) {
  if (external) {
    return (
      <a href={href} {...newTab} className={cn(linkClass, className)}>
        <ZurichIcon name="launch:line" className="mt-[3px] text-2xl" />
        <span>
          {children}
          <NewTabText />
        </span>
      </a>
    );
  }
  return (
    <Link to={href} className={cn(linkClass, className)}>
      <span
        aria-hidden="true"
        className="mt-[3px] flex size-6 shrink-0 items-center justify-center rounded-full bg-zurich-blue text-white"
      >
        <ZurichIcon name="arrow-right:line" className="text-sm" />
      </span>
      <span>{children}</span>
    </Link>
  );
}
