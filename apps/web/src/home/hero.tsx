import { Container } from '@/components/container';
import { Headline } from '@/components/headline';
import { Photo } from '@/components/photo';
import { Shapes } from '@/components/shapes';
import { QuoteChooser } from '@/components/site/quote-chooser';
import { Button } from '@/components/ui/button';
import { photos } from './photos';

// zurich.com.au's hero: on desktop the photo hangs 64px below the Zurich Blue band; on phones it sits
// directly under the band, edge to edge. Its stage entrance plays from the stylesheet alone: the photo
// settles inside its frame at once, never fading (it's the page's largest paint); from 0.2s the
// headline rises 64px from 10% opacity, the bullets 30px and the button 24px.
export function Hero() {
  return (
    <section className="on-blue bg-zurich-blue text-white md:mb-16">
      <Container className="grid md:grid-cols-2 md:gap-8">
        {/* Like zurich.com.au's, the shapes end the text column, so they rest on the band's bottom
            edge: against the screen edge on phones, and touching the photo across the gap beside it. */}
        <div className="flex flex-col pt-10 md:pt-16 lg:pt-24">
          <div className="my-auto">
            <Headline
              as="h1"
              size="hero"
              className="[--stage-opacity:0.1] [--stage-rise:64px] motion-safe:animate-stage-rise"
            >
              <em>Protect</em> what matters most with Zurich
            </Headline>
            <ul className="mt-6 grid list-disc gap-2 pl-6 text-b-20 [--stage-rise:30px] marker:text-white motion-safe:animate-stage-rise">
              <li>
                Get your <strong className="font-semibold">first month free</strong> on Ezicover
                Life Insurance and Ezicover Income Protection
              </li>
              <li>
                A <strong className="font-semibold">complimentary legal Will</strong> (RRP
                AU$159.00)*
              </li>
            </ul>
            {/* The wrapper rises, so the button's own press dip doesn't fight it. */}
            <div className="mt-6 [--stage-rise:24px] motion-safe:animate-stage-rise">
              <QuoteChooser>
                <Button variant="inverse" size="md" className="cursor-pointer">
                  Get a quote
                </Button>
              </QuoteChooser>
            </div>
          </div>
          <Shapes
            arrangement="hero"
            className="mt-8 -mr-4 aspect-[267/144] h-20 self-end motion-safe:animate-stage-shape-slide-in sm:-mr-6 md:mt-5 md:-mr-8 md:h-24"
          />
        </div>
        {/* Bottom-aligned, so the photo overhangs the band however tall the text column gets. */}
        <div className="-mx-4 self-end sm:-mx-6 md:mx-0 md:pt-16">
          {/* The frame clips the settling photo, so its corners stay put. */}
          <div className="isolate overflow-hidden md:-mb-16 md:rounded-promo">
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
