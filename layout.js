import './globals.css';

export const metadata = {
  title: '3 Good Things — Real progress, every morning',
  description: 'Three positive, fact-based stories. Verified, sourced and explained in under two minutes.'
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
