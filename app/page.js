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
    try {
      if (window.localStorage.getItem('3-good-things-subscribed') === 'true') setStatus('success');
    } catch {
      // The signup still works when browser storage is unavailable.
    }
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
      try {
        window.localStorage.setItem('3-good-things-subscribed', 'true');
      } catch {
        // The confirmation remains visible for the current visit.
      }
      setStatus('success');
      setMessage('Thank you — you’re subscribed!');
    } catch (error) {
      setStatus('error');
      setMessage(error.message);
    }
  }

  if (status === 'success') {
    return <div className={compact ? 'signup compact' : 'signup'}>
      <div className="signup-success" role="status" aria-live="polite">
        <span>YOU’RE IN</span>
        <strong>Thank you — you’re subscribed.</strong>
        <p>Your first edition will arrive at 08:00 local time. No further confirmation is needed.</p>
      </div>
    </div>;
  }

  return <div className={compact ? 'signup compact' : 'signup'}>
    <form onSubmit={subscribe}>
      <label className="sr-only" htmlFor={compact ? 'footer-email' : 'hero-email'}>Email address</label>
      <input id={compact ? 'footer-email' : 'hero-email'} name="email" type="email" autoComplete="email" placeholder="Your email address" required disabled={status === 'loading'} />
      <button type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'Joining…' : 'Get 3 Good Things'}</button>
    </form>
    <div className={`form-message ${status}`} role="status" aria-live="polite">{message || 'Free. Delivered daily at 08:00 local time. Unsubscribe anytime.'}</div>
  </div>;
}

// Social share controls use icons; accessible names remain available to assistive technology.
function ShareButtons({ story, index }) {
  const [copied, setCopied] = useState(false);

  function storyUrl() {
    return `${window.location.origin}${window.location.pathname}#story-${index + 1}`;
  }

  function openShareWindow(url) {
    window.open(url, '_blank', 'noopener,noreferrer,width=720,height=620');
  }

  function shareFacebook() {
    openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(storyUrl())}`);
  }

  function shareLinkedIn() {
    openShareWindow(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(storyUrl())}`);
  }

  function shareX() {
    openShareWindow(`https://x.com/intent/post?text=${encodeURIComponent(story.title)}&url=${encodeURIComponent(storyUrl())}`);
  }

  async function shareInstagram() {
    const url = storyUrl();
    const shareData = { title: story.title, text: story.text, url };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        if (error?.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(`${story.title}\n${url}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  return <div className="share-row" aria-label={`Share ${story.title}`}>
    <span>{copied ? 'Link copied' : 'Share'}</span>
    <button type="button" onClick={shareFacebook} aria-label="Share this story on Facebook" title="Facebook">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h3V4h-3c-3 0-5 2-5 5v2H6v4h3v7h4v-7h3.5l.5-4h-4V9c0-.7.3-1 1-1Z"/></svg>
    </button>
    <button type="button" onClick={shareInstagram} aria-label="Share this story using Instagram or your phone’s share menu" title="Instagram">
      <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="17.5" cy="6.5" r="1.2"/></svg>
    </button>
    <button type="button" onClick={shareLinkedIn} aria-label="Share this story on LinkedIn" title="LinkedIn">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3.5A2.5 2.5 0 1 1 5 8a2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm6 0h4v1.7c.9-1.3 2.2-2 4-2 3.1 0 4 2 4 5.4V21h-4v-6.1c0-1.5-.3-2.7-1.9-2.7-1.8 0-2.1 1.4-2.1 2.8v6H9V9Z"/></svg>
    </button>
    <button type="button" onClick={shareX} aria-label="Share this story on X" title="X">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3h4.7l4.1 5.5L17.5 3H20l-6 7.4L20.8 21h-4.7l-4.7-6.2L6.2 21H3.7l6.5-8.1L4 3Zm3.5 2 9.6 14h1.2L8.7 5H7.5Z"/></svg>
    </button>
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
        setLabel(`Next edition · ${next} local time`);
      })
      .catch(() => setLabel('Every morning · 08:00 local time'));
  }, []);
  return <span>{label}</span>;
}

export default function Home() {
  const [editionReady, setEditionReady] = useState(false);

  useEffect(() => {
    const todayInStockholm = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Stockholm', year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(new Date());
    setEditionReady(edition.readyForSend === true && edition.editionDate === todayInStockholm);
  }, []);

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
      <div className="sectionhead"><div><span className="kicker">{editionReady ? edition.label : 'TODAY’S EDITION'}</span><h2>{editionReady ? edition.title : 'Being carefully verified'}</h2></div>{editionReady && <span className="edition">{edition.number}</span>}</div>
      {editionReady ? <div className="grid">{stories.map((story, index) => <article id={`story-${index + 1}`} key={story.cat}>
        <div className={`story-mark mark-${index}`} aria-hidden="true"><span>0{index + 1}</span></div>
        <div className="meta"><span className="cat">{story.cat}</span><span>{story.date}</span></div>
        <h3>{story.title}</h3>
        <p>{story.text}</p>
        <p className="why"><b>Why it matters</b>{story.why}</p>
        <a className="source" href={story.href} target="_blank" rel="noreferrer"><span>Source</span>{story.source} ↗</a>
        <ShareButtons story={story} index={index} />
      </article>)}</div> : <div className="edition-pending" role="status">
        <span>CHECKING THE FACTS</span>
        <p>Today’s edition is still being verified. Please check back shortly.</p>
      </div>}
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

    <a className="back-to-top" href="#top" aria-label="Back to the top of the page"><span>Back to top</span><b aria-hidden="true">↑</b></a>

    <footer><div><div className="brand">3 Good Things</div><div className="tag">Real progress. Every morning.</div></div><div className="footer-links"><a href="#about">About</a><a href="#faq">FAQ</a><a href="mailto:hello@3goodthings.news">Contact</a></div><small>© 2026 3 Good Things</small></footer>
  </main>;
}
