import { useEffect, useRef, type ReactNode } from 'react';
import { Helmet } from '@modern-js/runtime/head';
import { useLocation, useNavigate, useSearchParams } from '@modern-js/runtime/router';
import { useMutation } from '@tanstack/react-query';
import { Headline } from '@/components/headline';
import { LoadingPanel } from '@/components/message-panel';
import { FlowLayout, PageBand } from '@/components/page-band';
import { phones } from '@/components/site/links';
import { TalkCard } from '@/components/site/talk-card';
import { Loaded, useWasLoading } from '@/motion/loaded';
import { StepTransition } from '@/motion/step-transition';
import { AboutYouForm } from '@/quote/about-you-form';
import { CoverForm } from '@/quote/cover-form';
import { useJourneyLoaded, useQuoteJourney } from '@/quote/journey-store';
import { QuoteProgress } from '@/quote/quote-progress';
import { QuoteSummary } from '@/quote/quote-summary';
import { requestQuote } from '@/quote/request-quote';
import { useSession, useSignInDialog } from '@/session/session';

type Step = 1 | 2 | 3;

// The heading puts its last word in Ogg, as the home page's headlines do.
const STEPS: Record<Step, { title: string; heading: ReactNode; lead: string }> = {
  1: {
    title: 'About you',
    heading: (
      <>
        About <em>you</em>
      </>
    ),
    lead: "A few details to work out your price. You don't need to sign in.",
  },
  2: {
    title: 'Choose your cover',
    heading: (
      <>
        Choose your <em>cover</em>
      </>
    ),
    lead: 'Pick how much cover you want. You can change it later.',
  },
  3: {
    title: 'Your quote',
    heading: (
      <>
        Your <em>quote</em>
      </>
    ),
    lead: "Here's your price, based on what you've told us.",
  },
};

const parseStep = (value: string | null): Step => (value === '3' ? 3 : value === '2' ? 2 : 1);

export default function QuotePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const loaded = useJourneyLoaded();
  const wasLoading = useWasLoading(!loaded);
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

  // Start at the top on every visit and every step, "Get a quote" included, even from step 1 itself:
  // each navigation gets a new key, though the URL may not change.
  // Braces matter: newer Chrome returns a Promise from scrollTo, which React would call as cleanup.
  const { key } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [key]);

  // Move focus to the new heading when the step changes, so screen readers announce it.
  const headingRef = useRef<HTMLHeadingElement>(null);
  const shownStep = useRef(step);
  useEffect(() => {
    if (shownStep.current === step) return;
    shownStep.current = step;
    headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  // A failed price belongs to the attempt that made it: leaving the cover step clears it.
  const { reset: resetQuoteRequest } = quoteRequest;
  useEffect(() => {
    if (step !== 2) resetQuoteRequest();
  }, [step, resetQuoteRequest]);

  const goTo = (next: Step) => navigate(`/quote?step=${next}`);
  const apply = () => (session.data?.signedIn ? navigate('/apply') : requestSignIn('/apply'));

  return (
    <>
      <Helmet>
        <title>{`${STEPS[step].title} | Get a quote | Zurich Direct (demo)`}</title>
      </Helmet>
      <PageBand>
        <QuoteProgress step={step} />
        <Headline
          ref={headingRef}
          as="h1"
          size="page"
          tabIndex={-1}
          className="mt-10 focus-visible:outline-none"
        >
          {STEPS[step].heading}
        </Headline>
        <p className="mt-6 text-b-20">{STEPS[step].lead}</p>
      </PageBand>

      <FlowLayout
        aside={
          <TalkCard phone={phones.sales}>
            Get a quote and apply over the phone with our team.
          </TalkCard>
        }
      >
        {!loaded ? (
          <LoadingPanel label="Loading your answers…" blocks={2} />
        ) : (
          // Each step crosses to the next (motion/step-transition.tsx); the first fades in as it
          // replaces the loading panel.
          <Loaded fade={wasLoading}>
            <StepTransition step={step}>
              {step === 1 ? (
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
            </StepTransition>
          </Loaded>
        )}
      </FlowLayout>
    </>
  );
}
