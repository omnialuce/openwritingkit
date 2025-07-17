
// src/app/(public)/layout.tsx
'use client';

import type { ReactNode } from 'react';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
];

function PublicHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="OpenWritingKit Logo" width={32} height={32} className="rounded-md" />
          <span className="font-headline text-xl font-semibold text-primary">OpenWritingKit</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
           {navLinks.map(link => (
             <Link key={link.href} href={link.href} className="text-muted-foreground transition-colors hover:text-foreground">{link.label}</Link>
           ))}
        </nav>
        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Log In</Link>
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
           <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
                <div className="flex flex-col gap-4 py-6">
                    <Link href="/" className="flex items-center gap-2 mb-4">
                        <Image src="/logo.png" alt="OpenWritingKit Logo" width={24} height={24} className="rounded-md" />
                        <span className="font-headline font-semibold text-primary">OpenWritingKit</span>
                    </Link>
                    {navLinks.map(link => (
                        <Link 
                            key={link.href} 
                            href={link.href} 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                        >
                            {link.label}
                        </Link>
                    ))}
                     <div className="border-t pt-4 mt-4">
                        <Button asChild className="w-full">
                            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>Log In</Link>
                        </Button>
                    </div>
                </div>
            </SheetContent>
          </Sheet>
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
