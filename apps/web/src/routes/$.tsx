import { Helmet } from '@modern-js/runtime/head';
import { Link } from '@modern-js/runtime/router';
import { Container } from '@/components/container';
import { Headline } from '@/components/headline';
import { IconCircle } from '@/components/icon-circle';
import { PromoCard } from '@/components/promo-card';
import { QuoteChooser } from '@/components/site/quote-chooser';
import { Button } from '@/components/ui/button';
import { photos } from '@/home/photos';

// Any address the app doesn't have, inside the site's header and footer, in the home page's pink
// promo card. $.data.ts keeps the 404 status.
export default function NotFoundPage() {
  return (
    <Container className="py-10 md:py-16">
      <Helmet>
        <title>Page not found | Zurich Direct (demo)</title>
      </Helmet>
      <PromoCard
        tone="pink"
        photo={photos.limeBandHands}
        actions={
          <>
            <Button asChild size="md">
              <Link to="/">Back to home</Link>
            </Button>
            <QuoteChooser>
              <Button variant="outline" size="md">
                Get a quote
              </Button>
            </QuoteChooser>
          </>
        }
      >
        <IconCircle name="search:line" tone="white" />
        <Headline as="h1">
          Page not <em>found</em>
        </Headline>
        <p>
          We can't find the page you're looking for. It may have moved, or the link may be wrong.
        </p>
      </PromoCard>
    </Container>
  );
}
