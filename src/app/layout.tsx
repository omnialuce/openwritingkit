
import type { Metadata } from 'next';
import './globals.css';
import { MainLayout } from '@/components/layout/MainLayout';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'OpenWriting Kit - Your Creative Writing Companion',
  description: 'Enhance your writing with OpenWriting Kit\'s AI-powered tools and focus-enhancing features.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("font-body antialiased min-h-screen bg-background flex flex-col")}>
        <MainLayout>
          {children}
        </MainLayout>
      </body>
    </html>
  );
}
