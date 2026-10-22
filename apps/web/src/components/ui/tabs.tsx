// Radix Tabs drawn like zurich.com.au's: Zurich White pills, the selected one Dark Blue. Ours are
// 16px and 44px tall (zurich.com.au's are 14px) so they hold their own under the section heading.
import * as React from 'react';
import { Tabs as TabsPrimitive } from 'radix-ui';
import { cn } from '@/lib/cn';

function Tabs(props: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs" {...props} />;
}

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        // At 16px the four pills don't fit one row, so from md the list is just wide enough for two
        // a row (2 + 2, not 3 + 1). Below md they stack.
        'flex flex-col items-start gap-2 md:max-w-170 md:flex-row md:flex-wrap',
        className,
      )}
      {...props}
    />
  );
}

// One line from sm. Below it a long label may wrap rather than push the page sideways.
function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        'rounded-full bg-zurich-white px-4 py-2.5 text-left text-base font-medium sm:px-5 text-zurich-blue transition-colors data-[state=inactive]:hover:bg-dove data-[state=inactive]:hover:text-dark-blue data-active:bg-dark-blue data-active:text-white data-active:shadow-sm sm:whitespace-nowrap',
        className,
      )}
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
