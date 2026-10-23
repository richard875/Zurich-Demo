import type { ReactNode } from 'react';
import { Container } from '@/components/container';
import { Shapes } from '@/components/shapes';

// The flow pages' opening: the home hero's Zurich Blue band, without the photo, and its shapes
// resting on the bottom edge. 40px above the text, 64px above and below it from md, as between the
// home page's sections. Its stage entrance plays when it mounts, from the stylesheet alone: from
// 0.2s each line of text rises 32px into place, the heading from 10% opacity. It stays put as the
// quote moves between steps.
export function PageBand({ children }: { children: ReactNode }) {
  return (
    <div className="on-blue bg-zurich-blue text-white">
      <Container className="flex flex-col md:flex-row md:items-end md:justify-between md:gap-16">
        <div className="max-w-180 pt-10 motion-safe:*:animate-stage-rise md:py-16 [&>h1]:[--stage-opacity:0.1]">
          {children}
        </div>
        <Shapes
          arrangement="hero"
          className="mt-8 -mr-4 aspect-[267/144] h-16 shrink-0 self-end motion-safe:animate-stage-shape-slide-in sm:-mr-6 md:mt-0 md:mr-0 md:h-24"
        />
      </Container>
    </div>
  );
}

// The flow pages' body under the band: the page's content, at most 768px wide, with a side column
// from lg that stays in view as the page scrolls. Below lg the side column follows the content, and
// stays hidden while the content is loading (globals.css).
export function FlowLayout({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <Container className="grid grid-cols-1 gap-10 py-10 md:gap-16 md:py-16 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="w-full max-w-3xl min-w-0">{children}</div>
      {aside && (
        <div data-slot="flow-aside" className="grid content-start gap-6 lg:sticky lg:top-32">
          {aside}
        </div>
      )}
    </Container>
  );
}
