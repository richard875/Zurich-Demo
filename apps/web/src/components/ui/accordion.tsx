// Radix Accordion between dividers. "plus" puts a plus/minus before the label, like Zurich Direct's
// offer terms; "chevron" puts a chevron after it, like zurich.com.au's mobile footer.
import * as React from 'react';
import { Accordion as AccordionPrimitive } from 'radix-ui';
import { ZurichIcon } from '@/components/zurich-icon';
import { cn } from '@/lib/cn';

function Accordion(props: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn('border-b border-dove first:border-t', className)}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  icon = 'plus',
  level: Heading = 'h3',
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger> & {
  icon?: 'plus' | 'chevron';
  level?: 'h2' | 'h3';
}) {
  return (
    <AccordionPrimitive.Header asChild>
      <Heading className="flex">
        <AccordionPrimitive.Trigger
          data-slot="accordion-trigger"
          className={cn(
            'group flex flex-1 items-center gap-4 py-5 text-left text-b-18',
            icon === 'chevron' && 'justify-between',
            className,
          )}
          {...props}
        >
          {icon === 'plus' && (
            <>
              <ZurichIcon name="plus:line" className="text-2xl group-data-[state=open]:hidden" />
              <ZurichIcon
                name="minus:line"
                className="hidden text-2xl group-data-[state=open]:inline-block"
              />
            </>
          )}
          {children}
          {icon === 'chevron' && (
            <ZurichIcon
              name="arrow-down:line"
              className="text-xl transition-transform group-data-[state=open]:rotate-180"
            />
          )}
        </AccordionPrimitive.Trigger>
      </Heading>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="overflow-hidden text-base motion-safe:data-open:animate-accordion-down motion-safe:data-closed:animate-accordion-up"
      {...props}
    >
      <div className={cn('pb-6', className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
