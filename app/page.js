'use client';

import { useEffect, useState } from 'react';
import edition from '../content/edition.json';

const stories = edition.stories;

function SignupForm({ compact = false }) {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [timezone, setTimezone] = useState('your local timezone');

  useEffect(() => {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
  }, []);

  async function subscribe(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = new FormData(form).get('email');
    setStatus('loading');
    setMessage('');
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
          utcOffsetMinutes: -new Date().getTimezoneOffset()
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Something went wrong.');
      form.reset();
      setStatus('success');
      setMessage(`Thank you — you’re subscribed! ${data.message} Delivery is set for 08:00 in ${timezone}.`);
    } catch (error) {
      setStatus('error');
      setMessage(error.message);
    }
  }

  return <div className={compact ? 'signup compact' : 'signup'}>
    <form onSubmit={subscribe}>
      <label className="sr-only" htmlFor={compact ? 'footer-email' : 'hero-email'}>Email address</label>
      <input id={compact ? 'footer-email' : 'hero-email'} name="email" type="email" autoComplete="email" placeholder="Your email address" required disabled={status === 'loading'} />
      <button type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'Joining…' : 'Get 3 Good Things'}</button>
    </form>
    <div className={`form-message ${status}`} role="status" aria-live="polite">{message || `Free. Delivered at 08:00 in ${timezone}. Unsubscribe anytime.`}</div>
  </div>;
}

function DeliveryClock() {
  const [label, setLabel] = useState('08:00 local time');
  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    fetch(`/api/delivery-preview?timezone=${encodeURIComponent(timezone)}`)
      .then((response) => response.json())
      .then((data) => {
        const next = new Intl.DateTimeFormat('en', { timeZone: data.timeZone, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(data.nextDeliveryAt));
        setLabel(`Next edition · ${next} · ${data.timeZone}`);
      })
      .catch(() => setLabel(`Every morning · 08:00 · ${timezone}`));
  }, []);
  return <span>{label}</span>;
}

export default function Home() {
  return <main>
    <header>
      <a className="brand-wrap" href="#top" aria-label="3 Good Things home"><span className="brand">3 Good Things</span><span className="tag">Real progress. Every morning.</span></a>
      <nav aria-label="Main navigation"><a href="#stories">Today</a><a href="#about">About</a><a href="#faq">FAQ</a><a className="button" href="#subscribe">Subscribe</a></nav>
    </header>

    <section className="hero" id="top">
      <div className="issue"><span>THE MORNING BRIEF</span><DeliveryClock /></div>
      <h1>A brighter perspective<br />on the news.</h1>
      <p className="lede">Every morning, we find three meaningful things that went right — verified, sourced and explained without the sugar coating.</p>
      <SignupForm />
    </section>

    <section className="today" id="stories">
      <div className="sectionhead"><div><span className="kicker">{edition.label}</span><h2>{edition.title}</h2></div><span className="edition">{edition.number}</span></div>
      <div className="grid">{stories.map((story, index) => <article key={story.cat}>
        <div className={`story-mark mark-${index}`} aria-hidden="true"><span>0{index + 1}</span></div>
        <div className="meta"><span className="cat">{story.cat}</span><span>{story.date}</span></div>
        <h3>{story.title}</h3>
        <p>{story.text}</p>
        <p className="why"><b>Why it matters</b>{story.why}</p>
        <a className="source" href={story.href} target="_blank" rel="noreferrer"><span>Source</span>{story.source} ↗</a>
      </article>)}</div>
    </section>

    <section className="principles" id="about">
      <div><span className="num">01</span><b>Always sourced</b><p>Every claim links to credible, preferably primary evidence.</p></div>
      <div><span className="num">02</span><b>Balanced and honest</b><p>We report measurable progress without pretending every problem is solved.</p></div>
      <div><span className="num">03</span><b>Worth your attention</b><p>Each story must represent a meaningful change, not a feel-good distraction.</p></div>
    </section>

    <section className="manifesto">
      <blockquote>“The world isn’t only<br />what goes wrong.”</blockquote>
      <div><span className="kicker">OUR POINT OF VIEW</span><h2>Good news without the sugar coating.</h2><p>We don’t believe everything is fine. We believe progress deserves reporting too. A story earns its place through a discovery, recovery, solved problem or concrete improvement — with enough context to understand what still needs work.</p></div>
    </section>

    <section className="faq" id="faq">
      <div><span className="kicker">QUESTIONS, ANSWERED</span><h2>Built for trust,<br />not clicks.</h2></div>
      <div className="questions">
        <details><summary>How do you choose stories?</summary><p>We look for recent, verifiable progress with real-world significance. Every item is checked against a primary institution, research paper or established newsroom before publication.</p></details>
        <details><summary>Is this only “positive news”?</summary><p>No. We include limitations, uncertainty and the work still left to do. Hope is useful only when it is grounded in facts.</p></details>
        <details><summary>How often will you email me?</summary><p>Once each morning when a new edition is published. You can unsubscribe from any email.</p></details>
      </div>
    </section>

    <section className="subscribe-band" id="subscribe"><div><span className="kicker">START TOMORROW DIFFERENTLY</span><h2>Three good things.<br />One calmer morning.</h2></div><SignupForm compact /></section>

    <footer><div><div className="brand">3 Good Things</div><div className="tag">Real progress. Every morning.</div></div><div className="footer-links"><a href="#about">About</a><a href="#faq">FAQ</a><a href="mailto:hello@3goodthings.news">Contact</a></div><small>© 2026 3 Good Things</small></footer>
  </main>;
}
