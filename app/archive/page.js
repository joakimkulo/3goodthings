import archive from '../../content/archive.json';

function displayDate(value) {
  return new Intl.DateTimeFormat('en', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
  }).format(new Date(`${value}T12:00:00Z`));
}

export const metadata = {
  title: 'Archive — 3 Good Things',
  description: 'Previous editions of 3 Good Things: verified progress worth knowing.'
};

export default function ArchivePage() {
  const editions = [...archive.editions].sort((a, b) => b.editionDate.localeCompare(a.editionDate));

  return <main>
    <header>
      <a className="brand-wrap" href="/" aria-label="3 Good Things home"><span className="brand">3 Good Things</span><span className="tag">Real progress. Every morning.</span></a>
      <nav aria-label="Main navigation"><a href="/">Today</a><a aria-current="page" href="/archive">Archive</a><a className="button" href="/#subscribe">Subscribe</a></nav>
    </header>

    <section className="archive-hero">
      <span className="kicker">EVERY EDITION</span>
      <h1>The archive.</h1>
      <p>Three verified developments from every morning, kept here for reading and sharing.</p>
    </section>

    <section className="archive-list" aria-label="Previous editions">
      {editions.map((item) => <a className="archive-card" href={`/archive/${item.editionDate}`} key={item.editionDate}>
        <div><span className="kicker">{displayDate(item.editionDate)}</span><span className="edition">{item.number}</span></div>
        <h2>{item.title}</h2>
        <p>{item.subtitle}</p>
        <span className="archive-arrow" aria-hidden="true">→</span>
      </a>)}
    </section>

    <footer><div><div className="brand">3 Good Things</div><div className="tag">Real progress. Every morning.</div></div><div className="footer-links"><a href="/">Today</a><a href="/archive">Archive</a><a href="mailto:hello@3goodthings.news">Contact</a></div><small>© 2026 3 Good Things</small></footer>
  </main>;
}
