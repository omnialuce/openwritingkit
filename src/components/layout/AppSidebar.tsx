
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
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

export function AppSidebar() {
  const pathname = usePathname();
  const { open: isDesktopSidebarExpanded, isMobile } = useSidebar(); 
  const { user } = useAuth();

  const [isDriveConnected, setIsDriveConnected] = React.useState(false);
  const [driveStorageInfo, setDriveStorageInfo] = React.useState({ used: '0 MB', total: 'Not Connected' });

  const handleConnectDriveClick = () => {
    // This will be replaced with actual OAuth flow later
    alert("Connecting to Google Drive (placeholder).");
  };

  const handleDisconnectDriveClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    // This would involve clearing cookies/session on the backend.
    // For now, it's a UI simulation.
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
              onClick={isDriveConnected ? () => alert("Open Google Drive settings (placeholder).") : handleConnectDriveClick}
              tooltip={{
                  children: <>
                    <p className="font-semibold mb-1">{isDriveConnected ? "Cloud Storage Connected" : "Cloud Storage"}</p>
                    {isDriveConnected ? (
                      <p>Storage: {driveStorageInfo.used} / {driveStorageInfo.total}</p>
                    ) : (
                      <>
                      <p>Connect to Google Drive to back up your stories, outlines, and characters, and access them across your devices.</p>
                      <p className="mt-2 text-destructive-foreground bg-destructive p-2 rounded-md text-xs">
                        <strong>Important:</strong> Without connecting, all your data is saved locally in this browser only. This means it can be lost if you clear your browser's data, use a different browser, or switch devices.
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
                {isDriveConnected ? `Drive: ${driveStorageInfo.used}` : "Connect to Drive"}
                {isDriveConnected && (
                  <Button variant="link" size="sm" className="p-0 h-auto text-xs ml-auto text-primary hover:text-primary/80 group-data-[state=collapsed]/sidebar:group-data-[collapsible=icon]/sidebar:hidden" onClick={handleDisconnectDriveClick}>
                    Disconnect
                  </Button>
                )}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              className="w-full rounded-none"
              tooltip={{ children: "Buy Me a Coffee", side: 'right', align: 'center', hidden: isDesktopSidebarExpanded && !isMobile }}
            >
              <Link href="https://ko-fi.com/expectaylor" target="_blank" rel="noopener noreferrer">
                <Coffee />
                <span className="group-data-[state=collapsed]/sidebar:group-data-[collapsible=icon]/sidebar:hidden">Buy Me a Coffee</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
