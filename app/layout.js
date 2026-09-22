import './globals.css';
import edition from '../content/edition.json';

const siteUrl = 'https://3goodthings.news';
const title = '3 Good Things — Real progress, every morning';
const description = 'Three positive, fact-based stories. Verified, sourced and explained in under two minutes.';
const defaultImage = `/api/og?date=${encodeURIComponent(edition.editionDate)}&story=1`;

export const metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  alternates: { canonical: '/' },
  openGraph: {
    title,
    description,
    url: '/',
    siteName: '3 Good Things',
    type: 'website',
    images: [{ url: defaultImage, width: 1200, height: 630, alt: '3 Good Things' }]
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [defaultImage]
  }
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
