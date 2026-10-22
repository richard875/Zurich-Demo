import { useState } from 'react';
import { Link } from '@modern-js/runtime/router';
import { ExternalLink } from '@/components/external-link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ZurichIcon } from '@/components/zurich-icon';
import { cn } from '@/lib/cn';
import { helpMenu, productNav, utilityLinks } from './links';
import { SessionControl } from './session-control';

const rowLink =
  'flex items-center justify-between gap-4 border-b border-dove py-4 text-b-18 underline-offset-4 hover:underline';

// Below 1024px the header's nav, Help & information menu, utility links and sign-in move in here.
// Sign in sits under the title, then come the customer's own links, the products to quote for and
// the Help & information groups.
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
        {/* 24px before the button, as elsewhere. justify-items-start keeps the Sign in button its
            own width rather than the menu's. */}
        <div className="grid justify-items-start gap-6 text-base">
          <SheetTitle className="text-h-24 font-medium">Menu</SheetTitle>
          <SessionControl button beforeSignIn={() => setOpen(false)} />
        </div>
        <nav aria-label="Main" className="grid gap-10">
          <ul>
            <li>
              <Link
                to="/policies"
                className={cn(rowLink, 'font-medium')}
                onClick={() => setOpen(false)}
              >
                My policies
              </Link>
            </li>
            {utilityLinks.map((link) => (
              <li key={link.href}>
                <ExternalLink href={link.href} className={rowLink}>
                  {link.label}
                </ExternalLink>
              </li>
            ))}
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
