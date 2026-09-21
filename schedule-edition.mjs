import { readFile } from 'node:fs/promises';
import { nextEightUtc, safeTimeZone } from '../lib/delivery-time.js';

const required = ['BEEHIIV_API_KEY', 'BEEHIIV_PUBLICATION_ID', 'BEEHIIV_TIMEZONE_SEGMENTS_JSON'];
for (const key of required) if (!process.env[key]) throw new Error(`Missing ${key}`);

const editionPath = process.argv[2];
if (!editionPath) throw new Error('Usage: node scripts/schedule-edition.mjs content/edition.json');
const edition = JSON.parse(await readFile(editionPath, 'utf8'));
const bodyHtml = edition.bodyHtml || edition.stories.map((story) => `<h2>${story.title}</h2><p>${story.text}</p><p><strong>Why it matters:</strong> ${story.why}</p><p><a href="${story.href}">${story.source}</a></p>`).join('<hr>');
const segments = JSON.parse(process.env.BEEHIIV_TIMEZONE_SEGMENTS_JSON);
const apiRoot = `https://api.beehiiv.com/v2/publications/${process.env.BEEHIIV_PUBLICATION_ID}`;

for (const [timezoneInput, segmentId] of Object.entries(segments)) {
  const timezone = safeTimeZone(timezoneInput);
  const scheduledAt = nextEightUtc(timezone).toISOString();
  const response = await fetch(`${apiRoot}/posts`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.BEEHIIV_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: edition.title,
      subtitle: edition.subtitle,
      body_content: bodyHtml,
      status: 'confirmed',
      scheduled_at: scheduledAt,
      recipients: { web: { tier_ids: [] }, email: { tier_ids: ['free', 'premium'], include_segment_ids: [segmentId] } },
      email_settings: { email_subject_line: edition.title, email_preview_text: edition.subtitle },
      web_settings: { hide_from_feed: true },
      utm_source: '3goodthings',
      utm_medium: 'email',
      utm_campaign: edition.editionDate
    })
  });
  if (!response.ok) throw new Error(`${timezone}: Beehiiv returned ${response.status} ${await response.text()}`);
  console.log(`${timezone}: scheduled ${scheduledAt}`);
}
