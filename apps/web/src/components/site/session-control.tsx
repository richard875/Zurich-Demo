import { ZurichIcon } from '@/components/zurich-icon';
import { useSession, useSignInDialog, useSignOut } from '@/session/session';

const linkButton = 'text-zurich-blue underline-offset-4 hover:underline disabled:opacity-50';

// "Sign in", or the demo customer and Sign out, in the header's top bar. Takes the text size of where
// it sits. The mobile menu draws its own as a row.
export function SessionControl() {
  const session = useSession();
  const signOut = useSignOut();
  const requestSignIn = useSignInDialog((state) => state.request);

  // Hold the space until the session is known, so "Sign in" never flashes for a signed-in user.
  if (!session.data) return <span className="inline-block h-5 w-16" aria-hidden="true" />;

  if (!session.data.signedIn) {
    return (
      <button
        type="button"
        className={`inline-flex items-center gap-1 ${linkButton} cursor-pointer`}
        onClick={() => requestSignIn()}
      >
        <ZurichIcon name="user-male:line" className="text-[1.25em]" />
        Sign in
      </button>
    );
  }

  return (
    <span className="flex flex-wrap items-center">
      <span>
        Customer <b>{session.data.deviceLabel}</b>
      </span>
      <span>&nbsp;·&nbsp;</span>
      <button
        type="button"
        className={`underline ${linkButton} cursor-pointer`}
        disabled={signOut.isPending}
        onClick={() => signOut.mutate()}
      >
        Sign out
      </button>
    </span>
  );
}
