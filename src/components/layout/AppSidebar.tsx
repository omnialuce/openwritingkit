
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
} from '@/components/ui/sidebar';
import { mainNavItems, secondaryNavItems, type NavItem } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Coffee, DatabaseZap, Cloud } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AppSidebar() {
  const pathname = usePathname();

  const [isDriveConnected, setIsDriveConnected] = React.useState(false);
  const [driveStorageInfo, setDriveStorageInfo] = React.useState({ used: '0 MB', total: 'Not Connected' });

  const handleConnectDriveClick = () => {
    alert("Connecting to Google Drive requires server-side authentication (OAuth 2.0) and Google Drive API integration. This functionality needs to be implemented separately. This is a UI placeholder.");
    // To simulate connection for UI testing (uncomment to test UI):
    // setIsDriveConnected(true);
    // setDriveStorageInfo({ used: '1.5 GB', total: '15 GB' });
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
          tooltip={{ children: item.label, side: 'right', align: 'center' }}
          className={cn(item.disabled && "cursor-not-allowed opacity-50", "rounded-none group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0")}
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
        
        <div className="p-2 mt-2"> {/* Added mt-2 for spacing */}
          <div className="group-data-[collapsible=icon]:hidden">
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild className="w-full">
                  {isDriveConnected ? (
                    <Card className="cursor-default shadow-none border rounded-none">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1.5">
                        <CardTitle className="text-sm font-medium">Google Drive</CardTitle>
                        <Cloud className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <div className="text-xs text-muted-foreground">
                          {driveStorageInfo.used} / {driveStorageInfo.total}
                        </div>
                        <Button variant="link" size="sm" className="p-0 h-auto text-xs mt-1 text-primary hover:text-primary/80" onClick={handleDisconnectDriveClick}>
                          Disconnect
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <Button variant="outline" className="w-full justify-start rounded-none" onClick={handleConnectDriveClick}>
                      <DatabaseZap className="mr-2 h-4 w-4" />
                      Connect to Drive
                    </Button>
                  )}
                </TooltipTrigger>
                <TooltipContent side="right" align="start" className="max-w-xs z-50">
                  <p className="font-semibold mb-1">Cloud Storage</p>
                  <p>
                    Connect to Google Drive to back up your stories, outlines, and characters,
                    and access them across your devices.
                  </p>
                  <p className="mt-2 text-destructive-foreground bg-destructive p-2 rounded-md text-xs">
                    <strong>Important:</strong> Without connecting, all your data is saved locally in this browser only.
                    This means it can be lost if you clear your browser's data, use a different browser, or switch devices.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="hidden group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={isDriveConnected ? () => { /* Placeholder for potential drive settings popup */ } : handleConnectDriveClick}
                    className="h-9 w-9 p-0 rounded-md"
                  >
                    {isDriveConnected ? <Cloud className="h-5 w-5" /> : <DatabaseZap className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" align="center" className="max-w-xs z-50">
                   <p className="font-semibold mb-1">Cloud Storage</p>
                   <p>
                    {isDriveConnected ? 
                      `Connected to Google Drive. Storage: ${driveStorageInfo.used} / ${driveStorageInfo.total}` : 
                      "Connect to Google Drive for cloud backup and cross-device access." }
                  </p>
                   {!isDriveConnected && (
                    <p className="mt-2 text-destructive-foreground bg-destructive p-2 rounded-md text-xs">
                      <strong>Important:</strong> Data is currently local to this browser.
                    </p>
                   )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      
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
