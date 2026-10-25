import { DemoBanner } from '@/components/site/demo-banner';
import { PageError } from '@/components/site/page-error';
import { SiteFooter } from '@/components/site/site-footer';

// The last resort, when the layout itself fails: React Router renders this in its place. The header
// needs the layout's data client, so only the demo strip and footer come with it.
export default function RootError() {
  return (
    <div className="flex min-h-screen flex-col">
      <DemoBanner />
      <main className="flex-1">
        <PageError />
      </main>
      <SiteFooter />
    </div>
  );
}
