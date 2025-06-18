
'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BookOpenCheck, Settings as SettingsIcon, User, LogOut, ChevronDown, PlusCircle, FolderKanban } from 'lucide-react';
import { useStoryContext } from '@/contexts/StoryContext';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function AppHeader() {
  const { activeStoryId, activeStoryName, stories, setActiveStory } = useStoryContext();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <SidebarTrigger />
      
      <div className="flex-1 flex items-center gap-2 text-sm font-medium">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-1 px-2 -ml-2">
              <BookOpenCheck className="h-5 w-5 text-primary" />
              <span className={cn("truncate max-w-xs", activeStoryName ? "text-foreground" : "text-muted-foreground")}>
                {activeStoryName || "Select a Story"}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64 rounded-none">
            {stories.length === 0 ? (
               <DropdownMenuLabel className="text-muted-foreground text-center py-2">No stories yet.</DropdownMenuLabel>
            ) : (
              <>
                <DropdownMenuLabel>Switch Story</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={activeStoryId || ""} onValueChange={setActiveStory}>
                  {stories.map((story) => (
                    <DropdownMenuRadioItem key={story.id} value={story.id} className="truncate">
                      {story.title}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </>
            )}
            <DropdownMenuSeparator />
            <Link href="/stories" passHref>
              <DropdownMenuItem>
                <PlusCircle className="mr-2 h-4 w-4" />
                <span>Create New Story</span>
              </DropdownMenuItem>
            </Link>
            <Link href="/stories" passHref>
              <DropdownMenuItem>
                <FolderKanban className="mr-2 h-4 w-4" />
                <span>Manage Stories</span>
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src="https://placehold.co/40x40.png" alt="User Avatar" data-ai-hint="user avatar" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 rounded-none" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">User Name</p>
                <p className="text-xs leading-none text-muted-foreground">
                  user@example.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <Link href="/settings" passHref>
              <DropdownMenuItem>
                <SettingsIcon className="mr-2 h-4 w-4" />
                <span>Account Settings</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
