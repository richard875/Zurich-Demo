import { Helmet } from '@modern-js/runtime/head';
import { Link, useSearchParams } from '@modern-js/runtime/router';
import { Container } from '@/components/container';
import { Headline } from '@/components/headline';
import { IconCircle } from '@/components/icon-circle';
import { PromoCard } from '@/components/promo-card';
import { Button } from '@/components/ui/button';
import { ZurichIcon } from '@/components/zurich-icon';
import { photos } from '@/home/photos';

// Once the card has landed (500ms), its icon pops 200ms later, so all of it is still by 1 second.
const iconPop = '[--pop-delay:700ms] motion-safe:animate-pop';

// The outcome in the home page's split promo card: mint while the policy is set up, lime while it
// waits for a person to review it. The card enters with the stage entrance, then its icon pops.
export default function ApplicationReceivedPage() {
  const [searchParams] = useSearchParams();
  const referred = searchParams.get('outcome') === 'referred';

  return (
    <Container className="py-10 md:py-16">
      <Helmet>
        <title>Application received | Zurich Direct (demo)</title>
      </Helmet>
      {referred ? (
        <PromoCard
          stage
          tone="lime"
          photo={photos.talkToUs}
          actions={
            <Button asChild size="md">
              <Link to="/">Back to home</Link>
            </Button>
          }
        >
          <IconCircle name="clock:line" tone="white" className={iconPop} />
          <Headline as="h1">
            Application <em>received</em>
          </Headline>
          <div className="grid gap-2">
            <h2 className="text-h-24 font-medium">We'll be in touch</h2>
            <p>
              Your answers mean someone from our team needs to look at your application. We'll
              contact you within 2 business days.
            </p>
          </div>
        </PromoCard>
      ) : (
        <PromoCard
          stage
          tone="mint"
          photo={photos.hero}
          actions={
            <Button asChild size="md">
              <Link to="/policies">
                View my policies
                <ZurichIcon name="arrow-right:line" />
              </Link>
            </Button>
          }
        >
          <IconCircle name="check:line" tone="white" className={iconPop} />
          <Headline as="h1">
            Application <em>received</em>
          </Headline>
          <p>We're setting up your policy now. It's usually ready in a few seconds.</p>
        </PromoCard>
      )}
    </Container>
  );
}
