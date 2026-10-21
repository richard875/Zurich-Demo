// shadcn/ui RadioGroup (radix-nova style), sized for touch.
import * as React from 'react';
import { cn } from 'cn';
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui';

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn('grid w-full gap-3', className)}
      {...props}
    />
  );
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        'peer relative flex aspect-square size-6 shrink-0 items-center justify-center rounded-full border-2 border-input bg-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary',
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator data-slot="radio-group-indicator">
        <span className="block size-3 rounded-full bg-primary" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };
