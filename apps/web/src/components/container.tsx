import * as React from 'react';
import { cn } from '@/lib/cn';

// zurich.com.au's page width: 1110px of content inside 24px padding.
export function Container({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('mx-auto w-full max-w-289.5 px-4 sm:px-6', className)} {...props} />;
}
