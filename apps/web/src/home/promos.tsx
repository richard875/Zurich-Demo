import { Container } from '@/components/container';
import { ExternalLink } from '@/components/external-link';
import { Headline } from '@/components/headline';
import { PromoCard } from '@/components/promo-card';
import { phones } from '@/components/site/links';
import { QuoteChooser } from '@/components/site/quote-chooser';
import { Button } from '@/components/ui/button';
import { ZurichIcon } from '@/components/zurich-icon';
import { photos } from './photos';

// The card is about talking to us, so Call leads and Get a quote follows. The two share a width:
// side by side where both fit, otherwise stacked full width.
export function TalkToUs() {
  return (
    <section aria-labelledby="talk-heading">
      <Container>
        <PromoCard
          tone="mint"
          photo={photos.talkToUs}
          actions={
            <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(14.5rem,1fr))] gap-4">
              <Button asChild size="md">
                <a href={phones.sales.href}>
                  <ZurichIcon name="phone:line" />
                  Call {phones.sales.number}
                </a>
              </Button>
              <QuoteChooser>
                <Button variant="outline" size="md" className="cursor-pointer">
                  Get a quote
                </Button>
              </QuoteChooser>
            </div>
          }
        >
          <Headline id="talk-heading">
            Want to <em>talk</em> to us?
          </Headline>
          {/* A number never breaks across lines. */}
          <p>
            Call{' '}
            <a href={phones.sales.href} className="whitespace-nowrap">
              {phones.sales.number}
            </a>{' '}
            to get a quote and apply, or existing customers call our Customer Care team on{' '}
            <a href={phones.customerCare.href} className="whitespace-nowrap">
              {phones.customerCare.number}
            </a>
          </p>
        </PromoCard>
      </Container>
    </section>
  );
}

export function HomeLoanPromo() {
  return (
    <section aria-labelledby="home-loan-heading">
      <Container>
        <PromoCard
          tone="pink"
          photo={photos.homeLoanPromo}
          actions={
            <Button asChild size="md">
              <ExternalLink href="https://direct.zurich.com.au/hlp">Learn more</ExternalLink>
            </Button>
          }
        >
          <Headline id="home-loan-heading">
            Stress less about your <em>mortgage</em> with Zurich Home Loan Protection.
          </Headline>
        </PromoCard>
      </Container>
    </section>
  );
}
