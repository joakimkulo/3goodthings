import { notFound } from 'next/navigation';
import archive from '../../../content/archive.json';
import SocialShare from '../../components/SocialShare';

export function generateStaticParams() {
  return archive.editions.map((edition) => ({ date: edition.editionDate }));
}

export async function generateMetadata({ params, searchParams }) {
  const { date } = await params;
  const query = await searchParams;
  const edition = archive.editions.find((item) => item.editionDate === date);
  if (!edition) return {};

  const storyIndex = Number.parseInt(query?.story, 10) - 1;
  const story = Number.isInteger(storyIndex) ? edition.stories[storyIndex] : null;
  const title = story ? `${story.title} — 3 Good Things` : `${edition.title} — 3 Good Things`;
  const description = story ? story.text : edition.subtitle;
  const image = story
    ? `/api/og?date=${encodeURIComponent(date)}&story=${storyIndex + 1}`
    : `/archive/${date}/opengraph-image`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: `${edition.editionDate}T06:00:00+02:00`,
      images: [{ url: image, width: 1200, height: 630, alt: story ? story.title : `3 Good Things — ${edition.editionDate}` }]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image]
    }
  };
}

function displayDate(value) {
  return new Intl.DateTimeFormat('en', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
  }).format(new Date(`${value}T12:00:00Z`));
}

export default async function ArchivedEdition({ params }) {
  const { date } = await params;
  const edition = archive.editions.find((item) => item.editionDate === date);
  if (!edition) notFound();

  return <main>
    <header id="top">
      <a className="brand-wrap" href="/" aria-label="3 Good Things home"><span className="brand">3 Good Things</span><span className="tag">Real progress. Every morning.</span></a>
      <nav aria-label="Main navigation"><a href="/">Today</a><a href="/archive">Archive</a><a className="button" href="/#subscribe">Subscribe</a></nav>
    </header>

    <section className="archive-edition-head">
      <a className="archive-back" href="/archive">← All editions</a>
      <div className="sectionhead"><div><span className="kicker">{displayDate(edition.editionDate)}</span><h1>{edition.title}</h1><p>{edition.subtitle}</p></div><span className="edition">{edition.number}</span></div>
    </section>

    <section className="today archive-edition">
      <div className="grid">{edition.stories.map((story, index) => <article id={`story-${index + 1}`} key={story.cat}>
        <div className={`story-mark mark-${index}`} aria-hidden="true"><span>0{index + 1}</span></div>
        <div className="meta"><span className="cat">{story.cat}</span><span>{story.date}</span></div>
        <h2>{story.title}</h2>
        <p>{story.text}</p>
        <p className="why"><b>Why it matters</b>{story.why}</p>
        <a className="source" href={story.href} target="_blank" rel="noreferrer"><span>Source</span>{story.source} ↗</a>
        <SocialShare story={story} index={index} editionDate={edition.editionDate} />
      </article>)}</div>
    </section>

    <a className="back-to-top" href="#top" aria-label="Back to the top of the page"><span>Back to top</span><b aria-hidden="true">↑</b></a>
    <footer><div><div className="brand">3 Good Things</div><div className="tag">Real progress. Every morning.</div></div><div className="footer-links"><a href="/">Today</a><a href="/archive">Archive</a><a href="mailto:hello@3goodthings.news">Contact</a></div><small>© 2026 3 Good Things</small></footer>
  </main>;
}
