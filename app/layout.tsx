import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AgriPulse | Agriculture Resource & Farm Management System',
  description: 'DBMS Level 3 Experiential Learning Project featuring Dual-Database Architecture with PostgreSQL Relational ACID transactions and MongoDB Polymorphic Document Collections.',
  keywords: ['Agriculture Management', 'DBMS Project', 'PostgreSQL', 'MongoDB', 'Next.js', 'Farm Analytics', 'Crop Cycle Management'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="h-full flex flex-col selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
