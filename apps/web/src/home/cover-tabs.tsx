import type { ReactNode } from 'react';
import { Container } from '@/components/container';
import { ExternalLink } from '@/components/external-link';
import { Headline } from '@/components/headline';
import { Photo, type PhotoSource } from '@/components/photo';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { photos } from './photos';

interface CoverTab {
  value: string;
  label: string;
  lead: ReactNode;
  points: [string, string][];
  learnMore: string;
  photo: PhotoSource;
}

const educationHub = 'https://direct.zurich.com.au/info/education-hub';

// Zurich Direct's four tabs, word for word: tab 1 from the saved page, tabs 2 to 4 from the screenshots.
// The lead-ins sit on their own line, so they drop their trailing colon.
const tabs: CoverTab[] = [
  {
    value: 'life-or-income',
    label: 'Life cover, income protection, or both?',
    lead: (
      <>
        <strong>Life cover and income protection</strong> offer financial security in different
        ways. Understanding their benefits helps you decide if you need one or both.
      </>
    ),
    points: [
      [
        'Life Cover Insurance',
        'Pays a lump sum to your loved ones if you pass away or are diagnosed with a terminal illness. It can cover debts, living costs, and education. Premiums depend on your age, lifestyle, job, and cover amount.',
      ],
      [
        'Income Protection Insurance',
        "Replaces up to 70% of your income if you can't work due to illness or injury, helping cover everyday expenses - even for non-work-related conditions.",
      ],
      [
        'Why Consider Both?',
        'Together, these policies provide broader protection - especially during major life changes like marriage or starting a family. Consider your financial responsibilities and how each policy could support your loved ones if times get tough.',
      ],
      [
        "Anton's Story",
        'Anton, a 45-year-old engineer, had both covers. After an accident left him unable to work for 18 months, income protection paid 70% of his salary, keeping his family secure.',
      ],
    ],
    learnMore: `${educationHub}/life-cover-income-protection-or-both`,
    photo: photos.tab1,
  },
  {
    value: 'couples',
    label: 'Key considerations for couples',
    lead: (
      <>
        <strong>Balance in relationships</strong> is crucial. But often only the main breadwinner
        has life insurance, leaving the partner handling unpaid domestic or child-rearing duties
        uncovered.
      </>
    ),
    points: [
      [
        'Value of Unpaid Work',
        'Childcare and housework are vital but often undervalued economically.',
      ],
      [
        'Gender Gap in Unpaid Work',
        'Primary caregivers, usually women, see a big rise in unpaid work after the first child.',
      ],
      [
        'Economic Impact',
        'In Australia, unpaid work is valued at $565 billion, or 33.9% of GDP, with women doing most of it.',
      ],
      [
        'Need for Dual Coverage',
        "Both partners need life insurance for financial security. It covers mortgage payments, home maintenance, debts, and children's education.",
      ],
      [
        'Benefits of Joint Life Insurance',
        'Joint policies offer simpler applications, potential discounts, and convenience. This results in cheaper premiums and comprehensive cover.',
      ],
    ],
    learnMore: `${educationHub}/life-insurance-for-couples`,
    photo: photos.tab2,
  },
  {
    value: 'review',
    label: 'When to review your life insurance',
    lead: (
      <>
        <strong>Life insurance needs change</strong> as your life evolves. Here are key milestones
        for reviewing your cover:
      </>
    ),
    points: [
      [
        'Young and Single',
        "Income protection covers bills if you're unable to work due to illness or injury. Buying life insurance early means lower premiums.",
      ],
      [
        'Getting Married',
        'Ensure financial security for your partner with life insurance and income protection.',
      ],
      [
        'Having Children',
        "Protect your family with life insurance and income protection for financial support if you can't work.",
      ],
      [
        'Buying a House',
        'Reassess coverage to ensure your family can pay off the mortgage in case of illness, injury, or death.',
      ],
      [
        'Starting Over',
        'Update insurance and beneficiaries after major life changes like losing a spouse, divorce, remarrying, or starting a new family.',
      ],
    ],
    learnMore: `${educationHub}/when-to-review-your-life-insurance`,
    photo: photos.tab3,
  },
  {
    value: 'underwriting',
    label: 'Understanding life insurance underwriting',
    lead: (
      <>
        <strong>Underwriting</strong> looks at your health, age, job, and hobbies to assess risk.
      </>
    ),
    points: [
      [
        'Application Process',
        'Answer questions honestly. You may need a medical exam or records to avoid future claim issues.',
      ],
      [
        'Risk Assessment',
        'Underwriters estimate the likelihood of claims to decide if you can be insured and on what terms.',
      ],
      [
        'Factors Considered',
        'Health, age, and occupation are key. Smokers and those with risky hobbies or jobs may face higher premiums. Accurate information ensures better pricing.',
      ],
      [
        'High-Risk Assessments',
        'High-risk individuals may face higher premiums, exclusions, or be declined. Check the Product Disclosure Statement for details.',
      ],
      [
        'Policy Reviews',
        'Life changes like new jobs or quitting smoking can prompt policy reviews. Annual reviews and life events may allow cover adjustments. Always check your Product Disclosure Statement.',
      ],
    ],
    learnMore: `${educationHub}/how-does-life-insurance-underwriting-work`,
    photo: photos.tab4,
  },
];

// zurich.com.au's pill tabs. Each panel has its photo on the left from md (the lime band above has its
// photo on the right) and the text beside it; below md the photo is left out, as on Zurich Direct.
// The gaps follow the rest of the page: 40px under the heading and between blocks, 64px between
// photo and text as in the lime band, and 32px before the panel's button, as before a promo's buttons.
// Learn more is styled like the product cards' "Get an online quote" button.
export function CoverTabs() {
  return (
    <section aria-labelledby="cover-tabs-heading">
      <Container>
        <Headline id="cover-tabs-heading">Help choosing your cover</Headline>
        <Tabs defaultValue={tabs[0].value} className="mt-10">
          <TabsList aria-label="Help choosing your cover">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="mt-10 grid">
            {tabs.map((tab) => (
              <TabsContent
                key={tab.value}
                value={tab.value}
                className="md:grid md:grid-cols-[224px_1fr] md:items-start md:gap-16 lg:grid-cols-[350px_1fr]"
              >
                <Photo
                  photo={tab.photo}
                  className="hidden aspect-[350/437] w-full rounded-promo object-cover md:block"
                />
                <div className="max-w-160">
                  <p className="text-b-20 font-light md:text-2xl md:leading-normal [&_strong]:font-medium">
                    {tab.lead}
                  </p>
                  <ol className="mt-6 grid gap-4">
                    {tab.points.map(([lead, text], index) => (
                      <li
                        key={lead}
                        className="grid grid-cols-[2rem_1fr] gap-x-3 text-b-18 md:gap-x-4"
                      >
                        <span
                          aria-hidden="true"
                          className="-my-1 flex size-8 items-center justify-center self-center rounded-full bg-zurich-blue text-base font-semibold text-white"
                        >
                          {index + 1}
                        </span>
                        <strong className="font-semibold">{lead}</strong>
                        {/* Below md the text runs the full width under its number. */}
                        <p className="col-span-2 mt-1 md:col-span-1 md:col-start-2">{text}</p>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-8">
                    <Button asChild>
                      <ExternalLink href={tab.learnMore} className="h-11!">
                        Learn more
                      </ExternalLink>
                    </Button>
                  </div>
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </Container>
    </section>
  );
}
