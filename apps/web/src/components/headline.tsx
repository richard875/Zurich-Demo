import * as React from 'react';
import { cn } from '@/lib/cn';

// zurich.com.au sets headlines in Zurich Sans with one emphasised word in Ogg, upright.
const sizes = {
  hero: 'text-h-44 font-light sm:text-h-48 md:text-h-60',
  // The flow pages' titles on their blue band: a step down from the hero.
  page: 'text-h-36 font-light md:text-h-48',
  section: 'text-h-32 font-medium md:text-h-36',
  list: 'text-h-32 font-light md:text-h-44',
  card: 'text-h-24 font-medium md:text-h-32 md:leading-[1.25]',
  // Side cards and sheets.
  small: 'text-h-24 font-medium',
};

export function Headline({
  as: Tag = 'h2',
  size = 'section',
  className,
  ...props
}: React.ComponentProps<'h2'> & {
  as?: 'h1' | 'h2' | 'h3' | 'h4';
  size?: keyof typeof sizes;
}) {
  return (
    <Tag
      className={cn(
        sizes[size],
        '[&_em]:font-display [&_em]:font-normal [&_em]:not-italic',
        className,
      )}
      {...props}
    />
  );
}
