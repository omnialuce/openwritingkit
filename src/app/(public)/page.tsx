// src/app/(public)/page.tsx
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Mail, BookOpenCheck, BarChart3, Users, Network } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  const features = [
    {
      title: "Powerful Editor",
      description: "A clean, distraction-free writing environment with auto-save and essential formatting tools.",
      icon: BookOpenCheck,
    },
    {
      title: "Character Development",
      description: "Create detailed character profiles and sheets to bring your cast to life.",
      icon: Users,
    },
    {
      title: "Plot & Outline Tools",
      description: "Structure your narrative with an intuitive outline builder and plot point tracker.",
      icon: Network,
    },
    {
      title: "Writing Analytics",
      description: "Understand your habits, track your progress, and set word count goals.",
      icon: BarChart3,
    },
  ];

  return (
    <div className="flex flex-col flex-1">
      <section className="grid md:grid-cols-2 gap-12 items-center py-12 lg:py-24">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Your Intelligent Writing Companion.</h1>
          <p className="text-lg text-muted-foreground">
            OpenWritingKit is a complete, open-source, and entirely free suite of tools designed to help writers plan, draft, and analyze their stories.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild>
              <Link href="/login">Get Started <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
        </div>
        <div className="hidden md:block">
          <Image
            src="/typewriter.svg"
            alt="Illustrative typewriter"
            width={500}
            height={400}
            className="mx-auto"
          />
        </div>
      </section>

      <section id="features" className="py-12 lg:py-24 bg-muted/50 -mx-6 sm:-mx-8 md:-mx-12 px-6 sm:px-8 md:px-12">
         <div className="container mx-auto max-w-3xl text-center space-y-4">
              <h2 className="text-3xl font-bold">Everything a Writer Needs</h2>
              <p className="text-muted-foreground">
                  From the first idea to the final draft, OpenWritingKit provides the tools to support your creative process.
              </p>
          </div>
          <div className="container mx-auto mt-12 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                  <Card key={feature.title} className="text-center">
                      <CardHeader>
                          <div className="mx-auto w-fit p-3 bg-primary/10 rounded-full mb-4">
                              <feature.icon className="h-8 w-8 text-primary" />
                          </div>
                          <CardTitle>{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                          <p className="text-muted-foreground">{feature.description}</p>
                      </CardContent>
                  </Card>
              ))}
          </div>
      </section>

      <section id="apply" className="py-12 lg:py-24">
         <Card className="max-w-2xl mx-auto">
           <CardHeader className="text-center">
             <CardTitle>Request Access</CardTitle>
             <CardDescription>
               Access to OpenWritingKit is currently managed manually. If you're interested in an account, please get in touch.
             </CardDescription>
           </CardHeader>
           <CardContent className="text-center">
              <Button asChild>
                  <a href="mailto:openwritingkit@gmail.com?subject=OpenWritingKit%20Access%20Request">
                      <Mail className="mr-2 h-4 w-4" /> Apply for an Account
                  </a>
              </Button>
               <p className="text-xs text-muted-foreground mt-4">Provide a brief reason for your interest in your email.</p>
           </CardContent>
         </Card>
      </section>
    </div>
  );
}
