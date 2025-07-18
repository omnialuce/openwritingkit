'use client';

import React from 'react';
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
  useSidebar, 
} from '@/components/ui/sidebar';
import { getMainNavItems, getSecondaryNavItems, type NavItem } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Coffee, CloudOff } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export function AppSidebar() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const { open: isDesktopSidebarExpanded, isMobile } = useSidebar(); 
  const { user } = useAuth();
  
  const mainNavItems = getMainNavItems(t);
  const secondaryNavItems = getSecondaryNavItems(t);

  const renderNavItem = (item: NavItem) => (
     <SidebarMenuItem key={item.href}>
        <SidebarMenuButton
          asChild
          isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
          disabled={item.disabled}
          aria-disabled={item.disabled}
          tooltip={{ 
            children: item.label, 
            side: 'right', 
            align: 'center',
            hidden: isDesktopSidebarExpanded && !isMobile 
          }}
          className={cn(item.disabled && "cursor-not-allowed opacity-50", "rounded-none")}
        >
          <Link href={item.href}>
            <item.icon />
            <span className={cn("group-data-[state=collapsed]/sidebar:group-data-[collapsible=icon]/sidebar:hidden")}>{item.label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
  );


  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left" className="border-r">
      <SidebarHeader className="p-4">
        <Link href="/" className={cn(
            "flex items-center gap-2",
            "group-data-[state=collapsed]/sidebar:group-data-[collapsible=icon]/sidebar:justify-center" 
          )}>
          <Image src="/logo.png" alt="OpenWritingKit Logo" width={32} height={32} className="rounded-md" />
          <span className={cn(
              "font-headline text-xl font-semibold text-primary",
              "group-data-[state=collapsed]/sidebar:group-data-[collapsible=icon]/sidebar:hidden" 
            )}>
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
      <SidebarFooter className="p-2 mt-auto">
        <SidebarMenu>
          {secondaryNavItems.map(renderNavItem)}
        
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={{
                  children: <>
                    <p className="font-semibold mb-1">{t('sidebar.backup.tooltip_title')}</p>
                    <p>{t('sidebar.backup.tooltip_desc')}</p>
                  </>,
                  side: 'right',
                  align: 'center',
                  hidden: isDesktopSidebarExpanded && !isMobile
              }}
              className="w-full rounded-none"
              asChild
            >
              <Link href="/settings">
                <CloudOff />
                <span className="group-data-[state=collapsed]/sidebar:group-data-[collapsible=icon]/sidebar:hidden">
                  {t('sidebar.backup.button')}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              className="w-full rounded-none"
              tooltip={{ children: t('sidebar.coffee_button'), side: 'right', align: 'center', hidden: isDesktopSidebarExpanded && !isMobile }}
            >
              <Link href="https://ko-fi.com/expectaylor" target="_blank" rel="noopener noreferrer">
                <Coffee />
                <span className="group-data-[state=collapsed]/sidebar:group-data-[collapsible=icon]/sidebar:hidden">{t('sidebar.coffee_button')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
