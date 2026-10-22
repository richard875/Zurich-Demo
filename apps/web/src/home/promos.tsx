import { Container } from '@/components/container';
import { ExternalLink } from '@/components/external-link';
import { Headline } from '@/components/headline';
import { PromoCard } from '@/components/promo-card';
import { phones } from '@/components/site/links';
import { QuoteChooser } from '@/components/site/quote-chooser';
import { Button } from '@/components/ui/button';
import { photos } from './photos';

export function TalkToUs() {
  return (
    <section aria-labelledby="talk-heading">
      <Container>
        <PromoCard
          tone="mint"
          photo={photos.talkToUs}
          actions={
            <>
              <QuoteChooser>
                <Button>Get a quote</Button>
              </QuoteChooser>
              <Button asChild variant="outline">
                <a href={phones.sales.href}>Call {phones.sales.number}</a>
              </Button>
            </>
          }
        >
          <Headline id="talk-heading">
            Want to <em>talk</em> to us?
          </Headline>
          <p>
            Call <a href={phones.sales.href}>{phones.sales.number}</a> to get a quote and apply, or
            existing customers call our Customer Care team on{' '}
            <a href={phones.customerCare.href}>{phones.customerCare.number}</a>
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
            <Button asChild>
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
