// src/app/(public)/about/page.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Users } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">About OpenWritingKit</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Our mission is to provide powerful, accessible, and private writing tools for authors and creators everywhere.
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-12 items-center">
        <div>
           <Image
              src="/writer.svg"
              alt="Illustration of a person writing"
              width={500}
              height={400}
              className="mx-auto rounded-lg"
            />
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Info className="h-8 w-8 text-primary" />
                    <CardTitle>What We Do</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                OpenWritingKit is an open-source project born from a desire for a comprehensive writing application that respects user privacy. We believe that your stories, characters, and outlines are yours alone. That's why our primary mode of operation is local-first, with optional cloud features that you control.
              </p>
            </CardContent>
          </Card>
          <Card>
             <CardHeader>
                <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-primary" />
                    <CardTitle>Who We Are</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We are a community of developers, writers, and designers who are passionate about creating the best possible tools for storytelling. As an open-source project, we welcome contributions from everyone. Whether you're fixing a bug, suggesting a feature, or improving documentation, you're helping to build the future of writing.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}