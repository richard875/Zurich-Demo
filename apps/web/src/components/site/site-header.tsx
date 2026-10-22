import { Link, useLocation } from '@modern-js/runtime/router';
import { NavigationMenu } from 'radix-ui';
import { Container } from '@/components/container';
import { newTab, NewTabText } from '@/components/external-link';
import { Button } from '@/components/ui/button';
import { ZurichIcon } from '@/components/zurich-icon';
import { cn } from '@/lib/cn';
import { helpMenu, productNav, utilityLinks } from './links';
import { MobileMenu } from './mobile-menu';
import { QuoteChooser } from './quote-chooser';
import { SessionControl } from './session-control';

// zurich.com.au's nav: Dark Blue text with a 2px Zurich Blue underline on hover and for the current page.
const navItem =
  'inline-flex h-16 items-center gap-1 px-3 text-dark-blue decoration-zurich-blue decoration-2 underline-offset-8 hover:underline data-active:underline data-[state=open]:underline [&_i]:text-zurich-blue';

function MainNav() {
  const { pathname } = useLocation();
  return (
    <NavigationMenu.Root aria-label="Main" className="hidden lg:block">
      <NavigationMenu.List className="flex items-center">
        {productNav.map((link) => (
          <NavigationMenu.Item key={link.href}>
            <NavigationMenu.Link asChild className="px-2.5">
              <a href={link.href} {...newTab} className={navItem}>
                {link.label}
                <NewTabText />
              </a>
            </NavigationMenu.Link>
          </NavigationMenu.Item>
        ))}
        <NavigationMenu.Item className="relative">
          <NavigationMenu.Trigger className={cn('group', navItem)}>
            Help &amp; information
            <ZurichIcon
              name="arrow-down:line"
              className="transition-transform group-data-[state=open]:rotate-180"
            />
          </NavigationMenu.Trigger>
          {/* Without a Viewport, Radix renders the panel here, under its trigger. */}
          <NavigationMenu.Content className="absolute top-full right-0 z-50 grid w-[34rem] grid-cols-2 gap-8 rounded-card bg-white p-8 shadow-lg ring-1 ring-dove">
            {helpMenu.map((group) => (
              <div key={group.title}>
                <h2 className="text-sm font-semibold">{group.title}</h2>
                <ul className="mt-3 grid gap-3">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <NavigationMenu.Link asChild>
                        <a
                          href={link.href}
                          {...newTab}
                          className="text-zurich-blue underline-offset-4 hover:underline"
                        >
                          {link.label}
                          <NewTabText />
                        </a>
                      </NavigationMenu.Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        {/* <NavigationMenu.Item>
          <NavigationMenu.Link asChild active={pathname.startsWith('/policies')}>
            <Link to="/policies" className={navItem}>
              My policies
            </Link>
          </NavigationMenu.Link>
        </NavigationMenu.Item> */}
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-white">
      <div className="hidden bg-zurich-white lg:block">
        <Container className="flex h-10 items-center justify-end gap-6 text-sm">
          {utilityLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              {...newTab}
              className="text-zurich-blue underline-offset-4 hover:underline"
            >
              {link.label}
              <NewTabText />
            </a>
          ))}
          <SessionControl />
        </Container>
      </div>
      <div className="border-b border-dove">
        <Container className="flex h-16 items-center gap-5">
          <Link to="/" className="flex rounded-sm" aria-label="Zurich Direct, home">
            <div z-logo="" inline="" role="presentation" />
          </Link>
          <MainNav />
          <div className="ml-auto flex items-center gap-2">
            <QuoteChooser>
              <Button size="sm" className="lg:h-12 lg:px-6 lg:text-lg">
                Get a quote
              </Button>
            </QuoteChooser>
            <MobileMenu />
          </div>
        </Container>
      </div>
    </header>
  );
}
