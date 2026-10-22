import { useNavigate } from '@modern-js/runtime/router';
import { IconCircle } from '@/components/icon-circle';
import { ErrorAlert } from '@/components/message-panel';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { ZurichIcon } from '@/components/zurich-icon';
import { useSignIn, useSignInDialog } from './session';

export function SignInDialog() {
  const { open, destination, close } = useSignInDialog();
  const signIn = useSignIn();
  const navigate = useNavigate();

  const continueSignIn = () =>
    signIn.mutate(undefined, {
      onSuccess: () => {
        close();
        if (destination) navigate(destination);
      },
    });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          close();
          signIn.reset();
        }
      }}
    >
      {/* The fingerprint in a circle, 24px to the title, 8px from the title to its line, then the
          note in a Zurich White panel and the buttons, one width side by side. */}
      <DialogContent>
        <div className="grid gap-6">
          <IconCircle name="fingerprint-scan:line" />
          <div className="grid gap-2">
            <DialogTitle>Sign in to apply (demo)</DialogTitle>
            <DialogDescription>
              This demo identifies your browser with FingerprintJS instead of a password.
            </DialogDescription>
          </div>
        </div>
        <p className="flex gap-3 rounded-card bg-zurich-white p-4 text-sm">
          <ZurichIcon name="shield-check:line" className="text-xl" />
          Use the same browser next time and your policies will still be here. Nothing about you is
          stored.
        </p>
        {signIn.error && <ErrorAlert>{signIn.error.message}</ErrorAlert>}
        <DialogFooter>
          <Button size="md" onClick={continueSignIn} disabled={signIn.isPending}>
            {signIn.isPending ? 'Signing in…' : 'Continue'}
          </Button>
          <DialogClose asChild>
            <Button variant="outline" size="md">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
