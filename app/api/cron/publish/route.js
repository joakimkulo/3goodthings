import { NextResponse } from 'next/server';
import edition from '../../../../content/edition.json';
import { nextEightUtc } from '../../../../lib/delivery-time.js';

const SITE_URL = 'https://3goodthings.news';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function storyUrl(index) {
  return `${SITE_URL}/archive/${edition.editionDate}?story=${index + 1}#story-${index + 1}`;
}

function shareButton(href, label, text) {
  return `<td style="padding:0 5px 0 0">
    <a href="${escapeHtml(href)}" aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}" style="display:inline-block;min-width:34px;height:34px;padding:0 8px;border:1px solid #aaa9a3;border-radius:18px;color:#0b0c0f;font:700 14px/34px Arial,sans-serif;text-align:center;text-decoration:none;box-sizing:border-box">${text}</a>
  </td>`;
}

function shareRow(story, index) {
  const url = storyUrl(index);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(story.title);
  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const linkedIn = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  const x = `https://x.com/intent/post?text=${encodedTitle}&url=${encodedUrl}`;
  const email = `mailto:?subject=${encodeURIComponent(story.title)}&body=${encodeURIComponent(`${story.title}\n\n${url}\n\nFrom 3 Good Things — three sourced stories every morning.`)}`;

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:18px 0 0">
    <tr>
      <td style="padding:0 12px 0 0;font:700 11px/34px Arial,sans-serif;letter-spacing:1.5px;text-transform:uppercase">Share</td>
      ${shareButton(facebook, 'Share this story on Facebook', 'f')}
      ${shareButton(linkedIn, 'Share this story on LinkedIn', 'in')}
      ${shareButton(x, 'Share this story on X', 'X')}
      ${shareButton(url, 'Open this story for more sharing options', '+')}
    </tr>
  </table>
  <p style="margin:8px 0 0;font:14px/1.5 Arial,sans-serif;color:#414345">Know someone who would appreciate this story? <a href="${escapeHtml(email)}" style="color:#0b0c0f;text-decoration:underline">Email it to them</a>.</p>`;
}

function editionHtml() {
  const stories = edition.stories.map((story, index) => `
    <div style="padding:24px 0;border-bottom:1px solid #aaa9a3">
      <p style="margin:0 0 8px;font:700 12px Arial,sans-serif;letter-spacing:1.5px">0${index + 1} · ${escapeHtml(story.cat)}</p>
      <h2 style="margin:0 0 14px;font:400 28px Georgia,serif;line-height:1.15">${escapeHtml(story.title)}</h2>
      <p style="font:17px Georgia,serif;line-height:1.55">${escapeHtml(story.text)}</p>
      <p style="font:17px Georgia,serif;line-height:1.55"><strong>Why it matters:</strong> ${escapeHtml(story.why)}</p>
      <p><a href="${escapeHtml(story.href)}" style="color:#0b0c0f;font-weight:bold">Source: ${escapeHtml(story.source)}</a></p>
      ${shareRow(story, index)}
    </div>`).join('');

  return `<div style="max-width:640px;margin:auto;color:#0b0c0f;background:#f8f7f3;padding:32px">
    <p style="margin:0 0 8px;font:12px Arial,sans-serif;letter-spacing:2px">3 GOOD THINGS</p>
    <h1 style="margin:0;font:400 42px Georgia,serif">${escapeHtml(edition.title)}</h1>
    <p style="font:18px Georgia,serif;line-height:1.5">${escapeHtml(edition.subtitle)}</p>
    <p style="font:14px/1.5 Arial,sans-serif;color:#414345">One story worth passing on? Share or email it directly below the story.</p>
    ${stories}
  </div>`;
}

export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.BEEHIIV_API_KEY;
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID;
  if (!apiKey || !publicationId) {
    return NextResponse.json({ error: 'Beehiiv is not configured.' }, { status: 503 });
  }

  const scheduledAt = nextEightUtc('Europe/Stockholm').toISOString();
  const scheduledEditionDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Stockholm', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(new Date(scheduledAt));
  if (edition.readyForSend !== true || edition.editionDate !== scheduledEditionDate) {
    return NextResponse.json({
      error: 'Edition is not ready for today.',
      expectedEditionDate: scheduledEditionDate,
      actualEditionDate: edition.editionDate,
      readyForSend: edition.readyForSend === true
    }, { status: 409 });
  }
  const response = await fetch(`https://api.beehiiv.com/v2/publications/${publicationId}/posts`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: edition.title,
      subtitle: edition.subtitle,
      body_content: editionHtml(),
      status: 'confirmed',
      scheduled_at: scheduledAt,
      recipients: { web: { tier_ids: [] }, email: { tier_ids: ['free', 'premium'] } },
      email_settings: {
        email_subject_line: `3 Good Things — ${edition.editionDate}`,
        email_preview_text: edition.subtitle,
        display_title_in_email: true,
        display_subtitle_in_email: true
      },
      web_settings: { hide_from_feed: false },
      utm_source: '3goodthings',
      utm_medium: 'email',
      utm_campaign: edition.editionDate
    }),
    cache: 'no-store'
  });

  const result = await response.json().catch(() => null);
  if (!response.ok) {
    console.error('Beehiiv post creation failed', response.status, result);
    return NextResponse.json({ error: 'Beehiiv post creation failed.', detail: result }, { status: 502 });
  }

  return NextResponse.json({ ok: true, scheduledAt, editionDate: edition.editionDate, postId: result?.data?.id });
}
