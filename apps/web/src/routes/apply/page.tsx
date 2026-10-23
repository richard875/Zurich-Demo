import { Helmet } from '@modern-js/runtime/head';
import { Link, useNavigate } from '@modern-js/runtime/router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formatCents, formatWholeDollars } from '@shared/money';
import { ApplicationForm } from '@/apply/application-form';
import { submitApplication } from '@/apply/submit-application';
import { Headline } from '@/components/headline';
import { IconCircle } from '@/components/icon-circle';
import { LoadingPanel, MessagePanel } from '@/components/message-panel';
import { FlowLayout, PageBand } from '@/components/page-band';
import { phones } from '@/components/site/links';
import { TalkCard } from '@/components/site/talk-card';
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

  if (!loaded) return <LoadingPanel label="Loading your quote…" blocks={2} />;
  if (!quote) {
    return (
      <MessagePanel
        icon="document-contract:line"
        action={
          <Button asChild size="md">
            <Link to="/quote">Get a quote</Link>
          </Button>
        }
      >
        You need a quote before you can apply.
      </MessagePanel>
    );
  }

  const cover = [
    `${formatWholeDollars(quote.life.sumInsured)} of Ezicover Life Insurance`,
    quote.incomeProtection &&
      `Ezicover Income Protection of ${formatWholeDollars(quote.incomeProtection.monthlyBenefit)} a month`,
  ]
    .filter(Boolean)
    .join(' and ');

  return (
    <div className="grid gap-10">
      <p className="flex items-center gap-4 rounded-card bg-zurich-white p-6 text-b-18">
        <IconCircle name="document-contract:line" />
        <span>
          You're applying for {cover}, at{' '}
          <strong className="font-semibold">{formatCents(quote.monthlyPremiumCents)}</strong> a
          month.
        </span>
      </p>
      <ApplicationForm
        pending={application.isPending}
        error={application.error?.message ?? null}
        onSubmit={({ answers }) =>
          application.mutate(
            { quoteId: quote.quoteId, answers },
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
    <>
      <Helmet>
        <title>Apply | Zurich Direct (demo)</title>
      </Helmet>
      <PageBand>
        <Headline as="h1" size="page">
          Apply for <em>cover</em>
        </Headline>
        <p className="mt-6 text-b-20">A few more details, then we'll set up your policy.</p>
      </PageBand>
      <FlowLayout
        aside={
          <TalkCard phone={phones.sales}>
            Prefer to apply over the phone? Our team can take you through it.
          </TalkCard>
        }
      >
        <RequireSession reason="Sign in to apply. It takes one click in this demo.">
          <Apply />
        </RequireSession>
      </FlowLayout>
    </>
  );
}
