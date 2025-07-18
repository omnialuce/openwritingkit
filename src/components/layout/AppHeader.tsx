// src/components/layout/AppHeader.tsx
'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BookOpenCheck, Settings as SettingsIcon, LogOut, ChevronDown, PlusCircle, FolderKanban } from 'lucide-react';
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
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export function AppHeader() {
  const { t } = useLanguage();
  const { activeStoryId, activeStoryName, stories, setActiveStory } = useStoryContext();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <SidebarTrigger />
      
      <div className="flex-1 flex items-center gap-2 text-sm font-medium">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-1 px-2 -ml-2" disabled={!user}>
              <BookOpenCheck className="h-5 w-5 text-primary" />
              <span className={cn("truncate max-w-xs", activeStoryName ? "text-foreground" : "text-muted-foreground")}>
                {activeStoryName || t('header.select_story')}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64 rounded-none">
            {stories.length === 0 ? (
               <DropdownMenuLabel className="text-muted-foreground text-center py-2">{t('header.no_stories')}</DropdownMenuLabel>
            ) : (
              <>
                <DropdownMenuLabel>{t('header.switch_story')}</DropdownMenuLabel>
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
                <span>{t('header.create_story')}</span>
              </DropdownMenuItem>
            </Link>
            <Link href="/stories" passHref>
              <DropdownMenuItem>
                <FolderKanban className="mr-2 h-4 w-4" />
                <span>{t('header.manage_stories')}</span>
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="ml-auto flex items-center gap-4">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.photoURL || "user-profile.png"} alt="User Avatar" data-ai-hint="user avatar" />
                  <AvatarFallback>{user.email?.[0].toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 rounded-none" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{t('header.signed_in')}</p>
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/settings" passHref>
                <DropdownMenuItem>
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  <span>{t('common.settings')}</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t('common.logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
