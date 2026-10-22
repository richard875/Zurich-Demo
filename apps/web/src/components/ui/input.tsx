// shadcn/ui Input (radix-nova style), taller for touch, using the global focus outline.
import * as React from 'react';
import { cn } from '@/lib/cn';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-12 w-full min-w-0 rounded-input border border-input bg-white px-4 text-base transition-colors placeholder:text-muted-foreground hover:border-zurich-blue disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-peach aria-invalid:ring-2 aria-invalid:ring-peach',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
