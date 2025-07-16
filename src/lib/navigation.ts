
import type { LucideIcon } from 'lucide-react';
import { Home, BookText, Cpu, BarChart3, FolderOpen, Settings, ListTree, Users, Network, BookOpenCheck, Bookmark, MessageSquare } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  disabled?: boolean;
}

export const mainNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/stories', label: 'Stories', icon: BookOpenCheck },
  { href: '/editor', label: 'Editor', icon: BookText },
  { href: '/documents', label: 'Documents', icon: FolderOpen },
  { href: '/outline', label: 'Outline Builder', icon: ListTree },
  { href: '/characters', label: 'Characters', icon: Users },
  { href: '/plot-tools', label: 'Plot Tools', icon: Network },
  { href: '/ai-tools', label: 'AI Tools', icon: Cpu },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/resources', label: 'Resources', icon: Bookmark },
];

export const secondaryNavItems: NavItem[] = [
  { href: '/feedback', label: 'Feedback', icon: MessageSquare },
  { href: '/settings', label: 'Settings', icon: Settings },
];
