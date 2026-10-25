import { useState } from 'react';
import { Helmet } from '@modern-js/runtime/head';
import { Outlet, useLocation } from '@modern-js/runtime/router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import favicon from '@/assets/zurich-favicon.png';
import { DemoBanner } from '@/components/site/demo-banner';
import { PageErrorBoundary } from '@/components/site/page-error';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
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

export default function Layout() {
  // One client per browser session (and per server render), never shared between users.
  const [queryClient] = useState(() => new QueryClient());
  const { pathname } = useLocation();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <Helmet htmlAttributes={{ lang: 'en-AU' }}>
          <link rel="icon" type="image/png" href={favicon} />
        </Helmet>
        <DemoBanner />
        <SiteHeader />
        {/* As tall as the page, so the footer follows it after the page's own bottom spacing, the
            same as its top. Only a page shorter than the screen is stretched, to keep the footer at
            the bottom. The footer stays hidden until the page is in place (globals.css). */}
        <main className="flex-1">
          <PageErrorBoundary key={pathname}>
            <Outlet />
          </PageErrorBoundary>
        </main>
        <SiteFooter />
      </div>
      <SignInDialog />
    </QueryClientProvider>
  );
}
