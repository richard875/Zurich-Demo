// Real Zurich pages this demo doesn't build, from the saved direct.zurich.com.au home page.
// The header, menu sheet and footer group them differently, so each link is defined once here.
const direct = 'https://direct.zurich.com.au';

export interface SiteLink {
  label: string;
  href: string;
}

export const zurichLinks = {
  lifeInsurance: `${direct}/life-insurance`,
  incomeProtection: `${direct}/income-protection`,
  homeLoanProtection: 'https://www.zurich.com.au/home-loan-protection',
  choosingCover: `${direct}/info/choosing-cover`,
  whyZurich: `${direct}/info/why-zurich`,
  faqs: `${direct}/info/faq`,
  educationHub: `${direct}/info/education-hub`,
  claims: `${direct}/info/claims`,
  contact: `${direct}/info/contact`,
  documents: `${direct}/info/documents`,
  covid: `${direct}/info/covid-19`,
  lovingLife: `${direct}/info/loving-life`,
  legal: 'https://www.zurich.com.au/important-information/legal.html',
  privacy: 'https://www.zurich.com.au/important-information/privacy.html',
  disclaimer: 'https://www.zurich.com.au/important-information/advice-notice.html',
};

const link = {
  choosingCover: { label: 'Help choosing my cover', href: zurichLinks.choosingCover },
  whyZurich: { label: 'Why Zurich?', href: zurichLinks.whyZurich },
  faqs: { label: 'FAQs', href: zurichLinks.faqs },
  educationHub: { label: 'Education hub', href: zurichLinks.educationHub },
  claims: { label: 'Making a claim', href: zurichLinks.claims },
  contact: { label: 'Contact us', href: zurichLinks.contact },
  documents: { label: 'Documents & forms', href: zurichLinks.documents },
  covid: { label: 'COVID-19', href: zurichLinks.covid },
  lovingLife: { label: 'Loving Life rewards program', href: zurichLinks.lovingLife },
};

export const productNav: SiteLink[] = [
  { label: 'Life insurance', href: zurichLinks.lifeInsurance },
  { label: 'Income protection', href: zurichLinks.incomeProtection },
  { label: 'Home loan protection', href: zurichLinks.homeLoanProtection },
];

// The header's Help & information menu.
export const helpMenu: { title: string; links: SiteLink[] }[] = [
  {
    title: 'Choosing cover',
    links: [link.choosingCover, link.whyZurich, link.faqs, link.educationHub],
  },
  {
    title: 'Support',
    links: [link.claims, link.contact, link.documents, link.covid, link.lovingLife],
  },
];

// The mobile menu lists it beside My policies.
export const makeClaim: SiteLink = { label: 'Make a claim', href: zurichLinks.claims };

// The header's top bar.
export const utilityLinks: SiteLink[] = [
  { label: 'Contact us', href: zurichLinks.contact },
  makeClaim,
];

export const footerGroups: { title: string; links: SiteLink[] }[] = [
  {
    title: 'Our cover',
    links: [
      { label: 'Ezicover Life Insurance', href: zurichLinks.lifeInsurance },
      { label: 'Ezicover Income Protection', href: zurichLinks.incomeProtection },
      { label: 'Home Loan Protection', href: zurichLinks.homeLoanProtection },
    ],
  },
  {
    title: 'Help & information',
    links: [link.choosingCover, link.whyZurich, link.faqs, link.educationHub, link.covid],
  },
  {
    title: 'Support',
    links: [link.claims, link.contact, link.documents, link.lovingLife],
  },
];

export const legalLinks: SiteLink[] = [
  { label: 'Legal', href: zurichLinks.legal },
  { label: 'Privacy', href: zurichLinks.privacy },
  { label: 'Disclaimer', href: zurichLinks.disclaimer },
];

// Zurich Direct's real numbers.
export const phones = {
  sales: { label: 'Sales', number: '1800 394 268', href: 'tel:1800394268' },
  customerCare: { label: 'Customer Care', number: '1800 025 015', href: 'tel:1800025015' },
};
