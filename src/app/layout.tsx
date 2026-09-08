import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnalyticsTracker from '@/components/AnalyticsTracker';

const inter = Inter({ subsets: ['latin'] });

const websiteStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Isaac Maiywa',
  alternateName: 'Maiywa 4 Turbo 2027',
  url: 'https://www.maiywa.site/',
};

export const metadata: Metadata = {
  title: 'Isaac Maiywa | The Voice of Turbo',
  applicationName: 'Isaac Maiywa',
  description: 'Isaac Maiywa, the Voice of Turbo: a campaign for accountable representation, development, and opportunity across Turbo Constituency.',
  openGraph: {
    type: 'website',
    url: 'https://www.maiywa.site/',
    siteName: 'Isaac Maiywa',
    title: 'Isaac Maiywa | The Voice of Turbo',
    description: 'A campaign for accountable representation, development, and opportunity across Turbo Constituency.',
  },
  icons: {
    icon: [{ url: '/logo.png', type: 'image/png' }],
    apple: [{ url: '/logo.png', type: 'image/png' }],
  },
};

// Ensures the site renders at device width on phones/tablets instead of a zoomed-out
// desktop layout. Allows pinch-zoom for accessibility.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#F5C100',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData) }}
        />
      </head>
      <body className={inter.className}>
        <Navbar />
        <AnalyticsTracker />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
