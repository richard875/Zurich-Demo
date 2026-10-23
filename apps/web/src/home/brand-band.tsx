import { Container } from '@/components/container';
import { Headline } from '@/components/headline';
import { Photo } from '@/components/photo';
import { Shapes } from '@/components/shapes';
import { Reveal, Settle } from '@/motion/reveal';
import { photos } from './photos';

// The brand statement's opening paragraph, centred under the hero like zurich.com.au's intro.
export function IntroStatement() {
  return (
    <Reveal>
      <Container>
        <p className="mx-auto max-w-225 text-center text-b-20 md:text-2xl md:leading-normal">
          At Zurich, we believe it should be easy to take care of your loved ones and your financial
          security. That's why we've created Ezicover - it's DIY insurance for people who want to
          take their future into their own hands.
        </p>
      </Container>
    </Reveal>
  );
}

// The rest of the brand statement, in zurich.com.au's lime band with a round photo. As the band comes
// into view its text rises in, the photo settles in its circle and the shapes slide in; the band
// itself stays put.
export function BrandBand() {
  return (
    <Reveal parts as="section" aria-labelledby="brand-heading" className="bg-lime py-10 md:py-16">
      <Container className="grid grid-cols-1 items-center gap-10 md:grid-cols-[1fr_auto] md:gap-16">
        <div data-reveal-part="" className="grid max-w-155 gap-6">
          <Headline id="brand-heading">
            Zurich Ezicover. You've got <em>this.</em>
          </Headline>
          <p className="text-b-20">
            With Ezicover, you'll enjoy insurance options that are easy to understand, easy to apply
            for and easy to claim - giving you peace of mind throughout the whole insurance journey.
          </p>
        </div>
        {/* zurich.com.au's band uses one image of a round photo with shapes beside it. This is its
            frame: the shapes fill it and the photo sits over them, full height and flush right, in
            a circle that clips it as it settles. */}
        <div className="relative aspect-675/469 w-86 max-w-full justify-self-center lg:w-104">
          <div data-reveal-shapes="" className="absolute inset-0">
            <Shapes arrangement="band" className="size-full" />
          </div>
          <div className="absolute top-0 right-0 isolate aspect-square h-full overflow-hidden rounded-full">
            <Settle className="size-full">
              <Photo photo={photos.limeBandHands} className="size-full object-cover" />
            </Settle>
          </div>
        </div>
      </Container>
    </Reveal>
  );
}
