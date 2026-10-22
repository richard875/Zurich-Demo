import { Helmet } from '@modern-js/runtime/head';
import { Link, useNavigate } from '@modern-js/runtime/router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formatCents, formatWholeDollars } from '@shared/money';
import { ApplicationForm } from '@/apply/application-form';
import { submitApplication } from '@/apply/submit-application';
import { Button } from '@/components/ui/button';
import { policiesQueryKey } from '@/policies/fetch-policies';
import { useJourneyLoaded, useQuoteJourney } from '@/quote/journey-store';
import { RequireSession } from '@/session/require-session';

function Apply() {
  const loaded = useJourneyLoaded();
  const { quote, reset } = useQuoteJourney();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const application = useMutation({ mutationFn: submitApplication });

  if (!loaded) return <p className="text-muted-foreground">Loading your quote…</p>;
  if (!quote) {
    return (
      <div className="grid justify-items-start gap-4">
        <p className="text-lg">You need a quote before you can apply.</p>
        <Button asChild>
          <Link to="/quote">Get a quote</Link>
        </Button>
      </div>
    );
  }

  const cover = [
    `${formatWholeDollars(quote.life.sumInsured)} life cover`,
    quote.incomeProtection &&
      `${formatWholeDollars(quote.incomeProtection.monthlyBenefit)} a month income protection`,
  ]
    .filter(Boolean)
    .join(' and ');

  return (
    <div className="grid gap-10">
      <p className="rounded-lg bg-zurich-white p-4">
        You’re applying for {cover}, at {formatCents(quote.monthlyPremiumCents)} a month.
      </p>
      <ApplicationForm
        pending={application.isPending}
        error={application.error?.message ?? null}
        onSubmit={({ firstName, answers }) =>
          application.mutate(
            { quoteId: quote.quoteId, firstName, answers },
            {
              onSuccess: ({ status }) => {
                reset();
                void queryClient.invalidateQueries({ queryKey: policiesQueryKey });
                const outcome = status === 'REFERRED' ? 'referred' : 'processing';
                navigate(`/apply/received?outcome=${outcome}`);
              },
            },
          )
        }
      />
    </div>
  );
}

export default function ApplyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 md:py-16">
      <Helmet>
        <title>Apply | Zurich Direct (demo)</title>
      </Helmet>
      <h1>Apply for cover</h1>
      <p className="mt-4 text-lg">A few more details, then we’ll set up your policy.</p>
      <div className="mt-10">
        <RequireSession reason="Sign in to apply. It takes one click in this demo.">
          <Apply />
        </RequireSession>
      </div>
    </div>
  );
}
