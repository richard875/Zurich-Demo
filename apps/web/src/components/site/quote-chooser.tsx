import { useState, type MouseEvent, type ReactNode } from 'react';
import { Link } from '@modern-js/runtime/router';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { QUOTE_START, useStartQuote } from '@/quote/start-quote';

const choices = [
  { label: 'Get life insurance and income protection', incomeProtection: true },
  { label: 'Get life insurance only', incomeProtection: false },
];

// zurich.com.au's quick-quote drawer, holding Zurich Direct's quote pop-up. Zurich Direct also offers
// income protection on its own; the demo's rating needs life cover, so that option is left out.
export function QuoteChooser({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const startQuote = useStartQuote();

  // The links keep their href, but the click waits for the preset before it navigates.
  const choose = (incomeProtection: boolean) => (event: MouseEvent) => {
    event.preventDefault();
    setOpen(false);
    void startQuote(incomeProtection);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <SheetTitle>
          Need life insurance only or both life insurance and income protection?
        </SheetTitle>
        <SheetDescription className="mt-4">
          Get a 5% discount on Ezicover Income Protection insurance if you purchase it with Ezicover
          Life Insurance.
        </SheetDescription>
        <div className="mt-8 grid gap-4">
          {choices.map(({ label, incomeProtection }) => (
            <Button key={label} asChild size="lg">
              <Link to={QUOTE_START} onClick={choose(incomeProtection)}>
                {label}
              </Link>
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
