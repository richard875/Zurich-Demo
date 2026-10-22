import { ArticleCard } from '@/components/article-card';
import { Container } from '@/components/container';
import { ExternalLink } from '@/components/external-link';
import { Headline } from '@/components/headline';
import { zurichLinks } from '@/components/site/links';
import { Button } from '@/components/ui/button';
import { photos } from './photos';

const articles = [
  {
    photo: photos.articleWhyAWill,
    tag: 'Wills',
    date: '10 February 2026',
    dateTime: '2026-02-10',
    title: 'Why is a Will important?',
    href: `${zurichLinks.educationHub}/why-is-a-will-important`,
  },
  {
    photo: photos.articleWillOnline,
    tag: 'Wills',
    date: '10 February 2026',
    dateTime: '2026-02-10',
    title: 'The benefits of writing a Will online',
    href: `${zurichLinks.educationHub}/the-benefits-of-writing-a-will-online`,
  },
  {
    photo: photos.articleLifeOrIncome,
    tag: 'Protection',
    date: '22 February 2023',
    dateTime: '2023-02-22',
    title: 'Do I need life cover, income protection - or both?',
    href: `${zurichLinks.educationHub}/life-cover-income-protection-or-both`,
  },
];

export function Articles() {
  return (
    <section aria-labelledby="articles-heading">
      <Container>
        <Headline id="articles-heading" size="list">
          Protect those who <em>matter</em> most
        </Headline>
        <div className="mt-10 grid gap-x-6 gap-y-10 md:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.href} {...article} />
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Button asChild size="md">
            <ExternalLink href={zurichLinks.educationHub}>Education hub</ExternalLink>
          </Button>
        </div>
      </Container>
    </section>
  );
}
