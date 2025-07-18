import type { LucideIcon } from 'lucide-react';
import { Home, BookText, Cpu, BarChart3, FolderOpen, Settings, ListTree, Users, Network, BookOpenCheck, Bookmark, MessageSquare } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  disabled?: boolean;
}

export const getMainNavItems = (t: (key: string) => string): NavItem[] => [
  { href: '/', label: t('nav.dashboard'), icon: Home },
  { href: '/stories', label: t('nav.stories'), icon: BookOpenCheck },
  { href: '/editor', label: t('nav.editor'), icon: BookText },
  { href: '/documents', label: t('nav.documents'), icon: FolderOpen },
  { href: '/outline', label: t('nav.outline'), icon: ListTree },
  { href: '/characters', label: t('nav.characters'), icon: Users },
  { href: '/plot-tools', label: t('nav.plot_tools'), icon: Network },
  { href: '/ai-tools', label: t('nav.ai_tools'), icon: Cpu },
  { href: '/analytics', label: t('nav.analytics'), icon: BarChart3 },
  { href: '/resources', label: t('nav.resources'), icon: Bookmark },
];

export const getSecondaryNavItems = (t: (key: string) => string): NavItem[] => [
  { href: '/feedback', label: t('nav.feedback'), icon: MessageSquare },
  { href: '/settings', label: t('nav.settings'), icon: Settings },
];
