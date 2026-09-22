import { ImageResponse } from 'next/og';
import archive from '../../../content/archive.json';

export const alt = '3 Good Things daily edition';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpenGraphImage({ params }) {
  const { date } = await params;
  const edition = archive.editions.find((item) => item.editionDate === date) || archive.editions[0];
  const colors = ['#275d70', '#137a75', '#b06b24'];
  const formattedDate = new Intl.DateTimeFormat('en', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
  }).format(new Date(`${edition.editionDate}T12:00:00Z`));

  return new ImageResponse(
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between', padding: '60px 64px', background: '#f8f7f3',
      color: '#0b0c0f', fontFamily: 'serif'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', fontSize: 36, letterSpacing: '-1px' }}>3 Good Things</div>
        <div style={{ display: 'flex', fontFamily: 'sans-serif', fontSize: 18, letterSpacing: '3px' }}>{formattedDate.toUpperCase()}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', fontSize: 72, lineHeight: .95, letterSpacing: '-4px', maxWidth: 980 }}>
          Three things worth knowing.
        </div>
        <div style={{ display: 'flex', marginTop: 26, fontFamily: 'sans-serif', fontSize: 24 }}>
          Verified progress. Clear context. No sugar coating.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 14 }}>
        {edition.stories.map((story, index) => <div key={story.cat} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '33.33%', padding: '20px 22px', background: colors[index], color: '#fff'
        }}>
          <span style={{ display: 'flex', fontFamily: 'sans-serif', fontSize: 17, letterSpacing: '2px' }}>{story.cat}</span>
          <span style={{ display: 'flex', fontFamily: 'sans-serif', fontSize: 26 }}>0{index + 1}</span>
        </div>)}
      </div>
    </div>,
    size
  );
}
