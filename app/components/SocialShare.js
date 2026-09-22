'use client';

import { useState } from 'react';

export default function SocialShare({ story, index, editionDate }) {
  const [copied, setCopied] = useState(false);

  function storyUrl() {
    return `${window.location.origin}/archive/${editionDate}?story=${index + 1}#story-${index + 1}`;
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
