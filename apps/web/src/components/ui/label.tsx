// shadcn/ui Label (radix-nova style), at Zurich's body size.
import * as React from 'react';
import { cn } from 'cn';
import { Label as LabelPrimitive } from 'radix-ui';

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
