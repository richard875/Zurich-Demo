// shadcn/ui Input (radix-nova style), taller for touch, using the global focus outline.
import * as React from 'react';
import { cn } from 'cn';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-12 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base transition-colors placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-peach aria-invalid:ring-2 aria-invalid:ring-peach',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
