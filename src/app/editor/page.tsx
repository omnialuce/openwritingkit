// src/app/(app)/editor/page.tsx
import { WritingArea } from '@/components/editor/WritingArea';

export default function EditorPage() {
  return (
    <div className="h-[calc(100vh-10rem)] md:h-[calc(100vh-11rem)]"> {/* Adjust height based on header/footer */}
      <WritingArea />
    </div>
  );
}
