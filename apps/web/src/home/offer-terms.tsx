import { Container } from '@/components/container';
import { ExternalLink } from '@/components/external-link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Reveal } from '@/motion/reveal';

const here = 'text-zurich-blue underline';

// Zurich Direct's offer terms, word for word, behind the hero offer's asterisk. The block reveals as
// it comes into view; the accordion keeps its own open and close.
export function OfferTerms() {
  return (
    <Reveal>
      <Container>
        <Accordion type="single" collapsible>
          <AccordionItem value="offer-terms">
            {/* 24px above and below the title, as under the terms when open. */}
            <AccordionTrigger level="h2" className="py-6">
              * Offer terms and important information
            </AccordionTrigger>
            <AccordionContent className="grid gap-4 md:pl-10">
              <p>
                *This offer is available to any Policyholder who has purchased, or purchases, an
                Ezicover Life Insurance or Income Protection policy on or after 27 January 2023 and
                holds the relevant policy for at least 12 months. The offer must be redeemed while
                the relevant policy remains in force. Terms and conditions apply. Zurich may
                withdraw this offer at anytime, subject to applicable laws.
              </p>
              <p>
                The offer consists of a complimentary will (RRP value AU$159.00), provided by Willed
                Pty Ltd ABN 20 638 925 032 (“Willed”) of Gardenvale Road, Gardenvale, VIC, 3185,
                through their technology platform that allows the creation of estate planning
                solutions using its forms and other information, where a customer holds (as
                policyholder) an Ezicover policy for a 12 month period. Click{' '}
                <ExternalLink
                  href="https://www.willed.com.au/terms-and-conditions/"
                  className={here}
                >
                  here
                </ExternalLink>{' '}
                to view Willed terms and conditions.
              </p>
              <p>
                The Zurich Loving Life App and the underlying offers and discounts are provided for
                Zurich by Entertainment Publications of Australia Pty Ltd, ABN 85 065 011 903 of
                53-55 Herbert Street, Artarmon NSW 2064 ('Entertainment'). Click{' '}
                <ExternalLink
                  href="https://app.frequentvalues.com.au/zurich/legals/zurich_legals.html"
                  className={here}
                >
                  here
                </ExternalLink>{' '}
                to view Loving Life terms and conditions.
              </p>
              <p>
                The promoter of the free online legal Will and Zurich Loving Life is Zurich
                Australia Limited, ABN 92 000 010 195 ('Zurich') of 118 Mount Street, North Sydney,
                NSW 2060.
              </p>
              <p>
                Zurich makes no warranty and accepts no liability in relation to the quality,
                suitability or value of the free online Will offers or Zurich Loving Life offers.
                Customers should make their own enquiries.
              </p>
              <p>
                By participating in these offers, you agree that you have read and understood their
                Terms and Conditions and agree to be bound by them. Zurich and its partners collect,
                use and disclose your personal information in accordance with their privacy policy.
                Click{' '}
                <ExternalLink
                  href="https://www.zurich.com.au/important-information/privacy"
                  className={here}
                >
                  here
                </ExternalLink>{' '}
                to view Zurich's privacy policy.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Container>
    </Reveal>
  );
}
