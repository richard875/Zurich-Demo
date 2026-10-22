import { useState } from 'react';
import { Link } from '@modern-js/runtime/router';
import { ExternalLink } from '@/components/external-link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ZurichIcon } from '@/components/zurich-icon';
import { cn } from '@/lib/cn';
import { useSession, useSignInDialog, useSignOut } from '@/session/session';
import { helpMenu, makeClaim, productNav } from './links';

const row = 'flex items-center justify-between gap-4 border-b border-dove py-4 text-b-18';
const rowLink = cn(row, 'underline-offset-4 hover:underline');
// The customer's own links, My policies and Make a claim, are slightly bolder.
const ownRowLink = cn(rowLink, 'font-medium');

// The first row: Sign in, marked out from the links below it, or the signed-in customer and Sign out.
function SessionRow({ beforeSignIn }: { beforeSignIn: () => void }) {
  const session = useSession();
  const signOut = useSignOut();
  const requestSignIn = useSignInDialog((state) => state.request);

  // Hold the row's height until the session is known, so "Sign in" never flashes for a signed-in user.
  if (!session.data) return <span className="block h-15 border-b border-dove" aria-hidden="true" />;

  if (!session.data.signedIn) {
    return (
      <button
        type="button"
        className={cn(row, 'group w-full cursor-pointer text-left font-medium text-zurich-blue')}
        onClick={() => {
          beforeSignIn();
          requestSignIn();
        }}
      >
        <span className="underline-offset-4 group-hover:underline">Sign in</span>
        <ZurichIcon name="arrow-right:line" />
      </button>
    );
  }

  return (
    <div className={row}>
      <span>
        Customer <b className="font-medium">{session.data.deviceLabel}</b>
      </span>
      <button
        type="button"
        className="cursor-pointer text-base text-zurich-blue underline underline-offset-4 disabled:opacity-50"
        disabled={signOut.isPending}
        onClick={() => signOut.mutate()}
      >
        Sign out
      </button>
    </div>
  );
}

// Below 1024px the header's nav, Help & information menu, utility links and sign-in move in here.
// Sign in and the customer's own links come first, then the products to quote for and the
// Help & information groups.
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="h-11 w-10 cursor-pointer px-0 lg:hidden">
          <ZurichIcon name="menu:line" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="gap-10">
        <div className="grid gap-6">
          <SheetTitle className="text-h-24 font-medium">Menu</SheetTitle>
          <nav aria-label="Main" className="grid gap-10">
            <ul>
              <li>
                <SessionRow beforeSignIn={() => setOpen(false)} />
              </li>
              <li>
                <Link to="/policies" className={ownRowLink} onClick={() => setOpen(false)}>
                  My policies
                </Link>
              </li>
              <li>
                <ExternalLink href={makeClaim.href} className={ownRowLink}>
                  {makeClaim.label}
                </ExternalLink>
              </li>
            </ul>
            <div>
              <h2 className="text-sm font-semibold">Get a quote</h2>
              <ul className="mt-2">
                {productNav.map((link) => (
                  <li key={link.href}>
                    <ExternalLink href={link.href} className={rowLink}>
                      {link.label}
                    </ExternalLink>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>
        {helpMenu.map((group) => (
          <div key={group.title}>
            <h2 className="text-sm font-semibold">{group.title}</h2>
            <ul className="mt-2">
              {group.links.map((link) => (
                <li key={link.href}>
                  <ExternalLink href={link.href} className={rowLink}>
                    {link.label}
                  </ExternalLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </SheetContent>
    </Sheet>
  );
}
