// src/app/(public)/layout.tsx
import type { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="OpenWritingKit Logo" width={32} height={32} className="rounded-md" />
          <span className="font-headline text-xl font-semibold text-primary">OpenWritingKit</span>
        </Link>
        <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
           <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">Home</Link>
           <Link href="/about" className="text-muted-foreground transition-colors hover:text-foreground">About</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Log In</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function PublicFooter() {
  return (
      <footer className="border-t">
        <div className="container py-6 text-center text-sm text-muted-foreground">
          OpenWritingKit &copy; {new Date().getFullYear()}
        </div>
      </footer>
  );
}

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1">
        <div className="container py-6 md:py-12">
            {children}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
