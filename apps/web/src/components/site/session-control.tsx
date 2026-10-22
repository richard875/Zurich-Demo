import { Button } from '@/components/ui/button';
import { ZurichIcon } from '@/components/zurich-icon';
import { useSession, useSignInDialog, useSignOut } from '@/session/session';

const linkButton = 'text-zurich-blue underline-offset-4 hover:underline disabled:opacity-50';

// "Sign in", or the demo customer and Sign out. Takes the text size of where it sits. With `button`,
// as in the mobile menu, Sign in is a primary button like the product cards' "Get an online quote",
// keeping its person icon.
export function SessionControl({
  beforeSignIn,
  button = false,
}: {
  beforeSignIn?: () => void;
  button?: boolean;
}) {
  const session = useSession();
  const signOut = useSignOut();
  const requestSignIn = useSignInDialog((state) => state.request);

  // Hold the space until the session is known, so "Sign in" never flashes for a signed-in user.
  if (!session.data) return <span className="inline-block h-5 w-16" aria-hidden="true" />;

  if (!session.data.signedIn) {
    const signIn = () => {
      beforeSignIn?.();
      requestSignIn();
    };
    if (button) {
      return (
        <Button size="md" className="cursor-pointer" onClick={signIn}>
          <ZurichIcon name="user-male:line" />
          Sign in
        </Button>
      );
    }
    return (
      <button
        type="button"
        className={`inline-flex items-center gap-1 ${linkButton} cursor-pointer`}
        onClick={signIn}
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
