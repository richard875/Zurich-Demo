import type { ReactNode } from 'react';
import { useLocation } from '@modern-js/runtime/router';
import { ErrorAlert, LoadingPanel, MessagePanel } from '@/components/message-panel';
import { Button } from '@/components/ui/button';
import { ZurichIcon } from '@/components/zurich-icon';
import { useHydrated } from '@/lib/use-hydrated';
import { Loaded, useWasLoading } from '@/motion/loaded';
import { useSession, useSignInDialog } from './session';

// Shows the page only to a signed-in customer; otherwise offers the mock sign-in,
// which brings them straight back here.
export function RequireSession({ reason, children }: { reason: string; children: ReactNode }) {
  const session = useSession();
  const requestSignIn = useSignInDialog((state) => state.request);
  const location = useLocation();
  const hydrated = useHydrated();
  const checking = !hydrated || (!session.data && !session.isError);
  const wasLoading = useWasLoading(checking);

  if (checking) return <LoadingPanel label="Checking you're signed in…" />;
  // The check itself failed (after the query's retries), so say so rather than wait for ever.
  if (!session.data) {
    return (
      <Loaded fade={wasLoading}>
        <div className="grid justify-items-start gap-6">
          <ErrorAlert>We couldn't check whether you're signed in. Please try again.</ErrorAlert>
          <Button size="md" onClick={() => void session.refetch()}>
            Try again
          </Button>
        </div>
      </Loaded>
    );
  }
  if (session.data.signedIn) return children;

  return (
    <Loaded fade={wasLoading}>
      <MessagePanel
        icon="lock-closed:line"
        action={
          <Button size="md" onClick={() => requestSignIn(`${location.pathname}${location.search}`)}>
            <ZurichIcon name="login:line" />
            Sign in
          </Button>
        }
      >
        {reason}
      </MessagePanel>
    </Loaded>
  );
}
