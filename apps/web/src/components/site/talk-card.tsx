import { useId, type ReactNode } from 'react';
import { Headline } from '@/components/headline';
import { Button } from '@/components/ui/button';
import { ZurichIcon } from '@/components/zurich-icon';
import { Reveal } from '@/motion/reveal';
import type { phones } from './links';

// The home page's mint "Want to talk to us?" card, sized for the flow pages' side column: 8px from
// the title to the line, 24px to the Call button. It comes in wherever it shows: on screen as the
// page opens, it rises into place just after the band's text; waiting for the page's content (below
// lg, it follows it), it fades in as the content arrives; below the screen, as it's scrolled to.
export function TalkCard({
  phone,
  children,
}: {
  phone: (typeof phones)[keyof typeof phones];
  children: ReactNode;
}) {
  const id = useId();
  return (
    <Reveal>
      <section
        aria-labelledby={id}
        className="rounded-card bg-mint p-6 [--stage-delay:0.32s] motion-safe:animate-stage-rise"
      >
        <Headline id={id} size="small">
          Want to <em>talk</em> to us?
        </Headline>
        <p className="mt-2 text-b-18">{children}</p>
        <Button asChild variant="outline" size="md" className="mt-6 w-full">
          <a href={phone.href}>
            <ZurichIcon name="phone:line" />
            Call {phone.number}
          </a>
        </Button>
      </section>
    </Reveal>
  );
}
