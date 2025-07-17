
'use client';

import type { ReactNode } from 'react';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface MainLayoutProps {
  children: ReactNode;
}


export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();

  if (pathname === '/login') {
    return (
       <>
        {children}
        <Toaster />
       </>
    )
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-background">
          {children}
        </main>
        <footer className="p-4 text-center text-sm text-muted-foreground border-t">
          OpenWritingKit &copy; {new Date().getFullYear()} - A <a href="https://omnialuce.tech" target="_blank" rel="noopener noreferrer" className="hover:text-primary">OmniaLuce.Tech</a> project.
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
