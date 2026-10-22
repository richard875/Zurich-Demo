import type { ReactNode } from 'react';
import { Container } from '@/components/container';
import { Headline } from '@/components/headline';
import { IconLink } from '@/components/icon-link';
import { Photo, type PhotoSource } from '@/components/photo';
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
        'Life Cover Insurance:',
        'Pays a lump sum to your loved ones if you pass away or are diagnosed with a terminal illness. It can cover debts, living costs, and education. Premiums depend on your age, lifestyle, job, and cover amount.',
      ],
      [
        'Income Protection Insurance:',
        'Replaces up to 70% of your income if you can’t work due to illness or injury, helping cover everyday expenses—even for non-work-related conditions.',
      ],
      [
        'Why Consider Both?',
        'Together, these policies provide broader protection—especially during major life changes like marriage or starting a family. Consider your financial responsibilities and how each policy could support your loved ones if times get tough.',
      ],
      [
        'Anton’s Story:',
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
        'Value of Unpaid Work:',
        'Childcare and housework are vital but often undervalued economically.',
      ],
      [
        'Gender Gap in Unpaid Work:',
        'Primary caregivers, usually women, see a big rise in unpaid work after the first child.',
      ],
      [
        'Economic Impact:',
        'In Australia, unpaid work is valued at $565 billion, or 33.9% of GDP, with women doing most of it.',
      ],
      [
        'Need for Dual Coverage:',
        'Both partners need life insurance for financial security. It covers mortgage payments, home maintenance, debts, and children’s education.',
      ],
      [
        'Benefits of Joint Life Insurance:',
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
        'Young and Single:',
        'Income protection covers bills if you’re unable to work due to illness or injury. Buying life insurance early means lower premiums.',
      ],
      [
        'Getting Married:',
        'Ensure financial security for your partner with life insurance and income protection.',
      ],
      [
        'Having Children:',
        'Protect your family with life insurance and income protection for financial support if you can’t work.',
      ],
      [
        'Buying a House:',
        'Reassess coverage to ensure your family can pay off the mortgage in case of illness, injury, or death.',
      ],
      [
        'Starting Over:',
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
        'Application Process:',
        'Answer questions honestly. You may need a medical exam or records to avoid future claim issues.',
      ],
      [
        'Risk Assessment:',
        'Underwriters estimate the likelihood of claims to decide if you can be insured and on what terms.',
      ],
      [
        'Factors Considered:',
        'Health, age, and occupation are key. Smokers and those with risky hobbies or jobs may face higher premiums. Accurate information ensures better pricing.',
      ],
      [
        'High-Risk Assessments:',
        'High-risk individuals may face higher premiums, exclusions, or be declined. Check the Product Disclosure Statement for details.',
      ],
      [
        'Policy Reviews:',
        'Life changes like new jobs or quitting smoking can prompt policy reviews. Annual reviews and life events may allow cover adjustments. Always check your Product Disclosure Statement.',
      ],
    ],
    learnMore: `${educationHub}/how-does-life-insurance-underwriting-work`,
    photo: photos.tab4,
  },
];

export function CoverTabs() {
  return (
    <section aria-labelledby="cover-tabs-heading">
      <Container>
        <Headline id="cover-tabs-heading">Help choosing your cover</Headline>
        <Tabs defaultValue={tabs[0].value} className="mt-8">
          <TabsList aria-label="Help choosing your cover">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent
              key={tab.value}
              value={tab.value}
              className="grid items-start gap-8 md:grid-cols-[1fr_minmax(0,350px)] md:gap-12"
            >
              <div className="grid gap-6 [&_strong]:font-semibold">
                <p className="text-b-20">{tab.lead}</p>
                <ol className="grid list-decimal gap-4 pl-6 text-b-18">
                  {tab.points.map(([lead, text]) => (
                    <li key={lead}>
                      <strong>{lead}</strong> {text}
                    </li>
                  ))}
                </ol>
                <IconLink href={tab.learnMore} external>
                  Learn more
                </IconLink>
              </div>
              <Photo
                photo={tab.photo}
                className="aspect-[350/437] w-full max-w-[350px] rounded-card object-cover"
              />
            </TabsContent>
          ))}
        </Tabs>
      </Container>
    </section>
  );
}
