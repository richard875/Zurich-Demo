import { Helmet } from '@modern-js/runtime/head';
import { Link } from '@modern-js/runtime/router';
import { Button } from '@/components/ui/button';
import { ZurichIcon, type ZurichIconName } from '@/components/zurich-icon';

const covers: { title: string; icon: ZurichIconName; body: string; range: string }[] = [
  {
    title: 'Life cover',
    icon: 'family:line',
    body: 'A lump sum for the people you choose if you die or are diagnosed with a terminal illness.',
    range: '$100,000 to $2,000,000',
  },
  {
    title: 'Income protection',
    icon: 'financial-health:line',
    body: 'A monthly benefit if illness or injury stops you working for more than 30 days.',
    range: '$1,000 to $10,000 a month',
  },
];

const steps = [
  'Tell us a little about you',
  'Choose your cover and see your price',
  'Sign in to apply, then watch your policy go live',
];

export default function Index() {
  return (
    <>
      <Helmet>
        <title>Life and income protection | Zurich Life Direct (demo)</title>
      </Helmet>

      <section className="bg-zurich-white">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 md:py-24">
          <p className="text-sm font-semibold tracking-wider text-zurich-blue uppercase">
            For Harbour Bank customers
          </p>
          <h1 className="mt-4 max-w-2xl font-display font-normal">
            Cover for the life you’re building
          </h1>
          <p className="mt-6 max-w-xl text-lg">
            Life and income protection from Zurich, offered through Harbour Bank. See your price in
            three short steps. You only sign in when you apply.
          </p>
          <Button asChild className="mt-8">
            <Link to="/quote">
              Get a quote
              <ZurichIcon name="arrow-right:line" />
            </Link>
          </Button>
        </div>
      </section>

      <section aria-labelledby="covers-heading" className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <h2 id="covers-heading" className="text-2xl font-light md:text-3xl">
          Two types of cover
        </h2>
        <ul className="mt-8 grid gap-6 md:grid-cols-2">
          {covers.map((cover) => (
            <li key={cover.title} className="rounded-xl p-6 ring-1 ring-dove">
              <ZurichIcon name={cover.icon} className="text-4xl text-zurich-blue" />
              <h3 className="mt-4 text-xl font-medium">{cover.title}</h3>
              <p className="mt-2 text-muted-foreground">{cover.body}</p>
              <p className="mt-4 text-sm font-semibold">{cover.range}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 flex items-center gap-2">
          <ZurichIcon name="check:line" className="text-xl text-moss" />
          Choose both and save 10% on your income protection premium.
        </p>
      </section>

      <section aria-labelledby="steps-heading" className="border-t">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <h2 id="steps-heading" className="text-2xl font-light md:text-3xl">
            How it works
          </h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step} className="flex items-start gap-4">
                <span
                  className="flex size-10 shrink-0 items-center justify-center rounded-full font-semibold text-zurich-blue ring-2 ring-zurich-blue"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <span className="pt-2">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
