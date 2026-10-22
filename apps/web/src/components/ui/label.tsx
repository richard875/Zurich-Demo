// shadcn/ui Label (radix-nova style), at Zurich's body size.
import * as React from 'react';
import { Label as LabelPrimitive } from 'radix-ui';
import { cn } from '@/lib/cn';

function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn('text-base leading-snug font-medium select-none', className)}
      {...props}
    />
  );
}

export { Label };
