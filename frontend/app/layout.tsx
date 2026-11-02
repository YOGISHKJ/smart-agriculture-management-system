import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AgriPulse - Modern Agriculture & Farm Management System',
  description: 'Precision farm management platform tracking fields, crop cycles, water irrigation logs, and fertilizer applications.',
  keywords: ['agriculture', 'farm management', 'crop tracking', 'irrigation management', 'fertilizer optimizer']
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased font-sans text-slate-800 bg-[#f8faf7] min-h-screen">
        {children}
      </body>
    </html>
  );
}
