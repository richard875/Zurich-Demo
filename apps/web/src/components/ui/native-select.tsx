// shadcn/ui NativeSelect (radix-nova style) with the Zurich chevron icon.
import * as React from 'react';
import { ZurichIcon } from '@/components/zurich-icon';
import { cn } from '@/lib/cn';

function NativeSelect({ className, ...props }: React.ComponentProps<'select'>) {
  return (
    <div className={cn('relative w-full', className)} data-slot="native-select-wrapper">
      <select
        data-slot="native-select"
        className="h-12 w-full min-w-0 appearance-none rounded-input border border-input bg-background pr-10 pl-3 text-base transition-colors disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-peach aria-invalid:ring-2 aria-invalid:ring-peach"
        {...props}
      />
      <ZurichIcon
        name="arrow-down:line"
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xl text-zurich-blue"
      />
    </div>
  );
}

export { NativeSelect };
