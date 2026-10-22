import { Container } from '@/components/container';
import { Headline } from '@/components/headline';
import { Photo } from '@/components/photo';
import { Shapes } from '@/components/shapes';
import { photos } from './photos';

// The brand statement's opening paragraph, centred under the hero like zurich.com.au's intro.
export function IntroStatement() {
  return (
    <Container>
      <p className="mx-auto max-w-[900px] text-center text-b-20 md:text-2xl md:leading-[1.4]">
        At Zurich, we believe it should be easy to take care of your loved ones and your financial
        security. That’s why we’ve created Ezicover – it’s DIY insurance for people who want to take
        their future into their own hands.
      </p>
    </Container>
  );
}

// The rest of the brand statement, in zurich.com.au's lime band with a round photo.
export function BrandBand() {
  return (
    <section aria-labelledby="brand-heading" className="bg-lime py-10 md:py-16">
      <Container className="grid items-center gap-10 md:grid-cols-[1fr_auto] md:gap-16">
        <div className="grid max-w-[620px] gap-4">
          <Headline id="brand-heading">
            Zurich Ezicover. You’ve got <em>this.</em>
          </Headline>
          <p className="text-b-20">
            With Ezicover, you’ll enjoy insurance options that are easy to understand, easy to apply
            for and easy to claim – giving you peace of mind throughout the whole insurance journey.
          </p>
        </div>
        <div className="relative justify-self-center md:mr-8">
          <Photo
            photo={photos.limeBandHands}
            className="size-60 rounded-full object-cover md:size-72"
          />
          <Shapes
            arrangement="band"
            className="absolute -bottom-1 -left-14 h-20 w-28 md:-left-24 md:h-28 md:w-40"
          />
        </div>
      </Container>
    </section>
  );
}
