import { useState } from 'react';
import { Helmet } from '@modern-js/runtime/head';
import { Outlet, useMatches } from '@modern-js/runtime/router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import favicon from '@/assets/zurich-favicon.png';
import { DemoBanner } from '@/components/site/demo-banner';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { cn } from '@/lib/cn';
import { SignInDialog } from '@/session/sign-in-dialog';
// Zurich Sans and Ogg, the logo masks, and only the icon sets this app uses. These are imported
// here, not in globals.css, because the packages don't export CSS under Tailwind's "style" condition.
import '@zurich/design-tokens/EmbeddedFonts.css';
import '@zurich/design-tokens/Brand.css';
import '@zurich/design-tokens/icons/action/line.css';
import '@zurich/design-tokens/icons/communication/line.css';
import '@zurich/design-tokens/icons/device/line.css';
import '@zurich/design-tokens/icons/health/line.css';
import '@zurich/design-tokens/icons/people/line.css';
import '@zurich/css-components/Logo.css';
import '@/styles/globals.css';

// Application received and the 404 page: one promo card, shorter than a screen.
const PROMO_CARD_PAGES = new Set(['apply/received/page', '$']);

export default function Layout() {
  // One client per browser session (and per server render), never shared between users.
  const [queryClient] = useState(() => new QueryClient());
  const promoCardPage = useMatches().some((match) => PROMO_CARD_PAGES.has(match.id));
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <Helmet htmlAttributes={{ lang: 'en-AU' }}>
          <link rel="icon" type="image/png" href={favicon} />
        </Helmet>
        <DemoBanner />
        <SiteHeader />
        {/* Modern.js streams each page in after the layout. A screen-tall main keeps the footer below
            the fold until the page arrives, so nothing jumps when it does. From md a promo card page
            holds its card's height instead, 64px above and below it, so the footer follows the card:
            half the container's width, as the card is square, but at least 496px, as narrower cards
            grow to fit their copy (the tallest, referred, is 492px at 768px). */}
        <main
          className={cn(
            'min-h-svh flex-1',
            promoCardPage && 'md:min-h-[calc(max((min(100vw,75rem)_-_3rem)/2,31rem)_+_8rem)]',
          )}
        >
          <Outlet />
        </main>
        <SiteFooter />
      </div>
      <SignInDialog />
    </QueryClientProvider>
  );
}
