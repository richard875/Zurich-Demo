// Temporary: Phase 3's seven motions side by side, on the site's own components. Deleted in Step 4.
import { useEffect, useState, type ReactNode } from 'react';
import { Helmet } from '@modern-js/runtime/head';
import { Container } from '@/components/container';
import { Headline } from '@/components/headline';
import { IconCircle } from '@/components/icon-circle';
import { LoadingPanel, MessagePanel } from '@/components/message-panel';
import { PageBand } from '@/components/page-band';
import { Photo } from '@/components/photo';
import { ProductCard } from '@/components/product-card';
import { PromoCard } from '@/components/promo-card';
import { Shapes } from '@/components/shapes';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ZurichIcon } from '@/components/zurich-icon';
import { IntroStatement } from '@/home/brand-band';
import { photos } from '@/home/photos';
import { TalkToUs } from '@/home/promos';
import { cn } from '@/lib/cn';
import { Reveal, RevealGroup, RevealItem } from '@/motion/reveal';
import { StepTransition } from '@/motion/step-transition';

// The id lets doc/Phase 3/recordings/record.mjs find each demo.
function Lab({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div id={id}>
      <Container>
        <p className="border-t border-dove pt-4 text-sm font-semibold text-muted-foreground">
          {label}
        </p>
      </Container>
      <div className="mt-6">{children}</div>
    </div>
  );
}

// 1. The home hero's stage entrance: the photo settles at once; the headline (from 10% opacity),
// bullets and button rise 64, 30 and 24px from 0.2s; the shapes slide in as today.
function Stage() {
  return (
    <section className="on-blue bg-zurich-blue text-white md:mb-16">
      <Container className="grid md:grid-cols-2 md:gap-8">
        <div className="flex flex-col pt-10 md:pt-16 lg:pt-24">
          <div className="my-auto">
            <Headline
              as="h1"
              size="hero"
              className="[--stage-opacity:0.1] [--stage-rise:64px] motion-safe:animate-stage-rise"
            >
              Motion <em>lab</em>
            </Headline>
            <ul className="mt-6 grid list-disc gap-2 pl-6 text-b-20 [--stage-rise:30px] marker:text-white motion-safe:animate-stage-rise">
              <li>
                Phase 3's <strong className="font-semibold">seven motions</strong> on the site's own
                components
              </li>
              <li>Temporary: this page goes in Step 4</li>
            </ul>
            <div className="mt-6 [--stage-rise:24px] motion-safe:animate-stage-rise">
              <Button variant="inverse" size="md">
                Get a quote
              </Button>
            </div>
          </div>
          <Shapes
            arrangement="hero"
            className="mt-8 -mr-4 aspect-[267/144] h-20 self-end motion-safe:animate-stage-shape-slide-in sm:-mr-6 md:mt-5 md:-mr-8 md:h-24"
          />
        </div>
        <div className="-mx-4 self-end sm:-mx-6 md:mx-0 md:pt-16">
          <div className="overflow-hidden md:-mb-16 md:rounded-promo">
            <Photo
              photo={photos.hero}
              eager
              className="aspect-square w-full object-cover motion-safe:animate-stage-media-settle"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}

const products = [
  {
    photo: photos.productLife,
    teaser: "Help care for the people who depend on you - even if you're not around",
    title: 'Ezicover Life Insurance',
    description:
      'Ezicover Life Insurance could help you protect and provide for loved ones who depend on you, with a lump sum payment if you die or become terminally ill.',
  },
  {
    photo: photos.productIncome,
    teaser: 'Help protect your ability to earn a living if things go wrong',
    title: 'Ezicover Income Protection',
    description:
      "Ezicover Income Protection provides you a monthly payment for up to 5 years if you're unable to work due to a sickness or injury.",
  },
  {
    photo: photos.homeLoanCard,
    teaser: 'Buying a home is hard. Make sure you get protected...',
    title: 'Zurich Home Loan Protection',
    description:
      "Zurich Home Loan Protection can help you cover mortgage payments if you can't work temporarily because of illness, injury or involuntary unemployment.",
  },
];

// 3. A heading and a row of cards, 120ms apart from md; each card on its own below md.
function Products() {
  return (
    <RevealGroup as="section" aria-labelledby="lab-products">
      <Container>
        <RevealItem index={0}>
          <Headline id="lab-products">Choose the product that suits your needs</Headline>
        </RevealItem>
        <div className="mt-10 grid gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => (
            <ProductCard
              key={product.title}
              {...product}
              revealIndex={index + 1}
              learnMore={{ href: '#lab-products', label: `Learn more about ${product.title}` }}
              action={<Button size="md">Get an online quote</Button>}
            />
          ))}
        </div>
      </Container>
    </RevealGroup>
  );
}

const tabs = [
  {
    value: 'life-or-income',
    label: 'Life cover, income protection, or both?',
    lead: 'Life cover and income protection offer financial security in different ways.',
    photo: photos.tab1,
  },
  {
    value: 'couples',
    label: 'Key considerations for couples',
    lead: 'Balance in relationships is crucial.',
    photo: photos.tab2,
  },
  {
    value: 'review',
    label: 'When to review your life insurance',
    lead: 'Life insurance needs change as your life evolves.',
    photo: photos.tab3,
  },
];

// 6. A switched-to panel fades in, its text rising 8px; the first panel doesn't animate on load.
function SwitchTabs() {
  return (
    <Container>
      <Tabs defaultValue={tabs[0].value}>
        <TabsList aria-label="Lab tabs">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="cursor-pointer">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="mt-10 grid">
          {tabs.map((tab) => (
            <TabsContent
              key={tab.value}
              value={tab.value}
              className="md:grid md:grid-cols-[224px_1fr] md:items-start md:gap-16 lg:grid-cols-[350px_1fr]"
            >
              <Photo
                photo={tab.photo}
                className="hidden aspect-350/437 w-full rounded-promo object-cover md:block"
              />
              <div data-slot="tab-text" className="max-w-160">
                <p className="text-b-20 font-light md:text-2xl md:leading-normal">{tab.lead}</p>
              </div>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </Container>
  );
}

const steps = ['About you', 'Choose cover', 'Your quote'] as const;

// 7. The quote progress: a step's tick pops as it becomes done, and the line before the current step
// fills from the left (a scaled fill in a track). Going back changes them at once.
function Progress({ step, justDone }: { step: number; justDone: number | null }) {
  return (
    <ol aria-label="Lab progress" className="flex items-center gap-3">
      {steps.map((label, index) => {
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
                className="relative h-0.5 w-6 overflow-hidden rounded-full bg-white/40 sm:w-10 md:max-lg:w-6"
              >
                <span
                  className={cn(
                    'absolute inset-0 origin-left bg-white',
                    number <= step
                      ? 'scale-x-100 motion-safe:transition-[scale] motion-safe:duration-(--motion-confirm) motion-safe:ease-entrance'
                      : 'scale-x-0',
                  )}
                />
              </span>
            )}
            <span
              aria-hidden="true"
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-full font-semibold',
                number <= step ? 'bg-white text-zurich-blue' : 'ring-2 ring-white/60 ring-inset',
              )}
            >
              {done ? (
                <ZurichIcon
                  name="check:line"
                  className={cn('text-lg', justDone === number && 'motion-safe:animate-pop')}
                />
              ) : (
                number
              )}
            </span>
            <span className={cn('whitespace-nowrap', current ? 'font-semibold' : 'max-sm:sr-only')}>
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

// 6 and 7. Quote steps: the old step fades out, the new one fades in sliding 24px from the way you're
// going, and the progress confirms each step done.
function Steps() {
  const [step, setStep] = useState(1);
  const [justDone, setJustDone] = useState<number | null>(null);
  const go = (next: number) => {
    setJustDone(next > step ? step : null);
    setStep(next);
  };
  return (
    <>
      <PageBand>
        <Progress step={step} justDone={justDone} />
        <Headline as="h2" size="page" className="mt-10">
          {steps[step - 1]}
        </Headline>
      </PageBand>
      <Container className="py-10 md:py-16">
        <div className="max-w-3xl">
          <StepTransition step={step}>
            <MessagePanel
              icon={step === 3 ? 'shield-check:line' : 'document-contract:line'}
              action={
                <div className="flex flex-wrap gap-4">
                  {step < 3 && (
                    <Button size="md" onClick={() => go(step + 1)}>
                      Continue
                      <ZurichIcon name="arrow-right:line" />
                    </Button>
                  )}
                  {step > 1 && (
                    <Button
                      variant="outline"
                      size="md"

                      onClick={() => go(step - 1)}
                    >
                      <ZurichIcon name="arrow-left:line" />
                      Back
                    </Button>
                  )}
                </div>
              }
            >
              Step {step} of 3: {steps[step - 1]}.
            </MessagePanel>
          </StepTransition>
        </div>
      </Container>
    </>
  );
}

// 6. Content that replaces a loading panel fades in over 200ms; the panel keeps its pulse.
function Loading() {
  const [loading, setLoading] = useState(false);
  const [reloaded, setReloaded] = useState(false);
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, [loading]);
  return (
    <Container className="grid max-w-3xl! gap-6">
      <div>
        <Button
          variant="outline"
          size="md"

          onClick={() => {
            setReloaded(true);
            setLoading(true);
          }}
        >
          Load again
        </Button>
      </div>
      {loading ? (
        <LoadingPanel label="Loading…" />
      ) : (
        <div
          className={cn(
            reloaded &&
              'animate-in fade-in duration-(--motion-state) ease-entrance motion-reduce:duration-(--motion-switch-out)',
          )}
        >
          <MessagePanel icon="document-contract:line">Your policies would be here.</MessagePanel>
        </div>
      )}
    </Container>
  );
}

// 7. A policy turning active: the Lemon pill fades to Mint (a Lemon layer fading out) and its tick
// pops. The label swaps at once. With reduced motion, everything swaps at once.
function Pill() {
  const [active, setActive] = useState(false);
  return (
    <Container className="flex flex-wrap items-center gap-6">
      <p
        className={cn(
          'relative isolate inline-flex items-center gap-2 overflow-hidden rounded-full px-3 py-1 text-sm font-medium',
          active ? 'bg-mint' : 'bg-lemon',
        )}
      >
        {active ? (
          <>
            <span
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-lemon [--tw-animation-fill-mode:forwards] motion-safe:animate-out motion-safe:fade-out motion-safe:duration-(--motion-confirm) motion-safe:ease-state motion-reduce:hidden"
            />
            <ZurichIcon name="check:line" className="text-base motion-safe:animate-pop" />
            Active
          </>
        ) : (
          <>
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-dark-blue motion-safe:animate-pulse"
            />
            Processing
          </>
        )}
      </p>
      <Button variant="outline" size="md" onClick={() => setActive(!active)}>
        {active ? 'Back to Processing' : 'Activate'}
      </Button>
    </Container>
  );
}

// 1 and 7. The received page's card enters with the stage entrance from 0s, then its icon pops
// 200ms after the card lands: all done by 1 second.
function Received() {
  const [run, setRun] = useState(0);
  return (
    <Container className="grid gap-6">
      <div>
        <Button variant="outline" size="md" onClick={() => setRun(run + 1)}>
          Replay
        </Button>
      </div>
      <div key={run} className="[--stage-delay:0s] motion-safe:animate-stage-rise">
        <PromoCard
          tone="mint"
          photo={photos.hero}
          actions={
            <Button size="md">
              View my policies
              <ZurichIcon name="arrow-right:line" />
            </Button>
          }
        >
          <IconCircle
            name="check:line"
            tone="white"
            className="[--pop-delay:700ms] motion-safe:animate-pop"
          />
          <Headline as="h2">
            Application <em>received</em>
          </Headline>
          <p>We're setting up your policy now. It's usually ready in a few seconds.</p>
        </PromoCard>
      </div>
    </Container>
  );
}

export default function MotionLab() {
  return (
    <>
      <Helmet>
        <title>Motion lab | Zurich Direct (demo)</title>
      </Helmet>
      <Stage />
      <div className="grid grid-cols-1 gap-10 py-10 md:gap-16 md:py-16">
        <Lab
          id="lab-reveal"
          label="2 · Reveal: fades in and rises 32px the first time it's 10% in view (fades only on phones)"
        >
          <Reveal>
            <IntroStatement />
          </Reveal>
        </Lab>
        <Lab
          id="lab-stagger"
          label="3 · Stagger: the heading, then each card 120ms after the one before, from md"
        >
          <Products />
        </Lab>
        <Lab
          id="lab-settle"
          label="2 and 4 · Reveal and settle: the card reveals and its photo settles from 1.06"
        >
          <Reveal>
            <TalkToUs />
          </Reveal>
        </Lab>
        <Lab
          id="lab-press"
          label="5 · Hover and press: buttons dip to 98% while pressed; arrows nudge 4px their way"
        >
          <Container className="flex flex-wrap gap-4">
            <Button size="md">
              Continue
              <ZurichIcon name="arrow-right:line" />
            </Button>
            <Button variant="outline" size="md">
              <ZurichIcon name="arrow-left:line" />
              Back
            </Button>
            <Button variant="outline" size="md">
              Change cover
            </Button>
          </Container>
        </Lab>
        <Lab
          id="lab-tabs"
          label="6 · Switch: a tab's panel fades in over 250ms, its text rising 8px"
        >
          <SwitchTabs />
        </Lab>
        <Lab
          id="lab-steps"
          label="6 and 7 · Quote steps and progress: steps cross by fade and a 24px slide; ticks pop"
        >
          <Steps />
        </Lab>
        <Lab id="lab-loading" label="6 · Loading to content: the content fades in over 200ms">
          <Loading />
        </Lab>
        <Lab
          id="lab-pill"
          label="7 · Confirm: the status pill fades from Lemon to Mint and its tick pops"
        >
          <Pill />
        </Lab>
        <Lab id="lab-received" label="1 and 7 · Received: the card enters, then its icon pops">
          <Received />
        </Lab>
      </div>
    </>
  );
}
