
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
  useSidebar, // Import useSidebar to access state if needed for tooltip logic
} from '@/components/ui/sidebar';
import { mainNavItems, secondaryNavItems, type NavItem } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Coffee, DatabaseZap, Cloud } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider, // TooltipProvider is already in SidebarProvider
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AppSidebar() {
  const pathname = usePathname();
  const { state: sidebarState, isMobile } = useSidebar(); // Get sidebar state and mobile status

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
          tooltip={{ 
            children: item.label, 
            side: 'right', 
            align: 'center',
            // hidden: sidebarState === 'expanded' && !isMobile // Hide tooltip if expanded on desktop
          }}
          className={cn(item.disabled && "cursor-not-allowed opacity-50", "rounded-none")}
        >
          <Link href={item.href}>
            <item.icon />
            {/* Apply specific group selector for hiding text */}
            <span className="group-data-[state=collapsed]/sidebar:group-data-[collapsible=icon]/sidebar:hidden">{item.label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
  );


  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left" className="border-r">
      <SidebarHeader className="p-4">
        <Link href="/" className={cn(
            "flex items-center gap-2",
            "group-data-[state=collapsed]/sidebar:group-data-[collapsible=icon]/sidebar:justify-center" // Center logo when collapsed
          )}>
           {/* You can add a smaller icon-only logo here for collapsed state if desired */}
          <span className={cn(
              "font-headline text-xl font-semibold text-primary",
              "group-data-[state=collapsed]/sidebar:group-data-[collapsible=icon]/sidebar:hidden" // Hide text when collapsed
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
        
        <SidebarMenu className="mt-2">
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
                        <p>
                          Connect to Google Drive to back up your stories, outlines, and characters,
                          and access them across your devices.
                        </p>
                        <p className="mt-2 text-destructive-foreground bg-destructive p-2 rounded-md text-xs">
                          <strong>Important:</strong> Without connecting, all your data is saved locally in this browser only.
                          This means it can be lost if you clear your browser's data, use a different browser, or switch devices.
                        </p>
                        </>
                      )}
                    </>,
                    side: 'right',
                    align: 'center',
                    // hidden: sidebarState === 'expanded' && !isMobile // Hide tooltip if expanded on desktop
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
        </SidebarMenu>
      
        <SidebarMenu className="mt-auto">
           <SidebarMenuItem>
             <SidebarMenuButton 
                asChild 
                className="w-full rounded-none"
                tooltip={{ children: "Support the Developer", side: 'right', align: 'center' /*, hidden: sidebarState === 'expanded' && !isMobile */}}
             >
               <Link href="https://www.buymeacoffee.com/yourusername" target="_blank" rel="noopener noreferrer">
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
