import { Helmet } from '@modern-js/runtime/head';
import { Articles } from '@/home/articles';
import { Benefits } from '@/home/benefits';
import { BrandBand, IntroStatement } from '@/home/brand-band';
import { CoverTabs } from '@/home/cover-tabs';
import { Hero } from '@/home/hero';
import { OfferTerms } from '@/home/offer-terms';
import { Products } from '@/home/products';
import { HomeLoanPromo, TalkToUs } from '@/home/promos';

// Zurich Direct's home page content in zurich.com.au's design language, in the wireframe's order.
export default function Index() {
  return (
    <>
      <Helmet>
        <title>Get life insurance & income protection with Ezicover | Zurich Direct (demo)</title>
      </Helmet>
      <Hero />
      {/* grid-cols-1 caps the column at the page width, so the tab row scrolls instead of widening it. */}
      <div className="grid grid-cols-1 gap-10 py-10 md:gap-16 md:py-16">
        <IntroStatement />
        <Products />
        <BrandBand />
        <CoverTabs />
        <Benefits />
        <TalkToUs />
        <Articles />
        <HomeLoanPromo />
        <OfferTerms />
      </div>
    </>
  );
}
