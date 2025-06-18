'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TypeSquare } from 'lucide-react'; // Changed Icon
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { mainNavItems, secondaryNavItems, type NavItem } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function AppSidebar() {
  const pathname = usePathname();

  const renderNavItem = (item: NavItem) => (
    <SidebarMenuItem key={item.href}>
      <Link href={item.href} passHref legacyBehavior>
        <SidebarMenuButton
          asChild
          isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
          disabled={item.disabled}
          aria-disabled={item.disabled}
          tooltip={{ children: item.label, side: 'right', align: 'center' }}
          className={cn(item.disabled && "cursor-not-allowed opacity-50", "rounded-none")}
        >
          <a>
            <item.icon />
            <span>{item.label}</span>
          </a>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  );

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left" className="border-r">
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          {/* Simple geometric shape or letter for Bauhaus style */}
          <TypeSquare className="h-8 w-8 text-primary group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6" />
          <span className="font-headline text-xl font-semibold text-primary group-data-[collapsible=icon]:hidden">
            LinguaFlow
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex-1 p-2">
        <SidebarMenu>
          {mainNavItems.map(renderNavItem)}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter className="p-2">
        <SidebarMenu>
          {secondaryNavItems.map(renderNavItem)}
        </SidebarMenu>
        <div className="mt-auto p-2 group-data-[collapsible=icon]:hidden">
            <Button variant="outline" className="w-full rounded-none">
                Upgrade to Pro
            </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
