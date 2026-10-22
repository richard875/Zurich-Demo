// Zurich Direct's photos, resized to 250 KB or less. Width and height are the files' own pixels.
import articleLifeOrIncome from '@/assets/zurich-direct/article-life-or-income.jpg';
import articleWhyAWill from '@/assets/zurich-direct/article-why-a-will.jpg';
import articleWillOnline from '@/assets/zurich-direct/article-will-online.jpg';
import hero from '@/assets/zurich-direct/hero.jpg';
import homeLoanCard from '@/assets/zurich-direct/home-loan-card.jpg';
import homeLoanPromo from '@/assets/zurich-direct/home-loan-promo.jpg';
import limeBandHands from '@/assets/zurich-direct/lime-band-hands.jpg';
import productIncome from '@/assets/zurich-direct/product-income.jpg';
import productLife from '@/assets/zurich-direct/product-life.jpg';
import tab1 from '@/assets/zurich-direct/tab-1.jpg';
import tab2 from '@/assets/zurich-direct/tab-2.jpg';
import tab3 from '@/assets/zurich-direct/tab-3.jpg';
import tab4 from '@/assets/zurich-direct/tab-4.jpg';
import talkToUs from '@/assets/zurich-direct/talk-to-us.jpg';
import type { PhotoSource } from '@/components/photo';

const homeLoanAlt = 'A couple smiling at each other, arm in arm, outside their home';
const windfarmAlt = 'A father carrying his daughter like a plane in a field of wind turbines';

export const photos = {
  hero: {
    src: hero,
    width: 1000,
    height: 1000,
    alt: 'A mother and father laughing as they hug their young daughter',
  },
  productLife: {
    src: productLife,
    width: 800,
    height: 533,
    alt: 'A father and his children carrying surfboards on the beach',
  },
  productIncome: {
    src: productIncome,
    width: 800,
    height: 533,
    alt: 'A smiling shop owner among her colourful handmade goods',
  },
  homeLoanCard: { src: homeLoanCard, width: 800, height: 533, alt: homeLoanAlt },
  homeLoanPromo: { src: homeLoanPromo, width: 1000, height: 1000, alt: homeLoanAlt },
  limeBandHands: {
    src: limeBandHands,
    width: 700,
    height: 700,
    alt: 'A circle of people stacking their hands together',
  },
  tab1: { src: tab1, width: 700, height: 874, alt: windfarmAlt },
  tab2: {
    src: tab2,
    width: 350,
    height: 437,
    alt: 'A couple laughing on their sofa as they unpack a moving box',
  },
  tab3: {
    src: tab3,
    width: 350,
    height: 437,
    alt: 'A mother and her teenage daughter relaxing in a hammock',
  },
  tab4: {
    src: tab4,
    width: 350,
    height: 437,
    alt: 'A woman pointing at a laptop screen as she talks with a friend',
  },
  talkToUs: {
    src: talkToUs,
    width: 1000,
    height: 1000,
    alt: 'A father at his laptop while his daughter smiles beside him with a tablet',
  },
  articleWhyAWill: {
    src: articleWhyAWill,
    width: 800,
    height: 533,
    alt: 'A girl and her baby brother lying on a bed in heart-shaped sunglasses',
  },
  articleWillOnline: {
    src: articleWillOnline,
    width: 800,
    height: 533,
    alt: 'Two women on a sofa with their dog, a laptop and paperwork',
  },
  articleLifeOrIncome: { src: articleLifeOrIncome, width: 800, height: 533, alt: windfarmAlt },
} satisfies Record<string, PhotoSource>;
