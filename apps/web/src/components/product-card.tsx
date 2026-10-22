import type { ReactNode } from 'react';
import { Headline } from '@/components/headline';
import { IconLink } from '@/components/icon-link';
import { Photo, type PhotoSource } from '@/components/photo';

// zurich.com.au's product card: no outline, a rounded photo, then copy, a link and one button.
export function ProductCard({
  photo,
  teaser,
  title,
  description,
  learnMore,
  action,
}: {
  photo: PhotoSource;
  teaser: string;
  title: string;
  description: string;
  learnMore: { href: string; label: string };
  action: ReactNode;
}) {
  return (
    <article className="flex flex-col">
      <Photo photo={photo} className="aspect-[3/2] w-full rounded-card object-cover" />
      <p className="mt-6 text-sm font-semibold">{teaser}</p>
      <Headline as="h3" size="card" className="mt-2">
        {title}
      </Headline>
      <p className="mt-4 text-b-20">{description}</p>
      <IconLink href={learnMore.href} external className="mt-6">
        {learnMore.label}
      </IconLink>
      {/* Pinned to the bottom so the buttons line up across a row of cards. */}
      <div className="mt-auto pt-8">{action}</div>
    </article>
  );
}
