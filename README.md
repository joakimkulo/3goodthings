# 3 Good Things — v0.2

A launch-ready editorial newsletter site built with Next.js 15.

## What changed

- Three sourced pilot stories with an explicit editorial standard.
- Working newsletter signup route with validation and clear UI states.
- Beehiiv integration with double opt-in and welcome email.
- FAQ, privacy-conscious signup copy, responsive design and accessible form feedback.
- A clearer editorial format designed for a two-minute morning read.
- Subscriber timezone capture and a daylight-saving-aware 08:00 local delivery engine.

## Run locally

1. Install Node.js 20+.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Add the Beehiiv API key and publication ID.
5. Run `npm run dev` and open http://localhost:3000.

## 08:00 local delivery

The signup form detects the browser's IANA timezone (for example `Europe/Stockholm`) and stores it in Beehiiv together with the current UTC offset and the `08:00 local` delivery preference. Create these three Beehiiv custom fields before launch: `Timezone`, `UTC Offset Minutes`, and `Delivery Time`.

Create one dynamic Beehiiv segment for each timezone currently represented by subscribers, then add the timezone-to-segment IDs to `BEEHIIV_TIMEZONE_SEGMENTS_JSON`. The scheduler calculates 08:00 separately for each IANA timezone on every edition, so daylight-saving changes are handled on the date of delivery.

Prepare the approved edition in `content/edition.json` and run:

`node scripts/schedule-edition.mjs content/edition.json`

The homepage and email scheduler both read this same edition file, so the web and newsletter versions cannot drift apart. The command creates one email-only Beehiiv post per timezone segment, all carrying the same edition but scheduled for 08:00 local time. Beehiiv's Create Post API is currently limited to Max and Enterprise plans. The website's delivery endpoint uses the same timezone calculation and exposes the correct local edition date before and after the 08:00 cutoff.

Without the two Beehiiv variables, the site still runs but subscriptions return a temporary unavailable message. Secrets remain server-side.

## Daily publishing flow

1. Find candidate stories from primary or trusted sources.
2. Verify the central claim, date, number and limitation.
3. Replace the three entries in `app/page.js`.
4. Publish the matching Beehiiv edition and schedule the morning email.
5. Check every link and read the full edition once before sending.
6. Record the source publication date and the date the direct link was last checked.
7. Keep one verified secondary source in the editorial notes so a dead link can be replaced without weakening the claim.

## Editorial acceptance test

Each story must answer yes to all five questions:

- Did something measurable actually improve?
- Is the claim supported by a credible source?
- Is the limitation or unfinished work represented fairly?
- Can the reader understand why it matters in under one minute?
- Would the story still deserve attention without a sensational headline?
- Does every source link open successfully on both desktop and mobile at publication time?
