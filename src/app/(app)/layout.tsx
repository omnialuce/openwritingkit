import type { ReactNode } from 'react';

export default function AppLayout({ children }: { children: ReactNode }) {
  // This layout component is a pass-through.
  // The main structure is handled by the root layout and MainLayout component.
  return <>{children}</>;
}
