import type { ReactNode } from 'react';
import { useLocation } from '@modern-js/runtime/router';
import { Button } from '@/components/ui/button';
import { useSession, useSignInDialog } from './session';

// Shows the page only to a signed-in customer; otherwise offers the mock sign-in,
// which brings them straight back here.
export function RequireSession({ reason, children }: { reason: string; children: ReactNode }) {
  const session = useSession();
  const requestSignIn = useSignInDialog((state) => state.request);
  const location = useLocation();

  if (!session.data) return <p className="text-muted-foreground">Checking you’re signed in…</p>;
  if (session.data.signedIn) return children;

  return (
    <div className="grid justify-items-start gap-4 rounded-xl p-6 ring-1 ring-dove">
      <p className="text-lg">{reason}</p>
      <Button onClick={() => requestSignIn(`${location.pathname}${location.search}`)}>
        Sign in
      </Button>
    </div>
  );
}
