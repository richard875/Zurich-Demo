import { useState } from 'react';
import { Helmet } from '@modern-js/runtime/head';
import { Outlet } from '@modern-js/runtime/router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DemoBanner } from '@/components/site/demo-banner';
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
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <Helmet htmlAttributes={{ lang: 'en-AU' }}>
          <link rel="icon" href="data:," />
        </Helmet>
        <DemoBanner />
        <SiteHeader />
        {/* Modern.js streams each page in after the layout. A screen-tall main keeps the footer below
            the fold until the page arrives, so nothing jumps when it does. */}
        <main className="min-h-svh flex-1">
          <Outlet />
        </main>
        <SiteFooter />
      </div>
      <SignInDialog />
    </QueryClientProvider>
  );
}
