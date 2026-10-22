import type { ReactNode } from 'react';
import { Headline } from '@/components/headline';
import { newTab, NewTabText } from '@/components/external-link';
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
      <Photo photo={photo} className="aspect-3/2 w-full rounded-card object-cover" />
      <p className="mt-6 text-sm font-semibold h-10">{teaser}</p>
      <Headline as="h3" size="card" className="mt-2">
        {title}
      </Headline>
      <p className="mt-3 text-b-20">{description}</p>
      <a
        href={learnMore.href}
        {...newTab}
        className="mt-4 text-base text-zurich-blue underline-offset-4 hover:underline"
      >
        {learnMore.label}
        <NewTabText />
      </a>
      {/* Pinned to the bottom so the buttons line up across a row of cards. */}
      <div className="mt-auto pt-6">{action}</div>
    </article>
  );
}
