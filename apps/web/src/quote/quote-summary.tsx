import { formatCents, formatWholeDollars } from '@shared/money';
import type { Quote } from '@shared/quote';
import { Button } from '@/components/ui/button';
import { ZurichIcon } from '@/components/zurich-icon';

const GENERAL_ADVICE_WARNING =
  'This is general information only and doesn’t consider your objectives, financial situation or needs.';

export function QuoteSummary({
  quote,
  onApply,
  onChangeCover,
}: {
  quote: Quote;
  onApply: () => void;
  onChangeCover: () => void;
}) {
  const { life, incomeProtection } = quote;
  return (
    <div className="grid gap-8">
      <section aria-labelledby="premium-heading" className="rounded-xl p-6 ring-1 ring-dove">
        <h2
          id="premium-heading"
          className="text-sm font-semibold tracking-wider text-zurich-blue uppercase"
        >
          Your premium
        </h2>
        <p className="mt-3 flex flex-wrap items-baseline gap-x-2">
          <span className="text-5xl font-light">{formatCents(quote.monthlyPremiumCents)}</span>
          <span className="text-lg">a month</span>
        </p>
        <p className="mt-1 text-muted-foreground">
          or {formatCents(quote.yearlyPremiumCents)} a year
        </p>
        <p className="mt-4 flex items-center gap-2 font-medium">
          <ZurichIcon name="check:line" className="text-xl text-moss" />
          Your first month is free.
        </p>
      </section>

      <section aria-labelledby="breakdown-heading">
        <h2 id="breakdown-heading" className="text-xl font-medium">
          What’s included
        </h2>
        <dl className="mt-4 divide-y border-y">
          <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-4">
            <dt>
              <span className="block font-medium">Ezicover Life Insurance</span>
              <span className="text-sm text-muted-foreground">
                {formatWholeDollars(life.sumInsured)} lump sum
              </span>
            </dt>
            <dd className="sm:text-right">{formatCents(life.monthlyPremiumCents)} a month</dd>
          </div>
          {incomeProtection && (
            <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-4">
              <dt>
                <span className="block font-medium">Ezicover Income Protection</span>
                <span className="text-sm text-muted-foreground">
                  {formatWholeDollars(incomeProtection.monthlyBenefit)} a month benefit
                </span>
              </dt>
              <dd className="sm:text-right">
                {formatCents(incomeProtection.monthlyPremiumCents)} a month
                <span className="block text-sm font-medium text-moss">
                  Includes 5% bundle discount ({formatCents(incomeProtection.discountCents)} off)
                </span>
              </dd>
            </div>
          )}
        </dl>
      </section>

      <p className="rounded-lg bg-zurich-white p-4 text-sm">{GENERAL_ADVICE_WARNING}</p>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="button" onClick={onApply}>
          Apply now
          <ZurichIcon name="arrow-right:line" />
        </Button>
        <Button type="button" variant="ghost" onClick={onChangeCover}>
          Change cover
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Quote reference {quote.quoteId.slice(0, 8).toUpperCase()}. We hold this price for 7 days.
      </p>
    </div>
  );
}
