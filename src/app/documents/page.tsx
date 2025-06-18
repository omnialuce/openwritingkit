import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderPlus, FilePlus2, Search, Folder as FolderIcon, FileText as FileTextIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";

interface DocumentItem {
  id: string;
  name: string;
  type: "folder" | "file";
  lastModified?: string; // Optional for folders
  words?: number; // Optional for folders
  itemCount?: number; // Optional for files
}

export default function DocumentsPage() {
  const mockDocuments: DocumentItem[] = [
    { id: "folder1", name: "My Epic Novel", type: "folder", itemCount: 2 },
    { id: "1", name: "Chapter 1: The Beginning", type: "file", lastModified: "2 days ago", words: 2500 },
    { id: "folder2", name: "Short Stories", type: "folder", itemCount: 1 },
    { id: "2", name: "The Old Lighthouse", type: "file", lastModified: "5 days ago", words: 800 },
    { id: "3", name: "Character Bio: Anya", type: "file", lastModified: "1 week ago", words: 1500 },
    { id: "folder3", name: "Research Notes", type: "folder", itemCount: 0 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Document Management</h1>
          <p className="text-muted-foreground">Organize, create, and manage all your writing projects.</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <FilePlus2 className="mr-2 h-5 w-5" /> Create Document
          </Button>
          <Button variant="outline">
            <FolderPlus className="mr-2 h-5 w-5" /> Create Folder
          </Button>
        </div>
      </div>

      <Card className="rounded-none">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <CardTitle>Your Files & Folders</CardTitle>
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-8 rounded-none" />
            </div>
          </div>
          <CardDescription>
            Browse and manage your work.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mockDocuments.length > 0 ? (
            <ul className="space-y-3">
              {mockDocuments.map((doc) => (
                <li key={doc.id} className="flex justify-between items-center p-3 border rounded-none hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    {doc.type === "folder" ? <FolderIcon className="h-5 w-5 text-primary" /> : <FileTextIcon className="h-5 w-5 text-primary" />}
                    <div>
                      <h3 className="font-semibold">{doc.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {doc.type === "file" ? `${doc.words} words - Last modified: ${doc.lastModified}` : `${doc.itemCount} item(s)`}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-none">Open</Button>
                </li>
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
      
      <div className="text-center mt-12 p-6 bg-card rounded-none border">
        <Image src="https://placehold.co/300x150.png" data-ai-hint="geometric abstract design" alt="Document organization illustration" width={300} height={150} className="mx-auto mb-4 rounded-none" />
        <h3 className="text-xl font-semibold mb-2">Streamlined Organization</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Advanced tagging and filtering features are planned to further enhance your workflow.
        </p>
      </div>
    </div>
  );
}
