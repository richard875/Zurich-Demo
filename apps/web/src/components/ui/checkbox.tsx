// shadcn/ui Checkbox (radix-nova style) with the Zurich check icon.
import * as React from 'react';
import { cn } from 'cn';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';
import { ZurichIcon } from '@/components/zurich-icon';

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer flex size-6 shrink-0 items-center justify-center rounded-sm border-2 border-input bg-background text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator data-slot="checkbox-indicator">
        <ZurichIcon name="check:line" className="text-lg" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
