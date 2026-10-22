import { useEffect, useRef } from 'react';
import { Helmet } from '@modern-js/runtime/head';
import { useNavigate, useSearchParams } from '@modern-js/runtime/router';
import { useMutation } from '@tanstack/react-query';
import { AboutYouForm } from '@/quote/about-you-form';
import { CoverForm } from '@/quote/cover-form';
import { useJourneyLoaded, useQuoteJourney } from '@/quote/journey-store';
import { QuoteProgress } from '@/quote/quote-progress';
import { QuoteSummary } from '@/quote/quote-summary';
import { requestQuote } from '@/quote/request-quote';
import { useSession, useSignInDialog } from '@/session/session';

type Step = 1 | 2 | 3;

const STEPS: Record<Step, { title: string; lead: string }> = {
  1: {
    title: 'About you',
    lead: 'A few details to work out your price. You don’t need to sign in.',
  },
  2: { title: 'Choose your cover', lead: 'Pick how much cover you want. You can change it later.' },
  3: { title: 'Your quote', lead: 'Here’s your price, based on what you’ve told us.' },
};

const parseStep = (value: string | null): Step => (value === '3' ? 3 : value === '2' ? 2 : 1);

export default function QuotePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const loaded = useJourneyLoaded();
  const { aboutYou, cover, quote, incomeProtectionPreset, saveAboutYou, saveQuote } =
    useQuoteJourney();
  const quoteRequest = useMutation({ mutationFn: requestQuote });
  const session = useSession();
  const requestSignIn = useSignInDialog((state) => state.request);

  // Steps can't be skipped: no answers means step 1, no price means step 2 at most.
  const requested = parseStep(searchParams.get('step'));
  const allowed: Step = !aboutYou ? 1 : !quote && requested === 3 ? 2 : requested;
  const step = loaded ? allowed : requested;

  useEffect(() => {
    if (loaded && allowed !== requested) navigate(`/quote?step=${allowed}`, { replace: true });
  }, [loaded, allowed, requested, navigate]);

  // Move focus to the new heading when the step changes, so screen readers announce it.
  const headingRef = useRef<HTMLHeadingElement>(null);
  const shownStep = useRef(step);
  useEffect(() => {
    if (shownStep.current === step) return;
    shownStep.current = step;
    window.scrollTo({ top: 0 });
    headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  const goTo = (next: Step) => navigate(`/quote?step=${next}`);
  const apply = () => (session.data?.signedIn ? navigate('/apply') : requestSignIn('/apply'));

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 md:py-16">
      <Helmet>
        <title>{`${STEPS[step].title} | Get a quote | Zurich Direct (demo)`}</title>
      </Helmet>
      <QuoteProgress step={step} />
      <p className="mt-10 text-sm font-semibold tracking-wider text-zurich-blue uppercase">
        Step {step} of 3
      </p>
      <h1 ref={headingRef} tabIndex={-1} className="mt-2 focus-visible:outline-none">
        {STEPS[step].title}
      </h1>
      <p className="mt-4 text-lg">{STEPS[step].lead}</p>

      <div className="mt-10">
        {!loaded ? (
          <p className="text-muted-foreground">Loading your answers…</p>
        ) : step === 1 ? (
          <AboutYouForm
            defaultValues={aboutYou}
            onSubmit={(values) => {
              saveAboutYou(values);
              goTo(2);
            }}
          />
        ) : step === 2 && aboutYou ? (
          <CoverForm
            defaultValues={cover}
            incomeProtectionPreset={incomeProtectionPreset}
            pending={quoteRequest.isPending}
            error={quoteRequest.error?.message ?? null}
            onBack={() => goTo(1)}
            onSubmit={(nextCover) =>
              quoteRequest.mutate(
                { ...aboutYou, ...nextCover },
                {
                  onSuccess: (newQuote) => {
                    saveQuote(nextCover, newQuote);
                    goTo(3);
                  },
                },
              )
            }
          />
        ) : quote ? (
          <QuoteSummary quote={quote} onApply={apply} onChangeCover={() => goTo(2)} />
        ) : null}
      </div>
    </div>
  );
}
