import type { ReactNode } from 'react';
import { Container } from '@/components/container';
import { ExternalLink } from '@/components/external-link';
import { Headline } from '@/components/headline';
import { zurichLinks } from '@/components/site/links';
import { ZurichIcon, type ZurichIconName } from '@/components/zurich-icon';

const benefits: { icon: ZurichIconName; title: string; body: ReactNode }[] = [
  {
    icon: 'star:line',
    title: 'Exclusive rewards program',
    body: (
      <>
        Get access to Zurich's{' '}
        <ExternalLink href={zurichLinks.lovingLife} className="text-zurich-blue underline">
          Loving Life
        </ExternalLink>{' '}
        rewards program, with lifestyle and entertainment offers from the team behind the
        Entertainment™ Book.
      </>
    ),
  },
  {
    icon: 'document-contract:line',
    title: 'Complimentary legal Will from Willed',
    body: 'Write a Will online in as little as 15 minutes and get peace of mind for you and your loved ones.',
  },
  {
    icon: 'mobile:line',
    title: 'Access to My Zurich',
    body: 'My Zurich, our customer portal, makes it simple for you to manage your policy on the go, on any device, at any time.',
  },
];

export function Benefits() {
  return (
    <section aria-labelledby="benefits-heading" className="bg-zurich-white py-10 md:py-16">
      <Container>
        <Headline id="benefits-heading">
          Get <em>more</em> out of your life and income insurance
        </Headline>
        <ul className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
          {benefits.map((benefit) => (
            <li key={benefit.title}>
              <span className="flex size-12 items-center justify-center rounded-full bg-zurich-blue text-white">
                <ZurichIcon name={benefit.icon} className="text-2xl" />
              </span>
              <h3 className="mt-4 text-b-20 font-semibold">{benefit.title}</h3>
              <p className="mt-2 text-b-18">{benefit.body}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
