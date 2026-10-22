// shadcn/ui Slider (radix-nova style), narrowed to one thumb so labels and
// aria-valuetext can go on the thumb, which is the element screen readers focus.
import * as React from 'react';
import { Slider as SliderPrimitive } from 'radix-ui';
import { cn } from '@/lib/cn';

type SliderProps = Omit<
  React.ComponentProps<typeof SliderPrimitive.Root>,
  'value' | 'defaultValue' | 'onValueChange'
> & {
  value: number;
  onValueChange: (value: number) => void;
  thumbProps: React.ComponentProps<typeof SliderPrimitive.Thumb>;
};

function Slider({ className, value, onValueChange, thumbProps, ...props }: SliderProps) {
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      value={[value]}
      onValueChange={([next]) => {
        if (next !== undefined) onValueChange(next);
      }}
      className={cn('relative flex h-8 w-full touch-none items-center select-none', className)}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative h-2 w-full grow overflow-hidden rounded-full bg-dove"
      >
        <SliderPrimitive.Range data-slot="slider-range" className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        data-slot="slider-thumb"
        className="block size-7 cursor-grab rounded-full border-2 border-primary bg-white shadow-md transition-transform active:cursor-grabbing motion-safe:hover:scale-110"
        {...thumbProps}
      />
    </SliderPrimitive.Root>
  );
}

export { Slider };
