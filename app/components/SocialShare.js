'use client';

import { useEffect, useState } from 'react';

export default function SocialShare({ story, index, editionDate }) {
  const [feedback, setFeedback] = useState('');
  const [useNativeShare, setUseNativeShare] = useState(false);

  useEffect(() => {
    const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches;
    setUseNativeShare(Boolean(navigator.share && (coarsePointer || window.innerWidth < 900)));
  }, []);

  function storyUrl() {
    return `${window.location.origin}/archive/${editionDate}?story=${index + 1}#story-${index + 1}`;
  }

  function openShareWindow(url) {
    window.open(url, '_blank', 'noopener,noreferrer,width=720,height=620');
  }

  function clearFeedbackLater(delay = 4500) {
    window.setTimeout(() => setFeedback(''), delay);
  }

  async function nativeLinkShare(target) {
    setFeedback(`Choose ${target} in your phone’s share menu.`);
    try {
      await navigator.share({ title: story.title, text: story.title, url: storyUrl() });
      setFeedback('');
    } catch (error) {
      if (error?.name === 'AbortError') {
        setFeedback('');
        return;
      }
      await copyStoryLink();
    }
  }

  async function copyStoryLink() {
    try {
      await navigator.clipboard.writeText(`${story.title}\n${storyUrl()}`);
      setFeedback('Title and link copied.');
      clearFeedbackLater();
    } catch {
      setFeedback('Unable to copy. Open the story and copy its address.');
      clearFeedbackLater();
    }
  }

  function shareFacebook() {
    if (useNativeShare) {
      nativeLinkShare('Facebook');
      return;
    }
    openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(storyUrl())}&display=popup`);
  }

  function shareLinkedIn() {
    if (useNativeShare) {
      nativeLinkShare('LinkedIn');
      return;
    }
    openShareWindow(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(storyUrl())}`);
  }

  function shareX() {
    openShareWindow(`https://x.com/intent/post?text=${encodeURIComponent(story.title)}&url=${encodeURIComponent(storyUrl())}`);
  }

  async function shareInstagram() {
    const url = storyUrl();
    const imageUrl = `/api/og?date=${encodeURIComponent(editionDate)}&story=${index + 1}`;
    setFeedback(useNativeShare ? 'Preparing the image…' : 'Preparing an Instagram image…');

    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error('Image unavailable');
      const blob = await response.blob();
      const file = new File([blob], `3-good-things-${editionDate}-${index + 1}.png`, { type: 'image/png' });

      if (useNativeShare && navigator.canShare?.({ files: [file] })) {
        setFeedback('Choose Instagram in your phone’s share menu.');
        try {
          await navigator.share({
            files: [file],
            title: story.title,
            text: `${story.title}\n${url}`
          });
          setFeedback('');
          return;
        } catch (error) {
          if (error?.name === 'AbortError') {
            setFeedback('');
            return;
          }
        }
      }

      if (useNativeShare) {
        setFeedback('Choose Instagram in your phone’s share menu.');
        await navigator.share({ title: story.title, text: story.title, url });
        setFeedback('');
        return;
      }

      const downloadUrl = URL.createObjectURL(blob);
      const download = document.createElement('a');
      download.href = downloadUrl;
      download.download = file.name;
      document.body.appendChild(download);
      download.click();
      download.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);

      let copied = false;
      try {
        await navigator.clipboard.writeText(`${story.title}\n${url}`);
        copied = true;
      } catch {
        // The image download still succeeds if clipboard access is blocked.
      }

      setFeedback(copied
        ? 'Image downloaded and caption copied — upload them in Instagram.'
        : 'Image downloaded — upload it in Instagram and add the story link.');
      clearFeedbackLater(8000);
    } catch (error) {
      if (error?.name === 'AbortError') {
        setFeedback('');
        return;
      }
      await copyStoryLink();
    }
  }

  return <div className="share-block">
    <div className="share-row" aria-label={`Share ${story.title}`}>
      <span>Share</span>
      <button type="button" onClick={shareFacebook} aria-label="Share this story on Facebook" title="Facebook">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h3V4h-3c-3 0-5 2-5 5v2H6v4h3v7h4v-7h3.5l.5-4h-4V9c0-.7.3-1 1-1Z"/></svg>
      </button>
      <button type="button" onClick={shareInstagram} aria-label="Prepare and share this story on Instagram" title="Instagram">
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="17.5" cy="6.5" r="1.2"/></svg>
      </button>
      <button type="button" onClick={shareLinkedIn} aria-label="Share this story on LinkedIn" title="LinkedIn">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3.5A2.5 2.5 0 1 1 5 8a2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm6 0h4v1.7c.9-1.3 2.2-2 4-2 3.1 0 4 2 4 5.4V21h-4v-6.1c0-1.5-.3-2.7-1.9-2.7-1.8 0-2.1 1.4-2.1 2.8v6H9V9Z"/></svg>
      </button>
      <button type="button" onClick={shareX} aria-label="Share this story on X" title="X">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3h4.7l4.1 5.5L17.5 3H20l-6 7.4L20.8 21h-4.7l-4.7-6.2L6.2 21H3.7l6.5-8.1L4 3Zm3.5 2 9.6 14h1.2L8.7 5H7.5Z"/></svg>
      </button>
      <button type="button" onClick={copyStoryLink} aria-label="Copy this story’s title and link" title="Copy link">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 14.5a4 4 0 0 1 0-5.7l3-3a4 4 0 1 1 5.7 5.7l-1.4 1.4-1.5-1.5 1.4-1.4a2 2 0 1 0-2.8-2.8l-3 3a2 2 0 0 0 0 2.8l-1.4 1.5Zm5-5 1.5 1.5a4 4 0 0 1 0 5.7l-3 3A4 4 0 0 1 7.3 14l1.4-1.4 1.5 1.5-1.4 1.4a2 2 0 1 0 2.8 2.8l3-3a2 2 0 0 0 0-2.8l-1.5-1.5 1.4-1.5Z"/></svg>
      </button>
    </div>
    <p className="share-feedback" role="status" aria-live="polite">{feedback}</p>
  </div>;
}
