
// src/app/documents/page.tsx
'use client';

import React, { useState, useRef } from 'react'; // Added useRef
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderPlus, FilePlus2, Search, Folder as FolderIcon, FileText as FileTextIcon, BookCopy } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type DocumentStatus = "Draft" | "Revised" | "Complete";
type DocumentTag = "Draft" | "WIP" | "Review" | "Published" | "Idea" | "Research" | "Key Scene" | "Needs Work" | "Outline" | "Character";


interface DocumentItem {
  id: string;
  name: string;
  type: "folder" | "chapter" | "scene" | "file";
  lastModified?: string;
  words?: number;
  itemCount?: number;
  status?: DocumentStatus;
  tags?: DocumentTag[];
  children?: DocumentItem[];
}

const initialMockDocuments: DocumentItem[] = [
  {
    id: "folder1",
    name: "My Epic Novel",
    type: "folder",
    itemCount: 2,
    tags: ["WIP"],
    children: [
      {
        id: "chapter1",
        name: "Chapter 1: The Awakening",
        type: "chapter",
        itemCount: 2,
        tags: ["Draft"],
        children: [
          { id: "scene1-1", name: "Scene 1: The Discovery", type: "scene", lastModified: "2 days ago", words: 1200, status: "Revised", tags: ["Key Scene"] },
          { id: "scene1-2", name: "Scene 2: First Contact", type: "scene", lastModified: "1 day ago", words: 1500, status: "Draft", tags: ["Needs Work"] },
        ]
      },
      {
        id: "chapter2",
        name: "Chapter 2: The Journey Begins",
        type: "chapter",
        itemCount: 1,
        tags: ["Outline"],
        children: [
          { id: "scene2-1", name: "Scene 1: Leaving Home", type: "scene", lastModified: "In progress", words: 800, status: "Draft" },
        ]
      }
    ]
  },
  {
    id: "folder2",
    name: "Short Stories",
    type: "folder",
    itemCount: 1,
    tags: ["Idea"],
    children: [
      { id: "short1", name: "The Old Lighthouse", type: "file", lastModified: "5 days ago", words: 800, tags: ["Published"] },
    ]
  },
  { id: "doc1", name: "Character Bio: Anya", type: "file", lastModified: "1 week ago", words: 1500, tags: ["Research", "Character"] },
  {
    id: "folder3",
    name: "Research Notes",
    type: "folder",
    itemCount: 0,
    tags: ["Research"],
    children: []
  },
];

interface DocumentListItemProps {
  item: DocumentItem;
  level?: number;
  onDragStart: (event: React.DragEvent, id: string) => void;
  onDragOver: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent, targetId: string) => void;
}

function DocumentListItem({ item, level = 0, onDragStart, onDragOver, onDrop }: DocumentListItemProps) {
  const [isOpen, setIsOpen] = useState(level < 1);

  const Icon = item.type === "folder" ? FolderIcon :
               item.type === "chapter" ? BookCopy :
               FileTextIcon;

  const handleToggleOpen = () => {
    if (item.children && item.children.length > 0) {
      setIsOpen(!isOpen);
    }
  };

  const getStatusVariant = (status?: DocumentStatus) => {
    switch (status) {
      case "Draft": return "secondary";
      case "Revised": return "outline";
      case "Complete": return "default";
      default: return "secondary";
    }
  };

  const getTagVariant = (tag: DocumentTag): "default" | "secondary" | "destructive" | "outline" => {
     switch (tag) {
      case "Published": return "default";
      case "WIP": return "secondary";
      case "Review": return "outline";
      case "Draft": return "secondary";
      case "Idea": return "outline";
      case "Research": return "secondary";
      default: return "secondary";
    }
  }

  return (
    <>
      <li
        draggable="true"
        onDragStart={(e) => onDragStart(e, item.id)}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, item.id)}
        className="flex flex-col p-3 border-b hover:bg-secondary/50 transition-colors cursor-grab"
        style={{ paddingLeft: `${1 + level * 1.5}rem` }}
      >
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-3 flex-grow min-w-0">
            {item.children && item.children.length > 0 ? (
              <Button variant="ghost" size="sm" onClick={handleToggleOpen} className="p-1 h-auto">
                <Icon className="h-5 w-5 text-primary" />
              </Button>
            ) : (
              <Icon className="h-5 w-5 text-primary ml-1 mr-1" />
            )}
            <div className="truncate">
              <h3 className="font-semibold truncate">{item.name}</h3>
              <p className="text-sm text-muted-foreground">
                {item.type === "folder" || item.type === "chapter" ?
                 `${item.children?.length || 0} item(s)` :
                 `${item.words || 0} words - Last modified: ${item.lastModified || 'N/A'}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-2 shrink-0">
            {item.type === "scene" && item.status && (
              <Badge variant={getStatusVariant(item.status)} className="text-xs">{item.status}</Badge>
            )}
            <Button variant="outline" size="sm">Open</Button>
          </div>
        </div>
        {item.tags && item.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1 pl-8">
            {item.tags.map(tag => (
              <Badge key={tag} variant={getTagVariant(tag as DocumentTag)} className="text-xs">{tag}</Badge>
            ))}
          </div>
        )}
      </li>
      {isOpen && item.children && item.children.map(child => (
        <DocumentListItem
          key={child.id}
          item={child}
          level={level + 1}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
        />
      ))}
    </>
  );
}

// Helper function for drag and drop reordering
const findItemRecursive = (
  nodes: DocumentItem[],
  itemId: string
): { parentList: DocumentItem[]; item: DocumentItem; index: number } | null => {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.id === itemId) {
      return { parentList: nodes, item: node, index: i };
    }
    if (node.children) {
      // Important: we need the parent of the children array if found within children
      const foundInChild = findItemRecursive(node.children, itemId);
      if (foundInChild) {
        return foundInChild; // This returns the item and its direct parentList (which is node.children)
      }
    }
  }
  return null;
};


export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>(initialMockDocuments);
  const draggedItemIdRef = useRef<string | null>(null);

  const handleDragStart = (event: React.DragEvent, id: string) => {
    event.dataTransfer.setData('text/plain', id);
    draggedItemIdRef.current = id;
    event.currentTarget.classList.add('opacity-50'); // Visual feedback
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault(); // Necessary to allow drop
    event.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (event: React.DragEvent, targetItemId: string) => {
    event.preventDefault();
    event.currentTarget.classList.remove('opacity-50'); // Clean up visual feedback
    // Also remove from any other potential drag source (less direct but safer)
    document.querySelectorAll('.opacity-50').forEach(el => el.classList.remove('opacity-50'));


    const sourceItemId = draggedItemIdRef.current;
    if (!sourceItemId || sourceItemId === targetItemId) {
      draggedItemIdRef.current = null;
      return;
    }

    setDocuments(prevDocs => {
      const newDocs = JSON.parse(JSON.stringify(prevDocs)) as DocumentItem[];

      const sourceLocation = findItemRecursive(newDocs, sourceItemId);
      const targetLocation = findItemRecursive(newDocs, targetItemId);

      if (sourceLocation && targetLocation && sourceLocation.parentList === targetLocation.parentList) {
        // Reorder within the same parent list
        const [movedItem] = sourceLocation.parentList.splice(sourceLocation.index, 1);

        // Determine actual target index. If source was before target, target index shifts.
        // No, splice inserts *before* the given index. So targetLocation.index is correct.
        // If source was at index 0, target was at index 2 (originally).
        // After removing source, target is at index 1.
        // We want to insert before original target.
        // If sourceLocation.index < targetLocation.index, then targetLocation.index in the modified array is targetLocation.index -1. But we want to insert at original target's spot.
        // targetLocation.parentList.splice(targetLocation.index, 0, movedItem) should work if targetLocation.index is from original.
        // But targetLocation.index is based on the newDocs where sourceLocation is not yet removed.
        
        let actualTargetIndex = targetLocation.index;
        // If the source item was before the target item in the same list,
        // and we remove the source item first, the target item's index will decrease by 1.
        // However, splice inserts *before* the index, so this might be okay as is.
        // Let's consider: [A, B, C, D]. Drag A (idx 0) to C (idx 2).
        // Remove A: [B, C, D]. movedItem = A.
        // targetLocation.index is still 2 (referring to D in the current state of sourceLocation.parentList if source was removed from IT).
        // This is where it gets tricky. `targetLocation.index` is index in `targetLocation.parentList`.
        
        // The `findItemRecursive` operates on `newDocs` where source is not yet removed.
        // So `sourceLocation.index` and `targetLocation.index` are for the array *before* source removal.
        
        if (sourceLocation.index < targetLocation.index) {
           targetLocation.parentList.splice(targetLocation.index, 0, movedItem);
        } else {
           targetLocation.parentList.splice(targetLocation.index, 0, movedItem);
        }
         // The above logic with index adjustment needs to be precise.
         // A simpler way for splice: remove source, then find new index of target, then insert.
         // Or, if sourceIndex < targetIndex, insert at targetIndex. Else insert at targetIndex.
         // Actually, it's simpler:
         // const [movedItem] = sourceList.splice(sourceIndex, 1);
         // targetList.splice(targetIndex, 0, movedItem);
         // This should place it before the target element.

      } else {
        console.warn("Drag and drop between different levels or into folders is not yet implemented.");
        return prevDocs; // No change if not in same parent or other complex cases
      }
      return newDocs;
    });
    draggedItemIdRef.current = null;
  };
  
  const handleDragEnd = (event: React.DragEvent) => {
    // Clean up visual feedback if drag is cancelled or ends elsewhere
    event.currentTarget.classList.remove('opacity-50');
    document.querySelectorAll('.opacity-50').forEach(el => el.classList.remove('opacity-50'));
    draggedItemIdRef.current = null;
  };


  return (
    <div className="space-y-8" onDragEnd={handleDragEnd}> {/* Added onDragEnd to the container */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Document Management</h1>
          <p className="text-muted-foreground">Organize, create, and manage all your writing projects. Basic drag & drop reordering within the same level is enabled. Full drag & drop and tag editing are planned.</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <FilePlus2 className="mr-2 h-5 w-5" /> Create File/Scene
          </Button>
          <Button variant="outline">
            <FolderPlus className="mr-2 h-5 w-5" /> Create Folder
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <CardTitle>Your Files & Folders</CardTitle>
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-8" />
            </div>
          </div>
          <CardDescription>
            Browse and manage your work. Click on folders or chapters to expand/collapse. Drag items to reorder them within their current list.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length > 0 ? (
            <ul className="space-y-0 border-t">
              {documents.map((doc) => (
                <DocumentListItem
                  key={doc.id}
                  item={doc}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                />
              ))}
            </ul>
          ) : (
            <div className="text-center py-10">
              <FolderIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">You don&apos;t have any documents or folders yet.</p>
              <Button variant="link" className="mt-2">Start by creating something new</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-center mt-12 p-6 bg-card border">
        <Image src="https://placehold.co/300x150.png" data-ai-hint="geometric abstract design" alt="Document organization illustration" width={300} height={150} className="mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Streamlined Organization</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Advanced tagging, filtering, and more robust drag-and-drop organization features are planned.
        </p>
      </div>
    </div>
  );
}
