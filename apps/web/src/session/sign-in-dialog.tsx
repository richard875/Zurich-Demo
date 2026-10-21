import { useNavigate } from '@modern-js/runtime/router';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
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
      <DialogContent>
        <DialogTitle>Sign in to apply (demo)</DialogTitle>
        <DialogDescription>
          This demo identifies your browser with FingerprintJS instead of a password.
        </DialogDescription>
        <p className="text-sm text-muted-foreground">
          Use the same browser next time and your policies will still be here. Nothing about you is
          stored.
        </p>
        {signIn.error && (
          <p role="alert" className="border-l-4 border-peach py-1 pl-3 text-sm font-medium">
            {signIn.error.message}
          </p>
        )}
        <DialogFooter>
          <Button onClick={continueSignIn} disabled={signIn.isPending}>
            {signIn.isPending ? 'Signing in…' : 'Continue'}
          </Button>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
