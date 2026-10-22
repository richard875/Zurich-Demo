import type { MouseEvent } from 'react';
import { Link } from '@modern-js/runtime/router';
import { Container } from '@/components/container';
import { ExternalLink } from '@/components/external-link';
import { Headline } from '@/components/headline';
import { ProductCard } from '@/components/product-card';
import { zurichLinks } from '@/components/site/links';
import { Button } from '@/components/ui/button';
import { QUOTE_START, useStartQuote } from '@/quote/start-quote';
import { photos } from './photos';

// Skips the quote chooser: Life starts with income protection off, Income Protection with it on.
function OnlineQuoteButton({ incomeProtection }: { incomeProtection: boolean }) {
  const startQuote = useStartQuote();
  const start = (event: MouseEvent) => {
    event.preventDefault();
    void startQuote(incomeProtection);
  };
  return (
    <Button asChild>
      <Link to={QUOTE_START} onClick={start}>
        Get an online quote
      </Link>
    </Button>
  );
}

export function Products() {
  return (
    <section aria-labelledby="products-heading">
      <Container>
        <Headline id="products-heading">Choose the product that suits your needs</Headline>
        <div className="mt-10 grid gap-x-6 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          <ProductCard
            photo={photos.productLife}
            teaser="Help care for the people who depend on you – even if you’re not around"
            title="Ezicover Life Insurance"
            description="Ezicover Life Insurance could help you protect and provide for loved ones who depend on you, with a lump sum payment if you die or become terminally ill."
            learnMore={{
              href: zurichLinks.lifeInsurance,
              label: 'Learn more about Ezicover Life Insurance',
            }}
            action={<OnlineQuoteButton incomeProtection={false} />}
          />
          <ProductCard
            photo={photos.productIncome}
            teaser="Help protect your ability to earn a living if things go wrong"
            title="Ezicover Income Protection"
            description="Ezicover Income Protection provides you a monthly payment for up to 5 years if you’re unable to work due to a sickness or injury."
            learnMore={{
              href: zurichLinks.incomeProtection,
              label: 'Learn more about Ezicover Income Protection',
            }}
            action={<OnlineQuoteButton incomeProtection />}
          />
          <ProductCard
            photo={photos.homeLoanCard}
            teaser="Buying a home is hard. Make sure you get protected"
            title="Zurich Home Loan Protection"
            description="Zurich Home Loan Protection can help you cover mortgage payments if you can’t work temporarily because of illness, injury or involuntary unemployment."
            learnMore={{
              href: zurichLinks.homeLoanProtection,
              label: 'Learn more about Home Loan Protection',
            }}
            action={
              <Button asChild variant="outline">
                <ExternalLink href={zurichLinks.homeLoanProtection}>Find out more</ExternalLink>
              </Button>
            }
          />
        </div>
      </Container>
    </section>
  );
}
