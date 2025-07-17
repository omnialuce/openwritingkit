// src/app/(app)/resources/page.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Newspaper, Mic, ExternalLink, Lightbulb } from 'lucide-react';
import Link from 'next/link';

interface Resource {
  title: string;
  description: string;
  href: string;
  type: 'Article' | 'Podcast' | 'Tool' | 'Guide';
  icon: React.ElementType;
}

const resources: Resource[] = [
  {
    title: "NaNoWriMo",
    description: "Join the National Novel Writing Month challenge. A great community for motivation.",
    href: "https://nanowrimo.org/",
    type: "Guide",
    icon: BookOpen,
  },
  {
    title: "Reedsy Blog",
    description: "A wealth of articles on writing, editing, and publishing.",
    href: "https://blog.reedsy.com/",
    type: "Article",
    icon: Newspaper,
  },
  {
    title: "Writing Excuses Podcast",
    description: "Fifteen minutes long, because you're in a hurry, and we're not that smart.",
    href: "https://writingexcuses.com/",
    type: "Podcast",
    icon: Mic,
  },
  {
    title: "The Creative Penn",
    description: "Articles, podcast, and resources for authors on writing and the business of writing.",
    href: "https://www.thecreativepenn.com/",
    type: "Article",
    icon: Newspaper,
  },
  {
    title: "Helping Writers Become Authors",
    description: "K.M. Weiland's site offers deep insights into story structure and character arcs.",
    href: "https://www.helpingwritersbecomeauthors.com/",
    type: "Guide",
    icon: Lightbulb,
  },
  {
    title: "One Stop for Writers",
    description: "A powerhouse of tools and resources for writers, including thesauruses and character builders.",
    href: "https://onestopforwriters.com/",
    type: "Tool",
    icon: BookOpen,
  },
];

export default function ResourcesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <BookOpen className="mr-3 h-8 w-8 text-primary" />
          Writing Resources
        </h1>
        <p className="text-muted-foreground">A curated list of helpful articles, tools, and communities for writers.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {resources.map(resource => (
          <Card key={resource.title} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <resource.icon className="h-8 w-8 text-primary" />
                <span className="text-xs font-semibold bg-secondary text-secondary-foreground px-2 py-1 rounded-full">{resource.type}</span>
              </div>
              <CardTitle>{resource.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription>{resource.description}</CardDescription>
            </CardContent>
            <CardContent>
              <Link href={resource.href} target="_blank" rel="noopener noreferrer" passHref>
                <Button variant="outline" className="w-full">
                  Visit Site <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Have a suggestion?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This is an open-source project. If you have a resource you'd love to see here, consider contributing on GitHub!</p>
        </CardContent>
      </Card>
    </div>
  );
}
