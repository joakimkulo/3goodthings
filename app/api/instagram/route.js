import { ImageResponse } from 'next/og';
import sharp from 'sharp';
import archive from '../../../content/archive.json';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const storyNumber = Number(searchParams.get('story'));
  const edition = archive.editions.find((item) => item.editionDate === date);
  if (!edition || !Number.isInteger(storyNumber) || storyNumber < 1 || storyNumber > 3) {
    return new Response('Edition or story not found.', { status: 404 });
  }
  const story = edition.stories[storyNumber - 1];
  if (!story) return new Response('Story not found.', { status: 404 });

  const accents = ['#275d70', '#137a75', '#b06b24'];
  const accent = accents[storyNumber - 1];
  const titleSize = story.title.length > 105 ? 66 : story.title.length > 75 ? 75 : 88;
  const dateLabel = new Intl.DateTimeFormat('en', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
  }).format(new Date(`${edition.editionDate}T12:00:00Z`));

  const image = new ImageResponse(
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between', background: '#f8f7f3', color: '#0b0c0f',
      padding: '86px 82px 72px', fontFamily: 'serif'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', fontSize: 42, letterSpacing: '-1.5px', fontWeight: 700 }}>3 Good Things</div>
          <div style={{ display: 'flex', fontFamily: 'sans-serif', fontSize: 24, fontWeight: 700, letterSpacing: '2px' }}>
            {storyNumber} / 3
          </div>
        </div>
        <div style={{ display: 'flex', marginTop: 62, width: 120, height: 12, background: accent }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 900 }}>
        <div style={{
          display: 'flex', color: accent, fontFamily: 'sans-serif', fontSize: 27,
          fontWeight: 700, letterSpacing: '3px', marginBottom: 38
        }}>{story.cat} · {dateLabel.toUpperCase()}</div>
        <div style={{
          display: 'flex', fontSize: titleSize, lineHeight: 1.06,
          letterSpacing: '-2px', overflowWrap: 'break-word'
        }}>{story.title}</div>
      </div>

      <div style={{
        display: 'flex', flexDirection: 'column', borderTop: '2px solid #b9b9b2',
        paddingTop: 34, fontFamily: 'sans-serif'
      }}>
        <div style={{ display: 'flex', fontSize: 27, fontWeight: 700 }}>Three real advances. Sources and context.</div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', marginTop: 18,
          fontSize: 22, color: '#545a59'
        }}>
          <span style={{ display: 'flex' }}>Read more at 3goodthings.news</span>
          <span style={{ display: 'flex' }}>{storyNumber === 3 ? 'READ THE FULL EDITION' : 'SWIPE FOR MORE →'}</span>
        </div>
      </div>
    </div>,
    { width: 1080, height: 1350 }
  );

  const png = Buffer.from(await image.arrayBuffer());
  const jpeg = await sharp(png)
    .flatten({ background: '#f8f7f3' })
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();

  return new Response(jpeg, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400'
    }
  });
}
