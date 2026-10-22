// shadcn/ui RadioGroup (radix-nova style), drawn as pills like Zurich Direct's Yes and No buttons.
// The chosen pill fills Dark Blue with a tick, as the selected cover tab does, and the arrow keys still
// move between them. Each item's text is its label. Only hover fades: choosing switches at once, so
// the white text never sits on a half-filled pill.
import * as React from 'react';
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui';
import { ZurichIcon } from '@/components/zurich-icon';
import { cn } from '@/lib/cn';

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn('flex flex-wrap gap-4', className)}
      {...props}
    />
  );
}

function RadioGroupItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        'inline-flex h-12 min-w-28 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-input bg-white px-6 text-lg disabled:cursor-not-allowed disabled:opacity-50 in-aria-invalid:border-peach data-[state=checked]:border-dark-blue data-[state=checked]:bg-dark-blue data-[state=checked]:text-white data-[state=unchecked]:transition-colors data-[state=unchecked]:hover:border-zurich-blue data-[state=unchecked]:hover:bg-zurich-white',
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator data-slot="radio-group-indicator" className="flex">
        <ZurichIcon name="check:line" className="text-xl" />
      </RadioGroupPrimitive.Indicator>
      {children}
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };
