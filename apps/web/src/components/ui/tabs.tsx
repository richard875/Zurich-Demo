// Radix Tabs drawn like zurich.com.au's: a wrapping row of 14px Zurich White pills, the selected one
// Dark Blue.
import * as React from 'react';
import { Tabs as TabsPrimitive } from 'radix-ui';
import { cn } from '@/lib/cn';

// After the first switch the tabs carry data-switched, and from then on the panel switched to fades in
// (globals.css). The panel shown on load doesn't.
function Tabs({ onValueChange, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  const [switched, setSwitched] = React.useState(false);
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-switched={switched ? '' : undefined}
      onValueChange={(value) => {
        setSwitched(true);
        onValueChange?.(value);
      }}
      {...props}
    />
  );
}

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn('flex flex-wrap gap-2', className)}
      {...props}
    />
  );
}

// The same pill at every width. Below sm a label wider than the screen, as the longest is at 320px,
// wraps rather than push the page sideways. A clicked or tapped pill shows no focus ring; one
// reached by keyboard does. Browsers can ring a clicked tab under :focus-visible, so the pointer is
// tracked here instead: data-pointer is set on press and cleared by any key or by leaving the pill.
function TabsTrigger({
  className,
  onPointerDown,
  onKeyDown,
  onBlur,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        'rounded-full bg-zurich-white px-4 py-2 text-left text-sm font-medium text-zurich-blue transition-colors data-pointer:outline-none data-[state=inactive]:hover:bg-dove data-[state=inactive]:hover:text-dark-blue data-active:bg-dark-blue data-active:text-white data-active:shadow-sm sm:whitespace-nowrap',
        className,
      )}
      onPointerDown={(event) => {
        event.currentTarget.dataset.pointer = '';
        onPointerDown?.(event);
      }}
      onKeyDown={(event) => {
        delete event.currentTarget.dataset.pointer;
        onKeyDown?.(event);
      }}
      onBlur={(event) => {
        delete event.currentTarget.dataset.pointer;
        onBlur?.(event);
      }}
      {...props}
    />
  );
}

// Every panel stays mounted in the same cell of a one-cell grid (wrap them in `grid`), so the tabs
// are as tall as the tallest panel and nothing below moves when they switch. Inactive panels are
// invisible, which keeps them out of the tab order and the accessibility tree. Below md, where the
// panels are long, they're hidden instead, so a short panel leaves no gap.
function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      forceMount
      className={cn(
        'col-start-1 row-start-1 data-[state=inactive]:invisible max-md:data-[state=inactive]:hidden',
        className,
      )}
      {...props}
    />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
