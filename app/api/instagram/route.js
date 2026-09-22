import sharp from 'sharp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const ogUrl = new URL('/api/og', requestUrl.origin);

  for (const key of ['date', 'story']) {
    const value = requestUrl.searchParams.get(key);
    if (value) ogUrl.searchParams.set(key, value);
  }

  const response = await fetch(ogUrl, { cache: 'no-store' });
  if (!response.ok) {
    return new Response('Unable to render Instagram image.', { status: 502 });
  }

  const png = Buffer.from(await response.arrayBuffer());
  const jpeg = await sharp(png)
    .flatten({ background: '#f8f7f3' })
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer();

  return new Response(jpeg, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400'
    }
  });
}
