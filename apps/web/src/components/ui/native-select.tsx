// shadcn/ui NativeSelect (radix-nova style) with the Zurich chevron icon.
import * as React from 'react';
import { ZurichIcon } from '@/components/zurich-icon';
import { cn } from '@/lib/cn';

function NativeSelect({ className, ...props }: React.ComponentProps<'select'>) {
  return (
    <div className={cn('relative w-full', className)} data-slot="native-select-wrapper">
      <select
        data-slot="native-select"
        className="h-12 w-full min-w-0 cursor-pointer appearance-none rounded-input border border-input bg-white pr-12 pl-4 text-base transition-colors hover:border-zurich-blue disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-peach aria-invalid:ring-2 aria-invalid:ring-peach"
        {...props}
      />
      <ZurichIcon
        name="arrow-down:line"
        className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-xl text-zurich-blue"
      />
    </div>
  );
}

export { NativeSelect };
