import type { ReactNode } from 'react';
import { Container } from '@/components/container';
import { ExternalLink } from '@/components/external-link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { footerGroups, legalLinks, phones, zurichLinks } from './links';

const footerLink = 'inline-flex items-center gap-1 text-b-18 underline-offset-4 hover:underline';

const groups: { title: string; links: ReactNode[] }[] = [
  ...footerGroups.map((group) => ({
    title: group.title,
    links: group.links.map((link) => (
      <ExternalLink key={link.href} href={link.href} className={footerLink}>
        {link.label}
      </ExternalLink>
    )),
  })),
  {
    title: 'Talk to us',
    links: [phones.sales, phones.customerCare].map((phone) => (
      <a key={phone.href} href={phone.href} className={footerLink}>
        {phone.label} {phone.number}
      </a>
    )),
  },
];

function LinkList({ links }: { links: ReactNode[] }) {
  return (
    <ul className="grid gap-3">
      {links.map((link, index) => (
        <li key={index}>{link}</li>
      ))}
    </ul>
  );
}

export function SiteFooter() {
  return (
    <footer className="on-blue bg-zurich-blue text-white">
      <Container className="pt-10 md:pt-16 pb-12">
        <div className="hidden gap-8 md:grid md:grid-cols-2 lg:grid-cols-4">
          {groups.map((group) => (
            <div key={group.title}>
              <h2 className="mb-5 text-base font-medium">{group.title}</h2>
              <LinkList links={group.links} />
            </div>
          ))}
        </div>

        {/* Below md the groups fold up, as on zurich.com.au's mobile footer. */}
        <Accordion type="multiple" className="md:hidden">
          {groups.map((group) => (
            <AccordionItem key={group.title} value={group.title} className="border-white/40">
              <AccordionTrigger icon="chevron" level="h2" className="text-base font-medium">
                {group.title}
              </AccordionTrigger>
              <AccordionContent>
                <LinkList links={group.links} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-8 md:mt-12 md:border-t md:border-white/40 md:pt-6">
          <ul className="flex justify-center gap-6 md:justify-end">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <ExternalLink href={link.href} className={footerLink}>
                  {link.label}
                </ExternalLink>
              </li>
            ))}
          </ul>
          <div className="mt-8 grid gap-4 text-sm">
            <p>
              Ezicover is a registered trademark of Zurich Australia Limited ABN 92 000 010 195.
              Ezicover Life Insurance and Ezicover Income Protection are issued by Zurich ABN 92 000
              010 195, AFSL 232510. The information on this page is of a general nature only and
              does not take into account your objectives, financial situation or needs. You should
              consider these factors, the appropriateness of the information and the Ezicover
              Product Disclosure Statement (PDS) and Policy Terms available on the Zurich Ezicover{' '}
              <ExternalLink href={zurichLinks.documents} className="underline">
                website
              </ExternalLink>{' '}
              before making any decisions. Furthermore, this product has been designed to meet
              certain objectives, financial situations, and needs, which are described in our Target
              Market Determination available on the Zurich Ezicover{' '}
              <ExternalLink href={zurichLinks.documents} className="underline">
                website
              </ExternalLink>{' '}
              or by contacting Zurich on 1800 394 268. The Ezicover insurance products are only
              available to Australian residents.
            </p>
            <p>
              In the spirit of reconciliation, Zurich acknowledges the Traditional Custodians of
              Country throughout Australia and their connections to land, sea and community. We pay
              our respect to their Elders past and present and extend that respect to all Aboriginal
              and Torres Strait Islander peoples today.
            </p>
            <p>Always was, always will be Aboriginal land.</p>
            <p>
              © 2026 Zurich Australia · Design concept, not the live Zurich Direct site · A Richard
              Everley's Production
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
