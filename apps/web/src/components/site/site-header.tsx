import { Link } from '@modern-js/runtime/router';
import { Button } from '@/components/ui/button';
import { useSession, useSignInDialog, useSignOut } from '@/session/session';
import { HarbourBankMark } from './harbour-bank-mark';

function SessionControl() {
  const session = useSession();
  const signOut = useSignOut();
  const requestSignIn = useSignInDialog((state) => state.request);

  // Hold the space until the session is known, so "Sign in" never flashes for a signed-in user.
  if (!session.data) return <span className="inline-block h-10 w-20" aria-hidden="true" />;

  if (!session.data.signedIn) {
    return (
      <Button variant="outline" size="sm" onClick={() => requestSignIn()}>
        Sign in
      </Button>
    );
  }

  return (
    <span className="flex items-center gap-1 pl-4 text-sm">
      <span>Demo customer · device {session.data.deviceLabel}</span>
      <Button
        variant="link"
        size="sm"
        className="px-2"
        disabled={signOut.isPending}
        onClick={() => signOut.mutate()}
      >
        Sign out
      </Button>
    </span>
  );
}

export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-sm"
          aria-label="Zurich with Harbour Bank, home"
        >
          <div z-logo="" inline="" role="presentation" />
          <span className="h-6 w-px bg-dove" aria-hidden="true" />
          <HarbourBankMark />
        </Link>
        <nav
          aria-label="Main"
          className="-ml-4 flex flex-wrap items-center gap-1 text-sm sm:gap-2 md:ml-0"
        >
          <Button asChild variant="ghost" size="sm">
            <Link to="/quote">Get a quote</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to="/policies">My policies</Link>
          </Button>
          <SessionControl />
        </nav>
      </div>
    </header>
  );
}
