import { newTab, NewTabText } from '@/components/external-link';
import { Photo, type PhotoSource } from '@/components/photo';
import { Tag } from '@/components/tag';
import { RevealItem } from '@/motion/reveal';

// One link per card, named by the title; its ::after stretches over the card so all of it is clickable.
// On hover the photo eases to 1.04 inside its frame; the tag stays put on top. In a RevealGroup,
// revealIndex is its place in the row's stagger, after the heading.
export function ArticleCard({
  photo,
  tag,
  date,
  dateTime,
  title,
  href,
  revealIndex,
}: {
  photo: PhotoSource;
  tag: string;
  date: string;
  dateTime: string;
  title: string;
  href: string;
  revealIndex?: number;
}) {
  return (
    <RevealItem as="article" index={revealIndex} className="group relative">
      <div className="relative isolate overflow-hidden rounded-card">
        <Photo
          photo={photo}
          className="aspect-3/2 w-full object-cover transition-[scale] duration-(--motion-settle) ease-entrance motion-safe:group-hover:scale-104"
        />
        <Tag className="absolute top-4 left-4">{tag}</Tag>
      </div>
      {/* As the product cards: 24px from the photo, 8px from the date to the title. */}
      <time dateTime={dateTime} className="mt-6 block text-sm font-medium">
        {date}
      </time>
      <h3 className="mt-2 text-b-18 font-semibold">
        <a
          href={href}
          {...newTab}
          className="underline-offset-4 group-hover:underline after:absolute after:inset-0 after:rounded-card focus-visible:outline-none focus-visible:after:outline-3 focus-visible:after:outline-offset-4 focus-visible:after:outline-dark-blue"
        >
          {title}
          <NewTabText />
        </a>
      </h3>
    </RevealItem>
  );
}
