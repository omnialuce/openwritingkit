
'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, BookOpenCheck } from 'lucide-react'; // Using BookOpenCheck for story
import { useStoryContext } from '@/contexts/StoryContext';
import Link from 'next/link';

export function AppHeader() {
  const { activeStoryName } = useStoryContext();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <SidebarTrigger /> {/* Removed md:hidden */}
      
      <div className="flex-1 flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <BookOpenCheck className="h-5 w-5 text-primary" />
        {activeStoryName ? (
          <span className="text-foreground">{activeStoryName}</span>
        ) : (
          <Link href="/stories" className="hover:text-primary">
            No Story Selected. Go to Stories?
          </Link>
        )}
      </div>

      <div className="ml-auto flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Toggle notifications</span>
        </Button>
        <Avatar className="h-9 w-9">
          <AvatarImage src="https://placehold.co/40x40.png" alt="User Avatar" data-ai-hint="user avatar" />
          <AvatarFallback>LF</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
