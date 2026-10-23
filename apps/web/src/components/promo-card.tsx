import type { ReactNode } from 'react';
import { Photo, type PhotoSource } from '@/components/photo';
import { cn } from '@/lib/cn';
import { Settle } from '@/motion/reveal';

const tones = { mint: 'bg-mint', pink: 'bg-powder-pink', lime: 'bg-lime' };

// zurich.com.au's split card: a colour panel beside a photo from md, the panel above the photo below it.
// As the whole page (the received and 404 pages), it enters with the stage entrance: it rises 32px
// and fades in over 500ms, straight away.
export function PromoCard({
  tone,
  photo,
  children,
  actions,
  stage = false,
}: {
  tone: keyof typeof tones;
  photo: PhotoSource;
  children: ReactNode;
  actions: ReactNode;
  stage?: boolean;
}) {
  return (
    <div
      className={cn(
        'grid overflow-hidden rounded-promo md:grid-cols-2',
        stage && '[--stage-delay:0s] motion-safe:animate-stage-rise',
      )}
    >
      {/* Square from md, like zurich.com.au's, but free to grow if the copy needs more room. The
          same padding on every side: 24px, 40px from md. 24px from the heading to the copy, as in
          the lime band. */}
      <div className={cn('flex flex-col p-6 md:aspect-square md:p-10', tones[tone])}>
        <div className="grid gap-6 text-b-20 [&_a]:underline [&_a]:underline-offset-4">
          {children}
        </div>
        <div className="mt-auto flex flex-wrap gap-4 pt-6">{actions}</div>
      </div>
      {/* Inside a Reveal, the photo settles into its half as the card comes into view. */}
      <div className="relative aspect-square overflow-hidden md:aspect-auto">
        <Settle className="absolute inset-0">
          <Photo photo={photo} className="size-full object-cover" />
        </Settle>
      </div>
    </div>
  );
}
