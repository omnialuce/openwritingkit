import type { LucideIcon } from 'lucide-react';
import { Home, BookText, Cpu, BarChart3, FolderOpen, Settings, ListTree, NotebookPen } from 'lucide-react'; // Added ListTree

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  disabled?: boolean;
}

export const mainNavItems: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/editor', label: 'Editor', icon: BookText },
  { href: '/documents', label: 'Documents', icon: FolderOpen },
  { href: '/outline', label: 'Outline Builder', icon: ListTree }, // Added Outline Builder
  { href: '/ai-tools', label: 'AI Tools', icon: Cpu },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export const secondaryNavItems: NavItem[] = [
  { href: '/settings', label: 'Settings', icon: Settings, disabled: true },
];
