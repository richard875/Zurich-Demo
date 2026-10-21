import { cn } from 'cn';

const STEP_LABELS = ['About you', 'Choose cover', 'Your quote'] as const;

export function QuoteProgress({ step }: { step: 1 | 2 | 3 }) {
  return (
    <ol aria-label="Quote progress" className="grid grid-cols-3 gap-2">
      {STEP_LABELS.map((label, index) => {
        const number = index + 1;
        return (
          <li
            key={label}
            aria-current={number === step ? 'step' : undefined}
            className="grid gap-2 text-sm"
          >
            <span
              aria-hidden="true"
              className={cn(
                'h-1.5 rounded-full',
                number <= step ? 'bg-zurich-blue' : 'bg-zurich-white',
              )}
            />
            <span className={number === step ? 'font-semibold' : 'text-muted-foreground'}>
              <span className="sr-only">Step {number}: </span>
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
