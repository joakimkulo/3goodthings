import { ImageResponse } from 'next/og';
import archive from '../../../content/archive.json';

export const runtime = 'edge';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const storyIndex = Number.parseInt(searchParams.get('story'), 10) - 1;
  const edition = archive.editions.find((item) => item.editionDate === date) || archive.editions[0];
  const story = edition.stories[storyIndex] || edition.stories[0];
  const colors = ['#275d70', '#137a75', '#b06b24'];
  const accent = colors[Math.max(0, Math.min(storyIndex, 2))];
  const formattedDate = new Intl.DateTimeFormat('en', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
  }).format(new Date(`${edition.editionDate}T12:00:00Z`));

  return new ImageResponse(
    <div style={{
      width: '100%', height: '100%', display: 'flex', background: '#f8f7f3',
      color: '#0b0c0f', fontFamily: 'serif'
    }}>
      <div style={{ width: 26, height: '100%', display: 'flex', background: accent }} />
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '56px 64px 54px 58px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', fontSize: 34, letterSpacing: '-1px' }}>3 Good Things</div>
          <div style={{ display: 'flex', fontFamily: 'sans-serif', fontSize: 17, letterSpacing: '3px' }}>{formattedDate.toUpperCase()}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 1040 }}>
          <div style={{ display: 'flex', marginBottom: 22, color: accent, fontFamily: 'sans-serif', fontSize: 19, fontWeight: 700, letterSpacing: '3px' }}>
            {story.cat} · 0{Math.max(0, storyIndex) + 1}
          </div>
          <div style={{ display: 'flex', fontSize: 60, lineHeight: 1.02, letterSpacing: '-3px' }}>
            {story.title}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'sans-serif', fontSize: 20 }}>
          <span style={{ display: 'flex' }}>Verified progress, without the sugar coating.</span>
          <span style={{ display: 'flex', fontWeight: 700 }}>3goodthings.vercel.app</span>
        </div>
      </div>
    </div>,
    { width: 1200, height: 630 }
  );
}
