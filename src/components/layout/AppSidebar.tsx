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
import { Coffee, DatabaseZap, Cloud } from 'lucide-react';
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

  const [isDriveConnected, setIsDriveConnected] = React.useState(false);
  const [driveStorageInfo, setDriveStorageInfo] = React.useState({ used: '0 MB', total: t('sidebar.drive.not_connected') });

  const handleConnectDriveClick = () => {
    alert(t('sidebar.drive.connect_alert'));
  };

  const handleDisconnectDriveClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    setIsDriveConnected(false);
    setDriveStorageInfo({ used: '0 MB', total: t('sidebar.drive.not_connected') });
    alert(t('sidebar.drive.disconnect_alert'));
  };

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
      <SidebarFooter className="p-2">
        <SidebarMenu>
          {secondaryNavItems.map(renderNavItem)}
        
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={isDriveConnected ? () => alert(t('sidebar.drive.settings_alert')) : handleConnectDriveClick}
              tooltip={{
                  children: <>
                    <p className="font-semibold mb-1">{isDriveConnected ? t('sidebar.drive.tooltip_connected_title') : t('sidebar.drive.tooltip_disconnected_title')}</p>
                    {isDriveConnected ? (
                      <p>{t('sidebar.drive.tooltip_storage')}: {driveStorageInfo.used} / {driveStorageInfo.total}</p>
                    ) : (
                      <>
                      <p>{t('sidebar.drive.tooltip_disconnected_desc_1')}</p>
                      <p className="mt-2 text-destructive-foreground bg-destructive p-2 rounded-md text-xs">
                        <strong>{t('sidebar.drive.tooltip_disconnected_important')}:</strong> {t('sidebar.drive.tooltip_disconnected_desc_2')}
                      </p>
                      </>
                    )}
                  </>,
                  side: 'right',
                  align: 'center',
                  hidden: isDesktopSidebarExpanded && !isMobile
              }}
              className="w-full rounded-none"
            >
              {isDriveConnected ? <Cloud /> : <DatabaseZap />}
              <span className="group-data-[state=collapsed]/sidebar:group-data-[collapsible=icon]/sidebar:hidden">
                {isDriveConnected ? `${t('sidebar.drive.drive_prefix')}: ${driveStorageInfo.used}` : t('sidebar.drive.connect_button')}
                {isDriveConnected && (
                  <Button variant="link" size="sm" className="p-0 h-auto text-xs ml-auto text-primary hover:text-primary/80 group-data-[state=collapsed]/sidebar:group-data-[collapsible=icon]/sidebar:hidden" onClick={handleDisconnectDriveClick}>
                    {t('sidebar.drive.disconnect_button')}
                  </Button>
                )}
              </span>
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
