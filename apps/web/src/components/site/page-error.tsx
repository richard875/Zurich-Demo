import { Component, type ReactNode } from 'react';
import { Helmet } from '@modern-js/runtime/head';
import { Container } from '@/components/container';
import { Headline } from '@/components/headline';
import { IconCircle } from '@/components/icon-circle';
import { PromoCard } from '@/components/promo-card';
import { Button } from '@/components/ui/button';
import { photos } from '@/home/photos';

// What a visitor sees when a page fails to render or its script fails to load: the page-not-found
// card, saying what happened and offering a reload. Plain links and a full reload, because the app's
// own navigation may be what failed.
export function PageError() {
  return (
    <Container className="py-10 md:py-16">
      <Helmet>
        <title>Something went wrong | Zurich Direct (demo)</title>
      </Helmet>
      <PromoCard
        tone="pink"
        photo={photos.limeBandHands}
        actions={
          <>
            <Button size="md" onClick={() => window.location.reload()}>
              Try again
            </Button>
            <Button asChild variant="outline" size="md">
              <a href="/">Back to home</a>
            </Button>
          </>
        }
      >
        <IconCircle name="alert-circle:line" tone="white" />
        <Headline as="h1">
          Something went <em>wrong</em>
        </Headline>
        <p>Sorry, this page didn't load properly. Try again, or go back to the home page.</p>
      </PromoCard>
    </Container>
  );
}

// Catches a page that throws, or whose code fails to load, so the header and footer stay in place
// around PageError. The layout keys it by path, so moving to another page starts afresh.
export class PageErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? <PageError /> : this.props.children;
  }
}
