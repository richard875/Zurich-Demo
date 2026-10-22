// shadcn/ui Button (radix-nova style), reshaped into zurich.com.au's pills.
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-transparent text-lg font-normal whitespace-nowrap transition-[color,background-color,box-shadow] select-none disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_i]:text-[1.25em]',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-sm hover:bg-dark-blue hover:shadow-md',
        // For Zurich Blue backgrounds.
        inverse: 'bg-white text-primary shadow-sm hover:bg-zurich-white hover:shadow-md',
        outline:
          'border-primary bg-background text-primary shadow-sm hover:bg-muted hover:shadow-md',
        ghost: 'text-primary hover:bg-muted',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-12 px-6',
        sm: 'h-10 px-4 text-base',
        // 44px, as the product cards' "Get an online quote: every worded button on the site, the
        // quote, apply and policies pages included. The header's "Get a quote" pill is the one exception,
        // overridden to 40px with 16px text.
        md: 'h-11 px-6',
        // Full-width choices, as in the quote chooser. Long labels wrap rather than overflow on phones.
        lg: 'min-h-14 w-full px-6 py-3 text-center whitespace-normal',
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
