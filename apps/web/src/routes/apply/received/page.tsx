import { Helmet } from '@modern-js/runtime/head';
import { Link, useSearchParams } from '@modern-js/runtime/router';
import { Button } from '@/components/ui/button';
import { ZurichIcon } from '@/components/zurich-icon';

export default function ApplicationReceivedPage() {
  const [searchParams] = useSearchParams();
  const referred = searchParams.get('outcome') === 'referred';

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 md:py-16">
      <Helmet>
        <title>Application received | Zurich Direct (demo)</title>
      </Helmet>
      <ZurichIcon name="check:line" className="text-5xl text-moss" />
      <h1 className="mt-4">Application received</h1>
      {referred ? (
        <>
          <p className="mt-6 text-2xl font-light">We’ll be in touch</p>
          <p className="mt-3 text-lg">
            Your answers mean someone from our team needs to look at your application. We’ll contact
            you within 2 business days.
          </p>
          <Button asChild variant="ghost" className="mt-8 -ml-6">
            <Link to="/">Back to home</Link>
          </Button>
        </>
      ) : (
        <>
          <p className="mt-6 text-lg">
            We’re setting up your policy now. It’s usually ready in a few seconds.
          </p>
          <Button asChild className="mt-8">
            <Link to="/policies">
              View my policies
              <ZurichIcon name="arrow-right:line" />
            </Link>
          </Button>
        </>
      )}
    </div>
  );
}
