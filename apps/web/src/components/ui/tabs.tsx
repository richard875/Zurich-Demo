// Radix Tabs as a row of pills. Below md the row scrolls sideways, like Zurich Direct's mobile tabs.
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
        // The negative margin lets pills scroll to the screen edge; the padding keeps focus rings visible.
        '-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 py-1.5 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:px-6 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden',
        className,
      )}
      {...props}
    />
  );
}

// Arrow keys and clicks can pick a pill that's partly off screen, so bring it fully into view.
function reveal(element: HTMLElement) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  element.scrollIntoView({
    block: 'nearest',
    inline: 'nearest',
    behavior: reduceMotion ? 'auto' : 'smooth',
  });
}

function TabsTrigger({
  className,
  onFocus,
  onClick,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        'min-h-12 shrink-0 snap-start rounded-full border-2 border-zurich-blue px-5 py-2 text-base leading-tight whitespace-nowrap text-zurich-blue transition-colors data-[state=inactive]:hover:bg-muted data-active:bg-zurich-blue data-active:text-white md:whitespace-normal',
        className,
      )}
      onFocus={(event) => {
        reveal(event.currentTarget);
        onFocus?.(event);
      }}
      onClick={(event) => {
        reveal(event.currentTarget);
        onClick?.(event);
      }}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content data-slot="tabs-content" className={cn('mt-8', className)} {...props} />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
