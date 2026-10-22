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
        <SheetTitle className="text-h-24 font-medium">Menu</SheetTitle>
        <nav aria-label="Main">
          <ul>
            {/* The customer's own page comes first. */}
            <li>
              <Link
                to="/policies"
                className={cn(rowLink, 'font-medium')}
                onClick={() => setOpen(false)}
              >
                My policies
              </Link>
            </li>
            {productNav.map((link) => (
              <li key={link.href}>
                <ExternalLink href={link.href} className={rowLink}>
                  {link.label}
                </ExternalLink>
              </li>
            ))}
          </ul>
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
        {/* justify-items-start keeps the Sign in button its own width rather than the menu's. */}
        <div className="grid justify-items-start gap-4 text-base">
          {utilityLinks.map((link) => (
            <ExternalLink
              key={link.href}
              href={link.href}
              className="inline-flex items-center gap-1 text-zurich-blue underline-offset-4 hover:underline"
            >
              {link.label}
            </ExternalLink>
          ))}
          <SessionControl button beforeSignIn={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
