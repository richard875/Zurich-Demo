import { Link } from '@modern-js/runtime/router';
import { Button } from '@/components/ui/button';
import { HarbourBankMark } from './harbour-bank-mark';

export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-sm"
          aria-label="Zurich Life Direct with Harbour Bank, home"
        >
          <div z-logo="" inline="" role="presentation" />
          <span className="h-6 w-px bg-dove" aria-hidden="true" />
          <HarbourBankMark />
        </Link>
        <nav aria-label="Main" className="-ml-4 flex items-center gap-1 text-sm sm:gap-2 md:ml-0">
          <Button asChild variant="ghost" size="sm">
            <Link to="/quote">Get a quote</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to="/policies">My policies</Link>
          </Button>
          <Button variant="outline" size="sm">
            Sign in
          </Button>
        </nav>
      </div>
    </header>
  );
}
