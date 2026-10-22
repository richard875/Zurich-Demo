// shadcn/ui Checkbox (radix-nova style) with the Zurich check icon. Ticked, it fills Dark Blue like the
// chosen Yes or No pill.
import * as React from 'react';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';
import { ZurichIcon } from '@/components/zurich-icon';
import { cn } from '@/lib/cn';

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-[0.375rem] border-2 border-input bg-white text-white transition-colors hover:border-zurich-blue disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-peach data-[state=checked]:border-dark-blue data-[state=checked]:bg-dark-blue',
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
