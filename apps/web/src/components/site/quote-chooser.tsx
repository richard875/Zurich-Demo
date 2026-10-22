import { useId, useState, type MouseEvent, type ReactNode } from 'react';
import { Link } from '@modern-js/runtime/router';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ZurichIcon } from '@/components/zurich-icon';
import { QUOTE_START, useStartQuote } from '@/quote/start-quote';

const choices = [
  {
    label: 'Get life insurance and income protection',
    incomeProtection: true,
    // Zurich Direct's pop-up line, moved onto the choice it's about.
    description:
      'Get a 5% discount on Ezicover Income Protection insurance if you purchase it with Ezicover Life Insurance.',
    badge: 'Save 5%',
  },
  {
    label: 'Get life insurance only',
    incomeProtection: false,
    // As on the quote's cover step.
    description: 'A lump sum if you die or are diagnosed with a terminal illness.',
  },
];

// zurich.com.au's quick-quote drawer, holding Zurich Direct's quote pop-up. Zurich Direct also offers
// income protection on its own; the demo's rating needs life cover, so that option is left out.
// The title matches the menu's, and each choice is a card like the quote's cover step, with the same
// icons. The card's title is the link, stretched over the whole card, so the link is named by the
// title alone and described by the line under it; the card takes the link's focus ring.
export function QuoteChooser({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const startQuote = useStartQuote();
  const id = useId();

  // The links keep their href, but the click waits for the preset before it navigates.
  const choose = (incomeProtection: boolean) => (event: MouseEvent) => {
    event.preventDefault();
    setOpen(false);
    void startQuote(incomeProtection);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      {/* Each card carries its own description, so the sheet has none. */}
      <SheetContent aria-describedby={undefined}>
        <SheetTitle className="text-h-24 font-medium">
          Need life insurance only or both life insurance and income protection?
        </SheetTitle>
        <ul className="mt-8 grid gap-4">
          {choices.map(({ label, incomeProtection, description, badge }, index) => (
            <li
              key={label}
              className="group relative grid gap-4 rounded-card bg-white p-6 ring-1 ring-dove transition-shadow hover:shadow-md hover:ring-2 hover:ring-zurich-blue has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-dark-blue"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-3xl text-zurich-blue">
                  <ZurichIcon name="family:line" />
                  {incomeProtection && (
                    <>
                      <ZurichIcon name="plus:line" className="text-base" />
                      <ZurichIcon name="financial-health:line" />
                    </>
                  )}
                </span>
                {badge && (
                  <span className="rounded-full bg-lime px-3 py-1 text-sm font-medium">
                    {badge}
                  </span>
                )}
              </div>
              <div className="grid gap-2">
                <Link
                  to={QUOTE_START}
                  onClick={choose(incomeProtection)}
                  aria-describedby={`${id}-${index}`}
                  className="flex items-center justify-between gap-4 text-b-20 font-medium after:absolute after:inset-0 after:rounded-card focus-visible:outline-none"
                >
                  {label}
                  <span className="text-zurich-blue transition-transform motion-safe:group-hover:translate-x-1">
                    <ZurichIcon name="arrow-right:line" />
                  </span>
                </Link>
                <p id={`${id}-${index}`} className="text-muted-foreground">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
