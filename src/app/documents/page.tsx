
// src/app/documents/page.tsx
'use client';

import { useState } from 'react';
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
} from "@/components/ui/alert-dialog"; // Removed AlertDialogTrigger as it's not directly used here, only via asChild

type DocumentStatus = "Draft" | "Revised" | "Complete";
type DocumentTag = "Draft" | "WIP" | "Review" | "Published" | "Idea" | "Research";


interface DocumentItem {
  id: string;
  name: string;
  type: "folder" | "chapter" | "scene" | "file";
  lastModified?: string; 
  words?: number; 
  itemCount?: number; 
  status?: DocumentStatus; // For scenes
  tags?: DocumentTag[];    // For all items
  children?: DocumentItem[];
}

const initialMockDocuments: DocumentItem[] = [
  { 
    id: "folder1", 
    name: "My Epic Novel", 
    type: "folder", 
    itemCount: 2, // Chapters
    tags: ["WIP"],
    children: [
      {
        id: "chapter1",
        name: "Chapter 1: The Awakening",
        type: "chapter",
        itemCount: 2, // Scenes
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
        itemCount: 1, // Scene
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
    itemCount: 1, // File
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

function DocumentListItem({ item, level = 0 }: { item: DocumentItem; level?: number }) {
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
        className="flex flex-col p-3 border-b hover:bg-secondary/50 transition-colors"
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
          <div className="mt-2 flex flex-wrap gap-1 pl-8"> {/* Adjust padding to align with icon/text */}
            {item.tags.map(tag => (
              <Badge key={tag} variant={getTagVariant(tag as DocumentTag)} className="text-xs">{tag}</Badge>
            ))}
          </div>
        )}
      </li>
      {isOpen && item.children && item.children.map(child => (
        <DocumentListItem key={child.id} item={child} level={level + 1} />
      ))}
    </>
  );
}


export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>(initialMockDocuments);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Document Management</h1>
          <p className="text-muted-foreground">Organize, create, and manage all your writing projects. Full drag & drop and tag editing are planned for future updates.</p>
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
            Browse and manage your work. Click on folders or chapters to expand/collapse.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length > 0 ? (
            <ul className="space-y-0 border-t"> 
              {documents.map((doc) => (
                <DocumentListItem key={doc.id} item={doc} />
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
          Advanced tagging, filtering, and drag-and-drop organization features are planned.
        </p>
      </div>
    </div>
  );
}
