import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderOpen, FilePlus2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";

export default function DocumentsPage() {
  const mockDocuments = [
    { id: "1", name: "Chapter 1: The Awakening", lastModified: "2 days ago", words: 2500 },
    { id: "2", name: "Character Bio: Anya Sharma", lastModified: "5 days ago", words: 800 },
    { id: "3", name: "World Notes: Eldoria", lastModified: "1 week ago", words: 15000 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Document Management</h1>
          <p className="text-muted-foreground">Organize, create, and manage all your writing projects.</p>
        </div>
        <Button>
          <FilePlus2 className="mr-2 h-5 w-5" /> Create New Document
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Your Documents</CardTitle>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search documents..." className="pl-8" />
            </div>
          </div>
          <CardDescription>
            Browse and manage your saved documents and writing projects. Folders and advanced organization coming soon!
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mockDocuments.length > 0 ? (
            <ul className="space-y-4">
              {mockDocuments.map((doc) => (
                <li key={doc.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-secondary/50 transition-colors">
                  <div>
                    <h3 className="font-semibold text-primary">{doc.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {doc.words} words - Last modified: {doc.lastModified}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Open</Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-10">
              <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">You don&apos;t have any documents yet.</p>
              <Button variant="link" className="mt-2">Create your first document</Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="text-center mt-12 p-6 bg-card rounded-lg">
        <Image src="https://placehold.co/400x200.png" data-ai-hint="file organization abstract" alt="Document organization illustration" width={400} height={200} className="mx-auto mb-4 rounded" />
        <h3 className="text-xl font-semibold mb-2">Advanced Organization Coming Soon!</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Soon you&apos;ll be able to create folders, tag documents, and utilize powerful search filters to keep your work perfectly organized.
        </p>
      </div>
    </div>
  );
}
