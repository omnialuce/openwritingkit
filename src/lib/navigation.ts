
import type { LucideIcon } from 'lucide-react';
import { Home, BookText, Cpu, BarChart3, FolderOpen, Settings, ListTree, Users, Network, BookOpenCheck, Bookmark, MessageSquare } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string; // This will now be a key for translation, e.g., 'nav_dashboard'
  icon: LucideIcon;
  disabled?: boolean;
}

export const mainNavItems: NavItem[] = [
  { href: '/', label: 'nav_dashboard', icon: Home },
  { href: '/stories', label: 'nav_stories', icon: BookOpenCheck },
  { href: '/editor', label: 'nav_editor', icon: BookText },
  { href: '/documents', label: 'nav_documents', icon: FolderOpen },
  { href: '/outline', label: 'nav_outline', icon: ListTree },
  { href: '/characters', label: 'nav_characters', icon: Users },
  { href: '/plot-tools', label: 'nav_plot_tools', icon: Network },
  { href: '/ai-tools', label: 'nav_ai_tools', icon: Cpu },
  { href: '/analytics', label: 'nav_analytics', icon: BarChart3 },
  { href: '/resources', label: 'nav_resources', icon: Bookmark },
];

export const secondaryNavItems: NavItem[] = [
  { href: '/feedback', label: 'nav_feedback', icon: MessageSquare },
  { href: '/settings', label: 'nav_settings', icon: Settings },
];
