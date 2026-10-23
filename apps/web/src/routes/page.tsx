import { useEffect } from 'react';
import { Helmet } from '@modern-js/runtime/head';
import { useLocation } from '@modern-js/runtime/router';
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
  // Start at the top on every visit, the header's logo included, even from this page: each
  // navigation gets a new key, though the URL doesn't change.
  // Braces matter: newer Chrome returns a Promise from scrollTo, which React would call as cleanup.
  const { key } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [key]);

  return (
    <>
      <Helmet>
        <title>Get life insurance & income protection with Ezicover | Zurich Direct (demo)</title>
      </Helmet>
      <Hero />
      {/* grid-cols-1 caps the column at the page width, so no section can widen the page. */}
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
