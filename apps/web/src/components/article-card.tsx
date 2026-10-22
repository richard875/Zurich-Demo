import { newTab, NewTabText } from '@/components/external-link';
import { Photo, type PhotoSource } from '@/components/photo';
import { Tag } from '@/components/tag';

// One link per card, named by the title; its ::after stretches over the card so all of it is clickable.
export function ArticleCard({
  photo,
  tag,
  date,
  dateTime,
  title,
  href,
}: {
  photo: PhotoSource;
  tag: string;
  date: string;
  dateTime: string;
  title: string;
  href: string;
}) {
  return (
    <article className="group relative">
      <div className="relative">
        <Photo photo={photo} className="aspect-3/2 w-full rounded-card object-cover" />
        <Tag className="absolute top-3 left-3">{tag}</Tag>
      </div>
      <time dateTime={dateTime} className="mt-4 block text-sm font-medium">
        {date}
      </time>
      <h3 className="mt-1 text-b-18 font-semibold">
        <a
          href={href}
          {...newTab}
          className="underline-offset-4 group-hover:underline after:absolute after:inset-0 after:rounded-card focus-visible:outline-none focus-visible:after:outline-3 focus-visible:after:outline-offset-4 focus-visible:after:outline-dark-blue"
        >
          {title}
          <NewTabText />
        </a>
      </h3>
    </article>
  );
}
