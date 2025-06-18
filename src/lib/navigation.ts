
import type { LucideIcon } from 'lucide-react';
import { Home, BookText, Cpu, BarChart3, FolderOpen, Settings, ListTree, Users, Network, BookOpenCheck } from 'lucide-react'; // Added BookOpenCheck

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  disabled?: boolean;
}

export const mainNavItems: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/stories', label: 'Stories', icon: BookOpenCheck }, // Added Stories
  { href: '/editor', label: 'Editor', icon: BookText },
  { href: '/documents', label: 'Documents', icon: FolderOpen },
  { href: '/outline', label: 'Outline Builder', icon: ListTree },
  { href: '/characters', label: 'Characters', icon: Users },
  { href: '/plot-tools', label: 'Plot Tools', icon: Network },
  { href: '/ai-tools', label: 'AI Tools', icon: Cpu },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export const secondaryNavItems: NavItem[] = [
  { href: '/settings', label: 'Settings', icon: Settings },
];

