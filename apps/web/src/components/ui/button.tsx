// shadcn/ui Button (radix-nova style), resized to Zurich's larger touch targets.
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from 'cn';
import { Slot } from 'radix-ui';

const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-transparent text-base font-medium whitespace-nowrap transition-colors select-none disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_i]:text-[1.25em]',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-dark-blue',
        outline: 'border-primary bg-background text-primary hover:bg-muted',
        ghost: 'text-primary hover:bg-muted',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-12 px-6',
        sm: 'h-10 px-4 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
