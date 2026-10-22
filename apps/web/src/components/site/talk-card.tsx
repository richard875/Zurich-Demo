import { useId, type ReactNode } from 'react';
import { Headline } from '@/components/headline';
import { Button } from '@/components/ui/button';
import { ZurichIcon } from '@/components/zurich-icon';
import type { phones } from './links';

// The home page's mint "Want to talk to us?" card, sized for the flow pages' side column: 8px from
// the title to the line, 24px to the Call button.
export function TalkCard({
  phone,
  children,
}: {
  phone: (typeof phones)[keyof typeof phones];
  children: ReactNode;
}) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="rounded-card bg-mint p-6">
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
  );
}
