
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
import { mainNavItems, secondaryNavItems, type NavItem } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Coffee, DatabaseZap, Cloud } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';

export function AppSidebar() {
  const pathname = usePathname();
  const { t } = useLocale();
  const { state: sidebarState, isMobile, open: isDesktopSidebarExpanded } = useSidebar(); 

  const [isDriveConnected, setIsDriveConnected] = React.useState(false);
  const [driveStorageInfo, setDriveStorageInfo] = React.useState({ used: '0 MB', total: 'Not Connected' });

  const handleConnectDriveClick = () => {
    alert("Connecting to Google Drive requires server-side authentication (OAuth 2.0) and Google Drive API integration. This functionality needs to be implemented separately. This is a UI placeholder.");
  };

  const handleDisconnectDriveClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    setIsDriveConnected(false);
    setDriveStorageInfo({ used: '0 MB', total: 'Not Connected' });
    alert("Disconnected from Google Drive (UI simulation).");
  };

  const renderNavItem = (item: NavItem) => (
     <SidebarMenuItem key={item.href}>
        <SidebarMenuButton
          asChild
          isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
          disabled={item.disabled}
          aria-disabled={item.disabled}
          tooltip={{ 
            children: t(item.label), 
            side: 'right', 
            align: 'center',
            hidden: isDesktopSidebarExpanded && !isMobile 
          }}
          className={cn(item.disabled && "cursor-not-allowed opacity-50", "rounded-none")}
        >
          <Link href={item.href}>
            <item.icon />
            <span className={cn("group-data-[state=collapsed]/sidebar:group-data-[collapsible=icon]/sidebar:hidden")}>{t(item.label)}</span>
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
        </SidebarMenu>
        
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={isDriveConnected ? () => alert("Open Google Drive settings (placeholder).") : handleConnectDriveClick}
            tooltip={{
                children: <>
                  <p className="font-semibold mb-1">{isDriveConnected ? t('cloud_storage_connected') : t('cloud_storage')}</p>
                  {isDriveConnected ? (
                    <p>{t('storage_usage', { used: driveStorageInfo.used, total: driveStorageInfo.total })}</p>
                  ) : (
                    <>
                    <p>{t('cloud_storage_connect_tooltip')}</p>
                    <p className="mt-2 text-destructive-foreground bg-destructive p-2 rounded-md text-xs">
                      <strong>{t('important_note')}:</strong> {t('cloud_storage_local_warning')}
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
              {isDriveConnected ? `${t('drive_label')}: ${driveStorageInfo.used}` : t('connect_to_drive')}
              {isDriveConnected && (
                <Button variant="link" size="sm" className="p-0 h-auto text-xs ml-auto text-primary hover:text-primary/80 group-data-[state=collapsed]/sidebar:group-data-[collapsible=icon]/sidebar:hidden" onClick={handleDisconnectDriveClick}>
                  {t('disconnect_button')}
                </Button>
              )}
            </span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      
        <SidebarMenuItem>
          <SidebarMenuButton 
            asChild 
            className="w-full rounded-none"
            tooltip={{ children: t('buy_me_a_coffee'), side: 'right', align: 'center', hidden: isDesktopSidebarExpanded && !isMobile }}
          >
            <Link href="https://www.buymeacoffee.com/yourusername" target="_blank" rel="noopener noreferrer">
              <Coffee />
              <span className="group-data-[state=collapsed]/sidebar:group-data-[collapsible=icon]/sidebar:hidden">{t('buy_me_a_coffee')}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  );
}
