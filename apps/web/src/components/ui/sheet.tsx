// A Radix Dialog that slides in from the right: 480px wide, full screen on phones. Radix traps focus,
// closes on Esc and on the overlay, and hands focus back to the trigger. The bottom padding matches
// the sides.
import * as React from 'react';
import { Dialog as SheetPrimitive } from 'radix-ui';
import { Button } from '@/components/ui/button';
import { ZurichIcon } from '@/components/zurich-icon';
import { cn } from '@/lib/cn';

function Sheet(props: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger(props: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose(props: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content>) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay
        data-slot="sheet-overlay"
        className="fixed inset-0 z-50 bg-dark-blue/40 duration-200 motion-safe:data-open:animate-in motion-safe:data-open:fade-in-0 motion-safe:data-closed:animate-out motion-safe:data-closed:fade-out-0"
      />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex w-full flex-col overflow-y-auto bg-popover px-4 pt-16 pb-4 text-popover-foreground shadow-lg duration-200 sm:max-w-[480px] sm:px-12 sm:pt-20 sm:pb-12 motion-safe:data-open:animate-in motion-safe:data-open:slide-in-from-right motion-safe:data-open:ease-sheet-in motion-safe:data-closed:animate-out motion-safe:data-closed:slide-out-to-right motion-safe:data-closed:ease-sheet-out',
          className,
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close asChild>
          <Button
            variant="ghost"
            size="sm"
            // 44px to tap, its icon where the 40px button had it.
            className="absolute top-2.5 right-2.5 size-11 px-0 sm:top-5.5 sm:right-5.5"
          >
            <ZurichIcon name="close:line" />
            <span className="sr-only">Close</span>
          </Button>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn('text-h-32 font-light', className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn('text-b-18', className)}
      {...props}
    />
  );
}

export { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger };
