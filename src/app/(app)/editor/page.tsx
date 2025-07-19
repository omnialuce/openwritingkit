// src/app/(app)/editor/page.tsx
import { WritingArea } from '@/components/editor/WritingArea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function EditorPage() {
  return (
    <div className="h-[calc(100vh-10rem)] md:h-[calc(100vh-11rem)]"> {/* Adjust height based on header/footer */}
      <WritingArea />
    </div>
  );
}
