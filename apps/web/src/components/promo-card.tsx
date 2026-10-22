import type { ReactNode } from 'react';
import { Photo, type PhotoSource } from '@/components/photo';
import { cn } from '@/lib/cn';

const tones = { mint: 'bg-mint', pink: 'bg-powder-pink' };

// zurich.com.au's split card: a colour panel beside a photo from md, the panel above the photo below it.
export function PromoCard({
  tone,
  photo,
  children,
  actions,
}: {
  tone: keyof typeof tones;
  photo: PhotoSource;
  children: ReactNode;
  actions: ReactNode;
}) {
  return (
    <div className="grid overflow-hidden rounded-promo md:grid-cols-2">
      {/* Square from md, like zurich.com.au's, but free to grow if the copy needs more room. */}
      <div className={cn('flex flex-col p-6 pb-5 md:aspect-square md:p-12', tones[tone])}>
        <div className="grid gap-4 text-b-20 [&_a]:underline [&_a]:underline-offset-4">
          {children}
        </div>
        <div className="mt-auto flex flex-wrap gap-4 pt-8">{actions}</div>
      </div>
      <div className="relative aspect-square md:aspect-auto">
        <Photo photo={photo} className="absolute inset-0 size-full object-cover" />
      </div>
    </div>
  );
}
