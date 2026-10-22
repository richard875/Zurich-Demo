import { Container } from '@/components/container';
import { Headline } from '@/components/headline';
import { Photo } from '@/components/photo';
import { Shapes } from '@/components/shapes';
import { QuoteChooser } from '@/components/site/quote-chooser';
import { Button } from '@/components/ui/button';
import { photos } from './photos';

// zurich.com.au's hero: on desktop the photo hangs 64px below the Zurich Blue band; on phones it sits
// directly under the band, edge to edge.
export function Hero() {
  return (
    <section className="on-blue bg-zurich-blue text-white md:mb-16">
      <Container className="grid md:grid-cols-2 md:gap-8">
        <div className="relative self-center pt-10 pb-24 md:py-16 lg:py-24">
          <Headline as="h1" size="hero">
            <em>Protect</em> what matters most with Zurich
          </Headline>
          <ul className="mt-6 grid list-disc gap-2 pl-6 text-b-20 marker:text-white">
            <li>
              Get your <strong className="font-semibold">first month free</strong> on Ezicover Life
              Insurance and Ezicover Income Protection
            </li>
            <li>
              A <strong className="font-semibold">complimentary legal Will</strong> (RRP AU$159.00)*
            </li>
          </ul>
          <QuoteChooser>
            <Button variant="inverse" className="mt-8 lg:h-11 cursor-pointer">
              Get a quote
            </Button>
          </QuoteChooser>
          <Shapes arrangement="hero" className="absolute right-0 bottom-0 h-20 w-36 md:hidden" />
        </div>
        {/* Bottom-aligned, so the photo overhangs the band however tall the text column gets. */}
        <div className="relative -mx-4 self-end sm:-mx-6 md:mx-0 md:pt-16">
          <Photo
            photo={photos.hero}
            eager
            className="aspect-square w-full object-cover md:-mb-16 md:rounded-promo"
          />
          <Shapes
            arrangement="hero"
            className="absolute right-full bottom-0 hidden h-28 w-52 md:block"
          />
        </div>
      </Container>
    </section>
  );
}
