import { formatCents, formatWholeDollars } from '@shared/money';
import type { Quote } from '@shared/quote';
import { IconCircle } from '@/components/icon-circle';
import { Button } from '@/components/ui/button';
import { ZurichIcon } from '@/components/zurich-icon';

const GENERAL_ADVICE_WARNING =
  "This is general information only and doesn't consider your objectives, financial situation or needs.";

// The price in a lime panel like the home page's brand band, then each product as a card with the
// cover step's icon. 40px between blocks, as between the home page's sections on phones.
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
    <div className="grid gap-10">
      <section aria-labelledby="premium-heading" className="rounded-promo bg-lime p-6 md:p-10">
        <h2 id="premium-heading" className="text-sm font-semibold tracking-wider uppercase">
          Your premium
        </h2>
        <p className="mt-2 flex flex-wrap items-baseline gap-x-2">
          <span className="text-h-48 font-light md:text-h-60">
            {formatCents(quote.monthlyPremiumCents)}
          </span>
          <span className="text-b-20">a month</span>
        </p>
        <p className="mt-2 text-b-18">or {formatCents(quote.yearlyPremiumCents)} a year</p>
        <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-medium">
          <ZurichIcon name="check:line" className="text-xl text-moss" />
          Your first month is free.
        </p>
        <p className="mt-6 text-sm">
          Quote reference {quote.quoteId.slice(0, 8).toUpperCase()}. We hold this price for 7 days.
        </p>
      </section>

      <section aria-labelledby="breakdown-heading">
        <h2 id="breakdown-heading" className="text-h-24 font-medium">
          What's included
        </h2>
        <dl className="mt-6 grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-card p-6 ring-1 ring-dove">
            <dt className="flex items-center gap-4">
              <IconCircle name="family:line" />
              <span>
                <span className="block text-b-18 font-semibold">Ezicover Life Insurance</span>
                <span className="text-muted-foreground">
                  {formatWholeDollars(life.sumInsured)} lump sum
                </span>
              </span>
            </dt>
            <dd className="text-b-18 max-sm:pl-16">
              {formatCents(life.monthlyPremiumCents)} a month
            </dd>
          </div>
          {incomeProtection && (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-card p-6 ring-1 ring-dove">
              <dt className="flex items-center gap-4">
                <IconCircle name="financial-health:line" />
                <span>
                  <span className="block text-b-18 font-semibold">Ezicover Income Protection</span>
                  <span className="text-muted-foreground">
                    {formatWholeDollars(incomeProtection.monthlyBenefit)} a month benefit
                  </span>
                </span>
              </dt>
              <dd className="grid justify-items-start gap-2 text-b-18 max-sm:pl-16 sm:justify-items-end">
                {formatCents(incomeProtection.monthlyPremiumCents)} a month
                <span className="rounded-full bg-mint px-3 py-1 text-sm font-medium">
                  Includes 5% bundle discount ({formatCents(incomeProtection.discountCents)} off)
                </span>
              </dd>
            </div>
          )}
        </dl>
      </section>

      <p className="flex gap-3 rounded-card bg-zurich-white p-6 text-sm">
        <ZurichIcon name="info:line" className="text-xl" />
        {GENERAL_ADVICE_WARNING}
      </p>

      <div className="grid gap-4 sm:flex sm:flex-wrap">
        <Button type="button" size="md" onClick={onApply}>
          Apply now
          <ZurichIcon name="arrow-right:line" />
        </Button>
        <Button type="button" variant="outline" size="md" onClick={onChangeCover}>
          Change cover
        </Button>
      </div>
    </div>
  );
}
