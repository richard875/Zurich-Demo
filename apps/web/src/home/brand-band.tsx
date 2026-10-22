import { Container } from '@/components/container';
import { Headline } from '@/components/headline';
import { Photo } from '@/components/photo';
import { Shapes } from '@/components/shapes';
import { photos } from './photos';

// The brand statement's opening paragraph, centred under the hero like zurich.com.au's intro.
export function IntroStatement() {
  return (
    <Container>
      <p className="mx-auto max-w-225 text-center text-b-20 md:text-2xl md:leading-normal">
        At Zurich, we believe it should be easy to take care of your loved ones and your financial
        security. That's why we've created Ezicover - it's DIY insurance for people who want to take
        their future into their own hands.
      </p>
    </Container>
  );
}

// The rest of the brand statement, in zurich.com.au's lime band with a round photo.
export function BrandBand() {
  return (
    <section aria-labelledby="brand-heading" className="bg-lime py-10 md:py-16">
      <Container className="grid grid-cols-1 items-center gap-10 md:grid-cols-[1fr_auto] md:gap-16">
        <div className="grid max-w-155 gap-5">
          <Headline id="brand-heading">
            Zurich Ezicover. You've got <em>this.</em>
          </Headline>
          <p className="text-b-20">
            With Ezicover, you'll enjoy insurance options that are easy to understand, easy to apply
            for and easy to claim - giving you peace of mind throughout the whole insurance journey.
          </p>
        </div>
        {/* zurich.com.au's band uses one image of a round photo with shapes beside it. This is its
            frame: the shapes fill it and the photo sits over them, full height and flush right. */}
        <div className="relative aspect-675/469 w-86 max-w-full justify-self-center lg:w-104">
          <Shapes arrangement="band" className="absolute inset-0" />
          <Photo
            photo={photos.limeBandHands}
            className="absolute top-0 right-0 aspect-square h-full w-auto rounded-full object-cover"
          />
        </div>
      </Container>
    </section>
  );
}
