import { ZurichIcon } from '@/components/zurich-icon';
import { cn } from '@/lib/cn';

const STEP_LABELS = ['About you', 'Choose cover', 'Your quote'] as const;

// The quote's steps on the blue band, numbered in circles like the cover tabs' points: a done step is
// a white circle with a tick, the current one a white circle with its number, the rest an outline.
// Below sm only the current step's name shows; the others' stay for screen readers. Between md and lg
// the band's shapes sit beside the steps, so the lines between them shorten to keep each name on one
// line.
export function QuoteProgress({ step }: { step: 1 | 2 | 3 }) {
  return (
    <ol aria-label="Quote progress" className="flex items-center gap-3">
      {STEP_LABELS.map((label, index) => {
        const number = index + 1;
        const done = number < step;
        const current = number === step;
        return (
          <li
            key={label}
            aria-current={current ? 'step' : undefined}
            className="flex items-center gap-3 text-sm"
          >
            {index > 0 && (
              <span
                aria-hidden="true"
                className={cn(
                  'h-0.5 w-6 rounded-full sm:w-10 md:max-lg:w-6',
                  number <= step ? 'bg-white' : 'bg-white/40',
                )}
              />
            )}
            <span
              aria-hidden="true"
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-full font-semibold',
                number <= step ? 'bg-white text-zurich-blue' : 'ring-2 ring-white/60 ring-inset',
              )}
            >
              {done ? <ZurichIcon name="check:line" className="text-lg" /> : number}
            </span>
            <span className={cn('whitespace-nowrap', current ? 'font-semibold' : 'max-sm:sr-only')}>
              <span className="sr-only">Step {number}: </span>
              {label}
              {done && <span className="sr-only"> (done)</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
