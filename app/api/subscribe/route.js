import { NextResponse } from 'next/server';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const { email, timezone, utcOffsetMinutes } = await request.json();
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const apiKey = process.env.BEEHIIV_API_KEY;
    const publicationId = process.env.BEEHIIV_PUBLICATION_ID;
    if (!apiKey || !publicationId) {
      return NextResponse.json({ error: 'Subscriptions are being prepared. Please try again soon.' }, { status: 503 });
    }

    const response = await fetch(`https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: normalizedEmail,
        reactivate_existing: true,
        send_welcome_email: false,
        double_opt_override: 'off',
        utm_source: '3goodthings-website',
        utm_medium: 'organic',
        custom_fields: [
          { name: 'Timezone', value: String(timezone || 'UTC').slice(0, 80) },
          { name: 'UTC Offset Minutes', value: String(Number.isFinite(utcOffsetMinutes) ? utcOffsetMinutes : 0) },
          { name: 'Delivery Time', value: '08:00 local' }
        ]
      }),
      cache: 'no-store'
    });

    if (!response.ok) {
      const detail = await response.json().catch(() => null);
      console.error('Beehiiv subscription failed', response.status, detail);
      return NextResponse.json({ error: response.status === 429 ? 'Too many attempts. Please wait a moment.' : 'We could not add you right now. Please try again.' }, { status: response.status === 429 ? 429 : 502 });
    }

    return NextResponse.json({ message: 'You’re subscribed.' });
  } catch {
    return NextResponse.json({ error: 'We could not add you right now. Please try again.' }, { status: 500 });
  }
}
