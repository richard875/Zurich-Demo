import * as React from 'react';
import { cn } from '@/lib/cn';

export function Tag({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-zurich-blue px-3 py-0.5 text-sm font-medium text-white',
        className,
      )}
      {...props}
    />
  );
}
