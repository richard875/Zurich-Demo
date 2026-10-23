import type { ReactNode } from 'react';
import { useLocation } from '@modern-js/runtime/router';
import { LoadingPanel, MessagePanel } from '@/components/message-panel';
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
  const checking = !hydrated || !session.data;
  const wasLoading = useWasLoading(checking);

  if (checking) return <LoadingPanel label="Checking you're signed in…" />;
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
