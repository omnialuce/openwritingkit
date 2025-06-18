
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
import { Coffee } from 'lucide-react'; // Added Coffee icon

export function AppSidebar() {
  const pathname = usePathname();

  const renderNavItem = (item: NavItem) => (
     <SidebarMenuItem key={item.href}>
        <SidebarMenuButton
          asChild
          isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
          disabled={item.disabled}
          aria-disabled={item.disabled}
          tooltip={{ children: item.label, side: 'right', align: 'center' }}
          className={cn(item.disabled && "cursor-not-allowed opacity-50", "rounded-none")}
        >
          <Link href={item.href}>
            <item.icon />
            <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
  );


  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left" className="border-r">
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <span className="font-headline text-xl font-semibold text-primary group-data-[collapsible=icon]:hidden">
            OpenWritingKit
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
            <Button variant="outline" className="w-full rounded-none" asChild>
              <Link href="https://www.buymeacoffee.com/yourusername" target="_blank" rel="noopener noreferrer">
                <Coffee className="mr-2 h-4 w-4" />
                Buy Me a Coffee
              </Link>
            </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
